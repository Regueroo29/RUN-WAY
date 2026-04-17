const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid token' });
  }
};

const generateToken = (user) => {
  return jwt.sign(
    { user_id: user.user_id, role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

module.exports = { authenticateToken, generateToken, JWT_SECRET };