require('dotenv').config();

const http = require('http');
const { Server } = require('socket.io');
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const mysql = require("mysql2");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { generateToken } = require('./middleware/auth');

// ========== CLOUDINARY SETUP ==========
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'aphronique',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [{ quality: 'auto' }]
  }
});

// Use Cloudinary in production, local disk in development
const isProduction = process.env.NODE_ENV === 'production';
let upload;

if (isProduction) {
  upload = multer({ 
    storage: cloudinaryStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith("image/")) cb(null, true);
      else cb(new Error("Only image files are allowed"));
    }
  });
} else {
  // Local development - keep your existing disk storage
  const uploadsDir = path.join(__dirname, "uploads");
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  
  const localStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  });
  
  upload = multer({ 
    storage: localStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith("image/")) cb(null, true);
      else cb(new Error("Only image files are allowed"));
    }
  });
}
// =====================================

const app = express();
const connectedUsers = new Map();

// ================= CONFIG =================
const PORT = process.env.PORT || 5000;
const DB_HOST = process.env.DB_HOST || "localhost";
const DB_USER = process.env.DB_USER || "root";
const DB_PASSWORD = process.env.DB_PASSWORD || "";
const DB_NAME = process.env.DB_NAME || "aphronique_db";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

console.log("🔧 Config:", { PORT, DB_HOST, FRONTEND_URL, NODE_ENV: process.env.NODE_ENV });

// ========== CORS (Multi-Origin) ==========
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://aphronique.com',
  'https://www.aphronique.com',
  'https://run-way-8aes.vercel.app',  // <-- ADDED for Vercel preview (temporary) - replace with actual domain when ready
  'https://aphronique.vercel.app'      // <-- ADDED this too (for future)
];

// Add Vercel preview URLs dynamically
if (process.env.VERCEL_URL) {
  allowedOrigins.push(`https://${process.env.VERCEL_URL}`);
}

// app.use(cors({
//   origin: function(origin, callback) {
//     if (!origin) return callback(null, true);
//     if (allowedOrigins.indexOf(origin) === -1) {
//       console.log('CORS blocked:', origin);
//       return callback(new Error('CORS policy violation'), false);
//     }
//     return callback(null, true);
//   },
//   credentials: true
// }));

app.use(cors({
  origin: true,  // Allows ALL origins - uncomment above for strict CORS in production
  credentials: true
}));

app.use(express.json());

// Static files (local only - production uses Cloudinary URLs directly)
// -- changed to cloud
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MySQL connection
const db = mysql.createPool({
  host: DB_HOST,
  port: process.env.DB_PORT || 3306,  // <-- THIS LINE for TiDB port 4000
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: isProduction ? { rejectUnauthorized: false } : false  // <-- TiDB 
});

global.db = db;

// Import admin routes
const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

// Test connection
db.getConnection((err, connection) => {
  if (err) console.error("❌ Database connection failed:", err);
  else {
    console.log("✅ MySQL Connected!");
    connection.release();
  }
});

// Helper: Log activity
const logActivity = (user_id, action_type, target_id = null, details = '') => {
  db.query(
    "INSERT INTO activity_logs (user_id, action_type, target_id, details) VALUES (?, ?, ?, ?)",
    [user_id, action_type, target_id, details],
    (err) => { if (err) console.log("Activity log error:", err); }
  );
};

// Helper: Get full image URL
const getImageUrl = (pathOrUrl) => {
  if (!pathOrUrl) return null;
  if (pathOrUrl.startsWith('http')) return pathOrUrl; // Already Cloudinary URL
  return `${BASE_URL}${pathOrUrl}`; // Local URL
};

// ================= AUTH =================
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT user_id, username, email, password, role, bio, brand_name, specialty, location, website, instagram, facebook, twitter, avatar_url, status, suspension_reason, suspension_end_date FROM users WHERE email = ?",
    [email],
    async (err, result) => {
      if (err) {
        return res.status(500).json({ 
          success: false,
          error: "server",
          message: "Server error. Please try again later." 
        });
      }

      if (result.length === 0) {
        return res.status(401).json({ 
          success: false,
          error: "email",
          message: "Wrong email" 
        });
      }

      const user = result[0];

      if (user.status === 'suspended') {
        const now = new Date();
        const endDate = user.suspension_end_date ? new Date(user.suspension_end_date) : null;
        
        if (endDate && endDate < now) {
          db.query("UPDATE users SET status='active', suspension_reason=NULL, suspension_end_date=NULL WHERE user_id=?", [user.user_id]);
          user.status = 'active';
        } else if (!endDate) {
          return res.status(403).json({ 
            success: false,
            error: "suspended",
            message: "Account permanently suspended", 
            reason: user.suspension_reason 
          });
        } else {
          return res.status(403).json({ 
            success: false,
            error: "suspended",
            message: "Account suspended", 
            reason: user.suspension_reason,
            until: user.suspension_end_date 
          });
        }
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).json({ 
          success: false,
          error: "password",
          message: "Wrong password" 
        });
      }

      const token = generateToken(user);
      logActivity(user.user_id, 'login');
      
      res.json({
        success: true,
        message: "Login successful",
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role,
        bio: user.bio,
        brand_name: user.brand_name,
        specialty: user.specialty,
        location: user.location,
        website: user.website,
        instagram: user.instagram,
        facebook: user.facebook,
        twitter: user.twitter,
        avatar_url: getImageUrl(user.avatar_url),
        status: user.status,
        suspension_reason: user.suspension_reason,
        suspension_end_date: user.suspension_end_date,
        token: token
      });
    }
  );
});

app.post("/api/register", async (req, res) => {
  const { username, email, password, first_name, last_name, role } = req.body;
  
  try {
    // Check if email exists
    const [existing] = await db.promise().query(
      "SELECT * FROM users WHERE email = ?", [email]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert user
    const [result] = await db.promise().query(
      "INSERT INTO users (username, email, password, first_name, last_name, role) VALUES (?, ?, ?, ?, ?, ?)",
      [username, email, hashedPassword, first_name, last_name, role || 'user']
    );
    
    res.json({ success: true, message: "Registration successful", user_id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ================= USER PROFILE =================
app.get("/api/users/:id", (req, res) => {
  const userId = req.params.id;
  db.query(
    `SELECT user_id, username, email, role, bio, brand_name, specialty, location, 
     website, instagram, facebook, twitter, avatar_url, created_at 
     FROM users WHERE user_id = ?`,
    [userId],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.length === 0) return res.status(404).json({ error: "User not found" });
      
      const userData = result[0];
      userData.avatar_url = getImageUrl(userData.avatar_url);
      
      db.query(
        "SELECT COUNT(*) as follower_count FROM follows WHERE designer_id = ?",
        [userId],
        (err, followResult) => {
          if (err) return res.status(500).json({ error: err.message });
          userData.follower_count = followResult[0].follower_count;
          res.json(userData);
        }
      );
    }
  );
});

// Update profile
app.put("/api/users/:id/profile", (req, res) => {
  const userId = req.params.id;
  const { bio, brand_name, specialty, location, website, instagram, facebook, twitter } = req.body;
  
  db.query(
    `UPDATE users SET 
     bio = ?, brand_name = ?, specialty = ?, location = ?, 
     website = ?, instagram = ?, facebook = ?, twitter = ? 
     WHERE user_id = ?`,
    [bio || null, brand_name || null, specialty || null, location || null, 
     website || null, instagram || null, facebook || null, twitter || null, userId],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      logActivity(userId, 'update_profile');
      res.json({ message: "Profile updated successfully" });
    }
  );
});

// Upload avatar
app.post("/api/users/:id/avatar", upload.single("avatar"), (req, res) => {
  const userId = req.params.id;
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  
  // Cloudinary returns full URL in req.file.path, local returns path
  const avatarUrl = isProduction ? req.file.path : `/uploads/${req.file.filename}`;
  
  db.query(
    "UPDATE users SET avatar_url = ? WHERE user_id = ?",
    [avatarUrl, userId],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ 
        message: "Avatar updated", 
        avatar_url: getImageUrl(avatarUrl)
      });
    }
  );
});

// ================= DESIGNS =================
app.get("/api/designs", (req, res) => {
  const userId = req.query.userId;
  
  let query = `
    SELECT d.*, u.username as designer_name, u.brand_name, u.avatar_url as designer_avatar,
           (SELECT AVG(rating) FROM ratings WHERE design_id = d.design_id) as avg_rating,
           (SELECT COUNT(*) FROM ratings WHERE design_id = d.design_id) as rating_count,
           (SELECT COUNT(*) FROM likes WHERE design_id = d.design_id) as like_count
    FROM designs d
    JOIN users u ON d.designer_id = u.user_id
    ORDER BY d.created_at DESC
  `;
  
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    
    results.forEach(design => {
      design.designer_avatar = getImageUrl(design.designer_avatar);
      design.image_url = getImageUrl(design.image_url);
    });
    
    if (userId && results.length > 0) {
      const designIds = results.map(d => d.design_id);
      
      db.query(
        "SELECT design_id FROM likes WHERE user_id = ? AND design_id IN (?)",
        [userId, designIds],
        (err, likes) => {
          if (err) return res.status(500).json({ error: err.message });
          
          const likedIds = likes.map(l => l.design_id);
          
          db.query(
            "SELECT design_id, rating FROM ratings WHERE user_id = ? AND design_id IN (?)",
            [userId, designIds],
            (err, ratings) => {
              if (err) return res.status(500).json({ error: err.message });
              
              const ratingMap = {};
              ratings.forEach(r => ratingMap[r.design_id] = r.rating);
              
              results.forEach(design => {
                design.is_liked = likedIds.includes(design.design_id);
                design.user_rating = ratingMap[design.design_id] || null;
              });
              
              res.json(results);
            }
          );
        }
      );
    } else {
      res.json(results);
    }
  });
});

app.get("/api/designs/designer/:designerId", (req, res) => {
  const designerId = req.params.designerId;
  db.query(
    `SELECT d.*, 
     (SELECT AVG(rating) FROM ratings WHERE design_id = d.design_id) as avg_rating,
     (SELECT COUNT(*) FROM ratings WHERE design_id = d.design_id) as rating_count,
     (SELECT COUNT(*) FROM likes WHERE design_id = d.design_id) as like_count
     FROM designs d 
     WHERE d.designer_id = ? 
     ORDER BY d.created_at DESC`,
    [designerId],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      results.forEach(d => d.image_url = getImageUrl(d.image_url));
      res.json(results);
    }
  );
});

// Create design (upload)
app.post("/api/designs", upload.single("image"), (req, res) => {
  const { designer_id, title, description, season } = req.body;
  
  if (!req.file) return res.status(400).json({ error: "No image uploaded" });
  
  const imageUrl = isProduction ? req.file.path : `/uploads/${req.file.filename}`;
  
  db.query(
    "INSERT INTO designs (designer_id, title, description, image_url, season) VALUES (?, ?, ?, ?, ?)",
    [designer_id, title, description, imageUrl, season],
    (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: err.message });
      }
      
      logActivity(designer_id, 'upload_design', result.insertId, `Uploaded: ${title}`);
      
      const designData = {
        design_id: result.insertId,
        designer_id,
        title,
        description,
        season,
        image_url: getImageUrl(imageUrl),
        created_at: new Date().toISOString()
      };
      
      if (global.io) global.io.emit('design_uploaded', designData);
      
      res.json({ 
        message: "Design uploaded successfully", 
        design_id: result.insertId,
        image_url: getImageUrl(imageUrl)
      });
    }
  );
});

// Update design with new image
app.post("/api/designs/:id/update-with-image", upload.single("image"), async (req, res) => {
  const designId = req.params.id;
  const { designer_id, title, description, season } = req.body;
  
  try {
    const [oldDesign] = await db.promise().query(
      "SELECT image_url FROM designs WHERE design_id = ? AND designer_id = ?",
      [designId, designer_id]
    );
    
    let updateQuery, params;
    
    if (req.file) {
      const newImageUrl = isProduction ? req.file.path : `/uploads/${req.file.filename}`;
      updateQuery = `UPDATE designs SET title = ?, description = ?, season = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP WHERE design_id = ? AND designer_id = ?`;
      params = [title, description, season, newImageUrl, designId, designer_id];
    } else {
      updateQuery = `UPDATE designs SET title = ?, description = ?, season = ?, updated_at = CURRENT_TIMESTAMP WHERE design_id = ? AND designer_id = ?`;
      params = [title, description, season, designId, designer_id];
    }
    
    const [result] = await db.promise().query(updateQuery, params);
    
    if (result.affectedRows === 0) {
      return res.status(403).json({ error: "Unauthorized or design not found" });
    }
    
    res.json({ message: "Design updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ... keep all your other routes (likes, ratings, follows, etc.) exactly the same ...

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    connectedUsers.delete(socket.userId);
  });
});

global.io = io;

server.listen(PORT, () => {
  console.log(`🚀 Aphronique API running on port ${PORT}`);
});