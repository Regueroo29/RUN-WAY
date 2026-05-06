const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const helmet = require('helmet');           // npm install helmet
const compression = require('compression');  // npm install compression
const rateLimit = require('express-rate-limit'); // npm install express-rate-limit

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// 🔴 SECURITY & PERFORMANCE MIDDLEWARE (ADD THESE)
app.use(helmet({
    contentSecurityPolicy: false, // Adjust if needed for your frontend
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(compression()); // Gzip compression
app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS — restrict to your actual frontend domain in production
const allowedOrigins = [
    'http://localhost:5173', // Vite dev server
    'https://aphronique.vercel.app', // Your deployed frontend
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            return callback(new Error('CORS policy violation'), false);
        }
        return callback(null, true);
    },
    credentials: true
}));

// 🔴 DATABASE: Use CONNECTION POOL (CRITICAL for TiDB)
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 4000,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    
    // FREE TIER: Just enable SSL — Node.js handles the CA automatically
    ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true  // Verifies server cert using built-in Mozilla CA
    },
    
    // Small pool for free Render 512MB
    connectionLimit: 3,
    waitForConnections: true,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000
});

// Test DB connection on startup
pool.getConnection()
    .then(conn => {
        console.log('✅ TiDB connected successfully');
        conn.release();
    })
    .catch(err => {
        console.error('❌ TiDB connection failed:', err.message);
        process.exit(1);
    });

// Export pool for routes
app.locals.db = pool;

// 🔴 FILE UPLOAD: Move to Cloudinary (recommended)
// For now, optimize local upload with limits
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) return cb(null, true);
        cb(new Error('Only image files are allowed'));
    }
});

// Serve uploads statically (temporary — move to CDN)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 🔴 ROUTES — Import your existing routes but pass pool
const authMiddleware = require('./middleware/auth');
const adminRoutes = require('./routes/admin');

// Health check endpoint
app.get('/api/health', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT 1');
        res.json({ status: 'OK', database: 'connected', timestamp: new Date().toISOString() });
    } catch (err) {
        res.status(503).json({ status: 'ERROR', database: 'disconnected', error: err.message });
    }
});

// Mount routes
app.use('/api/admin', authMiddleware, adminRoutes); // Add auth middleware

// 🔴 ERROR HANDLING (ADD THIS)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
});