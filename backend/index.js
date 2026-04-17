require('dotenv').config(); // This MUST be first!

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
const connectedUsers = new Map();


const app = express();

// ================= CONFIG FROM .ENV =================
const PORT = process.env.PORT || 5000;
const DB_HOST = process.env.DB_HOST || "localhost";
const DB_USER = process.env.DB_USER || "root";
const DB_PASSWORD = process.env.DB_PASSWORD || "IRyStocrats12";
const DB_NAME = process.env.DB_NAME || "runway_db";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

console.log("🔧 Config:", { PORT, DB_HOST, FRONTEND_URL }); // Debug line

// Middleware
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));
app.use(express.json());

// Static files for uploads
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use("/uploads", express.static(uploadsDir));

// Multer config for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  }
});

// MySQL connection using env variables
const db = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Make db accessible to routes
global.db = db;

// Import admin routes
const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

// Test connection
db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Database connection failed:", err);
  } else {
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

// ================= AUTH =================

app.post("/api/register", async (req, res) => {
  const { username, email, password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.query(
      "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
      [username, email, hashedPassword, role || 'visitor'],
      (err, result) => {
        if (err) {
          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: "Email already exists" });
          }
          return res.status(500).json({ error: err.message });
        }
        logActivity(result.insertId, 'register', null, `New ${role || 'visitor'} registered`);
        res.json({ message: "User registered", user_id: result.insertId });
      }
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  db.query(
    "SELECT user_id, username, email, password, role, bio, brand_name, specialty, location, website, instagram, facebook, twitter, avatar_url, status, suspension_reason, suspension_end_date FROM users WHERE email = ?",
    [email],
    async (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.length === 0) return res.status(401).json({ error: "User not found" });
      
      const user = result[0];
      
      // Check if suspended
      if (user.status === 'suspended') {
        if (user.suspension_end_date && new Date(user.suspension_end_date) > new Date()) {
          return res.status(403).json({ 
            error: "Account suspended", 
            reason: user.suspension_reason,
            until: user.suspension_end_date 
          });
        } else if (!user.suspension_end_date) {
          return res.status(403).json({ 
            error: "Account permanently suspended", 
            reason: user.suspension_reason 
          });
        }
      }
      
      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(401).json({ error: "Invalid password" });

      const token = generateToken(user);
      logActivity(user.user_id, 'login');
      
      res.json({
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
        avatar_url: user.avatar_url ? `http://localhost:${PORT}${user.avatar_url}` : null,
        status: user.status,
        suspension_reason: user.suspension_reason,
        suspension_end_date: user.suspension_end_date,
        token: generateToken(user) // Send token to client
      });
    }
  );
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
      if (userData.avatar_url) {
        userData.avatar_url = `http://localhost:${PORT}${userData.avatar_url}`;
      }
      
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

// Update profile (FIXED - includes all fields)
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

// Upload avatar (NEW)
app.post("/api/users/:id/avatar", upload.single("avatar"), (req, res) => {
  const userId = req.params.id;
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  
  const avatarUrl = `/uploads/${req.file.filename}`;
  
  db.query(
    "UPDATE users SET avatar_url = ? WHERE user_id = ?",
    [avatarUrl, userId],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ 
        message: "Avatar updated", 
        avatar_url: `http://localhost:${PORT}${avatarUrl}` 
      });
    }
  );
});

// Switch role (FIXED)
app.post("/api/users/:id/switch-role", (req, res) => {
  const userId = req.params.id;
  const { new_role } = req.body;
  
  if (!['visitor', 'designer', 'admin'].includes(new_role)) {
    return res.status(400).json({ error: "Invalid role" });
  }
  
  db.query(
    "UPDATE users SET role = ? WHERE user_id = ?",
    [new_role, userId],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ error: "User not found" });
      
      logActivity(userId, 'switch_role', null, `Switched to ${new_role}`);
      res.json({ message: "Role updated successfully", new_role });
    }
  );
});

// ================= DESIGNS =================

// Get all designs
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
    
    // Format avatar URLs to be full paths
    results.forEach(design => {
      if (design.designer_avatar && !design.designer_avatar.startsWith('http')) {
        design.designer_avatar = `http://localhost:${PORT}${design.designer_avatar}`;
      }
      if (design.image_url && !design.image_url.startsWith('http')) {
        design.image_url = `http://localhost:${PORT}${design.image_url}`;
      }
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
      res.json(results);
    }
  );
});

// Update design with new image
app.post("/api/designs/:id/update-with-image", upload.single("image"), async (req, res) => {
  const designId = req.params.id;
  const { designer_id, title, description, season } = req.body;
  
  try {
    // Get old design to delete old image (optional cleanup)
    const [oldDesign] = await db.promise().query(
      "SELECT image_url FROM designs WHERE design_id = ? AND designer_id = ?",
      [designId, designer_id]
    );
    
    // Build update query
    let updateQuery, params;
    
    if (req.file) {
      // New image uploaded
      const newImageUrl = `/uploads/${req.file.filename}`;
      updateQuery = `UPDATE designs SET title = ?, description = ?, season = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP WHERE design_id = ? AND designer_id = ?`;
      params = [title, description, season, newImageUrl, designId, designer_id];
      
      // Optional: Delete old image file to save space
      if (oldDesign.length > 0 && oldDesign[0].image_url) {
        const oldPath = path.join(__dirname, oldDesign[0].image_url);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
    } else {
      // No new image
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

app.put("/api/designs/:id", (req, res) => {
  const designId = req.params.id;
  const { designer_id, title, description, season } = req.body;
  
  db.query(
    "SELECT designer_id FROM designs WHERE design_id = ?",
    [designId],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.length === 0) return res.status(404).json({ error: "Design not found" });
      if (result[0].designer_id != designer_id) return res.status(403).json({ error: "Unauthorized" });
      
      db.query(
        "UPDATE designs SET title = ?, description = ?, season = ?, updated_at = CURRENT_TIMESTAMP WHERE design_id = ?",
        [title, description, season, designId],
        (err) => {
          if (err) return res.status(500).json({ error: err.message });
          logActivity(designer_id, 'edit_design', designId, `Edited: ${title}`);
          res.json({ message: "Design updated" });
        }
      );
    }
  );
});

app.delete("/api/designs/:id", (req, res) => {
  const designId = req.params.id;
  const designerId = req.query.designerId;
  
  db.query(
    "DELETE FROM designs WHERE design_id = ? AND designer_id = ?",
    [designId, designerId],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) return res.status(403).json({ error: "Unauthorized or not found" });
      
      logActivity(designerId, 'delete_design', designId);
      res.json({ message: "Design deleted" });
    }
  );
});

// ================= CREATE DESIGN (UPLOAD) =================
app.post("/api/designs", upload.single("image"), (req, res) => {
  const { designer_id, title, description, season } = req.body;
  
  if (!req.file) {
    return res.status(400).json({ error: "No image uploaded" });
  }
  
  const imageUrl = `/uploads/${req.file.filename}`;
  
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
        image_url: `http://localhost:${PORT}${imageUrl}`,
        created_at: new Date().toISOString()
      };
      
      // Broadcast to all connected clients
      if (global.io) {
        global.io.emit('design_uploaded', designData);
      }
      
      res.json({ 
        message: "Design uploaded successfully", 
        design_id: result.insertId,
        image_url: `http://localhost:${PORT}${imageUrl}`
      });
    }
  );
});

// ================= LIKES =================

app.post("/api/likes/toggle", (req, res) => {
  const { user_id, design_id } = req.body;
  
  db.query(
    "SELECT * FROM likes WHERE user_id = ? AND design_id = ?",
    [user_id, design_id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      
      if (result.length > 0) {
        db.query(
          "DELETE FROM likes WHERE user_id = ? AND design_id = ?",
          [user_id, design_id],
          (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ liked: false, message: "Unliked" });
          }
        );
      } else {
        db.query(
          "INSERT INTO likes (user_id, design_id) VALUES (?, ?)",
          [user_id, design_id],
          (err) => {
            if (err) return res.status(500).json({ error: err.message });
            logActivity(user_id, 'like_design', design_id);
            res.json({ liked: true, message: "Liked" });
          }
        );
      }
    }
  );
});

app.get("/api/users/:id/likes", (req, res) => {
  const userId = req.params.id;
  db.query(
    `SELECT d.*, u.username as designer_name 
     FROM likes l
     JOIN designs d ON l.design_id = d.design_id
     JOIN users u ON d.designer_id = u.user_id
     WHERE l.user_id = ?
     ORDER BY l.created_at DESC`,
    [userId],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});

// ================= RATINGS =================

app.post("/api/ratings", (req, res) => {
  const { user_id, design_id, rating } = req.body;
  
  if (rating < 1 || rating > 5) return res.status(400).json({ error: "Rating must be 1-5" });
  
  db.query(
    "SELECT * FROM ratings WHERE user_id = ? AND design_id = ?",
    [user_id, design_id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      
      if (result.length > 0) {
        db.query(
          "UPDATE ratings SET rating = ? WHERE user_id = ? AND design_id = ?",
          [rating, user_id, design_id],
          (err) => {
            if (err) return res.status(500).json({ error: err.message });
            logActivity(user_id, 'rate_design', design_id, `Rated ${rating} stars`);
            res.json({ message: "Rating updated" });
          }
        );
      } else {
        db.query(
          "INSERT INTO ratings (user_id, design_id, rating) VALUES (?, ?, ?)",
          [user_id, design_id, rating],
          (err) => {
            if (err) return res.status(500).json({ error: err.message });
            logActivity(user_id, 'rate_design', design_id, `Rated ${rating} stars`);
            res.json({ message: "Rating added" });
          }
        );
      }
    }
  );
});

// ================= FOLLOWS =================

app.post("/api/follows/toggle", (req, res) => {
  const { follower_id, designer_id } = req.body;
  
  if (follower_id == designer_id) {
    return res.status(400).json({ error: "Cannot follow yourself" });
  }
  
  db.query(
    "SELECT * FROM follows WHERE follower_id = ? AND designer_id = ?",
    [follower_id, designer_id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      
      if (result.length > 0) {
        db.query(
          "DELETE FROM follows WHERE follower_id = ? AND designer_id = ?",
          [follower_id, designer_id],
          (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ following: false });
          }
        );
      } else {
        db.query(
          "INSERT INTO follows (follower_id, designer_id) VALUES (?, ?)",
          [follower_id, designer_id],
          (err) => {
            if (err) return res.status(500).json({ error: err.message });
            logActivity(follower_id, 'follow', designer_id);
            res.json({ following: true });
          }
        );
      }
    }
  );
});

// Check follow status
app.get("/api/follows/check", (req, res) => {
  const { follower_id, designer_id } = req.query;
  
  if (!follower_id || !designer_id) {
    return res.status(400).json({ error: "Missing parameters" });
  }
  
  db.query(
    "SELECT * FROM follows WHERE follower_id = ? AND designer_id = ?",
    [follower_id, designer_id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ following: result.length > 0 });
    }
  );
});

// Health check (cloud requirement)
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// ================= PASSWORD CHANGE =================
app.put("/api/users/:id/password", async (req, res) => {
  const userId = req.params.id;
  const { currentPassword, newPassword } = req.body;
  
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }
  
  db.query("SELECT password FROM users WHERE user_id = ?", [userId], async (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) return res.status(404).json({ error: "User not found" });
    
    const match = await bcrypt.compare(currentPassword, result[0].password);
    if (!match) return res.status(401).json({ error: "Current password is incorrect" });
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    db.query("UPDATE users SET password = ? WHERE user_id = ?", [hashedPassword, userId], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      logActivity(userId, 'password_change');
      res.json({ message: "Password updated successfully" });
    });
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
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
  console.log(`🚀 Server running on port ${PORT}`);
});