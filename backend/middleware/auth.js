const jwt = require('jsonwebtoken');

// Simple in-memory cache for decoded tokens (prevents re-decoding same token)
const tokenCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }

        const token = authHeader.split(' ')[1];
        
        // Check cache first
        const cached = tokenCache.get(token);
        if (cached && cached.expires > Date.now()) {
            req.user = cached.user;
            return next();
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET, {
            algorithms: ['HS256'], // Explicitly specify algorithm
            maxAge: '7d' // Match your JWT expiry
        });

        // Cache decoded user
        tokenCache.set(token, {
            user: decoded,
            expires: Date.now() + CACHE_TTL
        });

        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired. Please log in again.', code: 'TOKEN_EXPIRED' });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token.', code: 'TOKEN_INVALID' });
        }
        res.status(500).json({ error: 'Authentication error.' });
    }
};

// Optional: Role-based access control
const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
        next();
    };
};

module.exports = authMiddleware;
module.exports.requireRole = requireRole;