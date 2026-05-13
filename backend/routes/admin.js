
const express = require('express');
const router = express.Router();

// Use the same BASE_URL logic as your main index.js
const BASE_URL = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;

// Helper: Get full image URL (same as index.js)
const getImageUrl = (pathOrUrl) => {
  if (!pathOrUrl) return null;
  if (pathOrUrl.startsWith('http')) return pathOrUrl; // Already Cloudinary URL
  return `${BASE_URL}${pathOrUrl}`; // Local URL
};

// Middleware to check admin (simple version using query param or header)
const isAdmin = async (req, res, next) => {
  try {
    const userId = req.headers['user-id'] || req.query.adminId;
    if (!userId) return res.status(401).json({ error: 'Not authenticated' });
    
    const [users] = await global.db.promise().query('SELECT role FROM users WHERE user_id = ?', [userId]);
    if (users.length === 0 || users[0].role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all users
router.get('/users', async (req, res) => {
  try {
    const [users] = await global.db.promise().query(
      `SELECT u.*, 
        (SELECT COUNT(*) FROM designs WHERE designer_id = u.user_id) as design_count,
        (SELECT COUNT(*) FROM likes WHERE user_id = u.user_id) as like_count,
        (SELECT COUNT(*) FROM follows WHERE designer_id = u.user_id) as follower_count
      FROM users u ORDER BY u.created_at DESC`
    );
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all designs
router.get('/designs', async (req, res) => {
  try {
    const [designs] = await global.db.promise().query(
      `SELECT d.*, u.username as designer_name,
        (SELECT COUNT(*) FROM likes WHERE design_id = d.design_id) as like_count,
        (SELECT AVG(rating) FROM ratings WHERE design_id = d.design_id) as avg_rating
      FROM designs d JOIN users u ON d.designer_id = u.user_id ORDER BY d.created_at DESC`
    );
    
    // FIXED: Use getImageUrl helper instead of hardcoded localhost
    designs.forEach(design => {
      design.image_url = getImageUrl(design.image_url);
    });
    
    res.json(designs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper: Log to activity_logs
const logActivity = (user_id, action_type, target_id = null, details = '') => {
  global.db.promise().query(
    "INSERT INTO activity_logs (user_id, action_type, target_id, details) VALUES (?, ?, ?, ?)",
    [user_id, action_type, target_id, details]
  ).catch(err => console.log("Activity log error:", err));
};

// Get activities
router.get('/activities', async (req, res) => {
  try {
    const { filter } = req.query;
    
    let query = `SELECT al.*, u.username FROM activity_logs al
      JOIN users u ON al.user_id = u.user_id`;
    
    if (filter === 'posts') {
      query += ` WHERE al.action_type IN ('upload_design', 'update_design', 'delete_design')`;
    } else if (filter === 'updates') {
      query += ` WHERE al.action_type IN ('update_profile', 'password_change', 'switch_role')`;
    } else if (filter === 'interactions') {
      query += ` WHERE al.action_type IN ('like_design', 'unlike_design', 'follow', 'unfollow', 'rate_design', 'comment', 'delete_comment')`;
    } else if (filter === 'moderation') {
      query += ` WHERE al.action_type IN ('hide_design', 'unhide_design', 'suspend', 'unsuspend', 'delete_design')`;
    }
    
    query += ` ORDER BY al.created_at DESC LIMIT 100`;
    
    const [activities] = await global.db.promise().query(query);
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get User Details with Designs
router.get('/users/:id/details', async (req, res) => {
  try {
    const userId = req.params.id;
    const [users] = await global.db.promise().query(
      `SELECT u.*, a.username as moderated_by_name,
        (SELECT COUNT(*) FROM designs WHERE designer_id = u.user_id) as design_count,
        (SELECT COUNT(*) FROM likes WHERE user_id = u.user_id) as like_count,
        (SELECT COUNT(*) FROM follows WHERE designer_id = u.user_id) as follower_count
      FROM users u LEFT JOIN users a ON u.moderated_by = a.user_id WHERE u.user_id = ?`, [userId]
    );
    
    if (users.length === 0) return res.status(404).json({ error: 'User not found' });
    
    // Get designs with formatted image URLs
    const [designs] = await global.db.promise().query(
      `SELECT d.* FROM designs d WHERE d.designer_id = ? ORDER BY d.created_at DESC`, [userId]
    );
    
    // FIXED: Use getImageUrl helper
    designs.forEach(design => {
      design.image_url = getImageUrl(design.image_url);
    });
    
    const [history] = await global.db.promise().query(
      `SELECT m.*, u.username as admin_name FROM moderation_logs m
      JOIN users u ON m.admin_id = u.user_id WHERE m.target_type = 'user' AND m.target_id = ?`, [userId]
    );
    
    res.json({ user: users[0], designs, moderation_history: history });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Suspend User
router.post('/users/:id/suspend', async (req, res) => {
  try {
    const userId = req.params.id;
    const { reason, duration_days } = req.body;
    const adminId = req.headers['user-id'] || req.user?.user_id;
    
    if (!reason) return res.status(400).json({ error: 'Reason required' });
    
    // FIX: Format date properly for MySQL/TiDB
    let suspensionEnd = null;
    if (duration_days && !isNaN(duration_days)) {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + parseInt(duration_days));
      suspensionEnd = endDate.toISOString().slice(0, 19).replace('T', ' '); // MySQL datetime format
    }
    
    await global.db.promise().query(
      `UPDATE users SET status='suspended', suspension_reason=?, suspension_end_date=?, moderated_by=?, moderated_at=NOW() WHERE user_id=?`,
      [reason, suspensionEnd, adminId || null, userId]
    );
    
    // Only log if we have a valid adminId
    if (adminId) {
      await global.db.promise().query(
        `INSERT INTO moderation_logs (admin_id, target_type, target_id, action, reason) VALUES (?, 'user', ?, 'suspend', ?)`,
        [adminId, userId, reason]
      );
    }
    
    if (global.io) {
      global.io.to(`user_${userId}`).emit('account_suspended', {
        reason: reason,
        until: suspensionEnd,
        message: `Account suspended ${duration_days ? `for ${duration_days} days` : 'permanently'}. Reason: ${reason}`
      });
    }
    
    logActivity(userId, 'suspend', null, `Suspended by admin. Reason: ${reason}`);

    res.json({ message: 'User suspended' });
  } catch (error) {
    console.error('Suspend error:', error);
    res.status(500).json({ error: error.message, details: error.sqlMessage || 'No SQL details' });
  }
});

// Unsuspend User
router.post('/users/:id/unsuspend', async (req, res) => {
  try {
    const userId = req.params.id;
    const adminId = req.headers['user-id'] || req.user?.user_id;
    
    await global.db.promise().query(
      `UPDATE users SET status='active', suspension_reason=NULL, suspension_end_date=NULL WHERE user_id=?`,
      [userId]
    );
    
    if (adminId) {
      await global.db.promise().query(
        `INSERT INTO moderation_logs (admin_id, target_type, target_id, action, reason) VALUES (?, 'user', ?, 'unsuspend', 'Reinstated')`,
        [adminId, userId]
      );
    }
    
    await global.db.promise().query(
      `INSERT INTO user_notifications (user_id, type, message) VALUES (?, 'warning', 'Suspension lifted')`,
      [userId]
    );

    logActivity(userId, 'unsuspend', null, 'Unsuspended by admin');
    
    res.json({ message: 'User unsuspended' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Design Details
router.get('/designs/:id/details', async (req, res) => {
  try {
    const designId = req.params.id;
    const [designs] = await global.db.promise().query(
      `SELECT d.*, u.username, u.email, u.status as user_status, a.username as moderated_by_name,
        (SELECT COUNT(*) FROM likes WHERE design_id = d.design_id) as like_count,
        (SELECT AVG(rating) FROM ratings WHERE design_id = d.design_id) as avg_rating
      FROM designs d 
      JOIN users u ON d.designer_id = u.user_id
      LEFT JOIN users a ON d.moderated_by = a.user_id 
      WHERE d.design_id = ?`, [designId]
    );
    
    if (designs.length === 0) return res.status(404).json({ error: 'Design not found' });
    
    // FIXED: Use getImageUrl helper
    designs[0].image_url = getImageUrl(designs[0].image_url);
    
    const [history] = await global.db.promise().query(
      `SELECT m.*, u.username as admin_name 
      FROM moderation_logs m
      JOIN users u ON m.admin_id = u.user_id 
      WHERE m.target_type = 'design' AND m.target_id = ?`, [designId]
    );
    
    res.json({ design: designs[0], moderation_history: history });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Moderate Design
router.post('/designs/:id/moderate', async (req, res) => {
  try {
    const designId = req.params.id;
    const { action, reason } = req.body;
    const adminId = req.headers['user-id'] || req.user?.user_id;
    
    if (action === 'delete') {
      // Get designer_id BEFORE deleting
      const [designInfo] = await global.db.promise().query(
        'SELECT designer_id, title FROM designs WHERE design_id = ?', [designId]
      );
      
      await global.db.promise().query('DELETE FROM designs WHERE design_id = ?', [designId]);

        if (global.io) {
          global.io.emit('design_deleted', { 
            design_id: parseInt(designId),
            designer_id: designInfo.length > 0 ? designInfo[0].designer_id : null
          });
        }
      
      if (adminId) {
        await global.db.promise().query(
          `INSERT INTO moderation_logs (admin_id, target_type, target_id, action, reason) VALUES (?, 'design', ?, 'delete', ?)`,
          [adminId, designId, reason]
        );
      }
      
      if (designInfo.length > 0) {
        logActivity(designInfo[0].designer_id, 'delete_design', designId, `Deleted by admin. Reason: ${reason}`);
      }
      
    } else {
      const status = action === 'hide' ? 'hidden' : 'active';
      await global.db.promise().query(
        `UPDATE designs SET status=?, moderation_reason=?, moderated_by=?, moderated_at=NOW() WHERE design_id=?`,
        [status, reason, adminId || null, designId]
      );

        if (global.io) {
          global.io.emit('design_updated', { 
            design_id: parseInt(designId), 
            status: status 
          });
        }
      
      if (adminId) {
        await global.db.promise().query(
          `INSERT INTO moderation_logs (admin_id, target_type, target_id, action, reason) VALUES (?, 'design', ?, ?, ?)`,
          [adminId, designId, action, reason]
        );
      }
      
      const [designs] = await global.db.promise().query('SELECT designer_id, title FROM designs WHERE design_id = ?', [designId]);
      if (designs.length > 0) {
        const message = action === 'hide' 
          ? `Design "${designs[0].title}" hidden. Reason: ${reason}`
          : `Design "${designs[0].title}" restored`;
        await global.db.promise().query(
          `INSERT INTO user_notifications (user_id, type, message) VALUES (?, 'design_hidden', ?)`,
          [designs[0].designer_id, message]
        );
        // Log to activity log
        logActivity(designs[0].designer_id, action === 'hide' ? 'hide_design' : 'unhide_design', designId, message);
      }
    }
    res.json({ message: `Design ${action}d` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Notifications
router.get('/notifications/:userId', async (req, res) => {
  try {
    const [notifications] = await global.db.promise().query(
      `SELECT * FROM user_notifications WHERE user_id = ? AND is_read = FALSE ORDER BY created_at DESC`,
      [req.params.userId]
    );
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark notification read
router.post('/notifications/:id/read', async (req, res) => {
  try {
    await global.db.promise().query('UPDATE user_notifications SET is_read = TRUE WHERE notification_id = ?', [req.params.id]);
    res.json({ message: 'Marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;