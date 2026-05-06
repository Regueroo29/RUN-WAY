const express = require('express');
const router = express.Router();

// GET /api/admin/users — with pagination
router.get('/users', async (req, res) => {
    const pool = req.app.locals.db;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    try {
        // Get total count for pagination metadata
        const [countResult] = await pool.execute(
            'SELECT COUNT(*) as total FROM users'
        );
        const total = countResult[0].total;

        // Get paginated users (don't return password hash!)
        const [users] = await pool.execute(
            `SELECT user_id, username, email, role, status, created_at,
                    first_name, last_name, avatar_url
             FROM users
             ORDER BY created_at DESC
             LIMIT ? OFFSET ?`,
            [limit, offset]
        );

        res.json({
            data: users,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        console.error('Admin users error:', err);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// GET /api/admin/activity-logs — with pagination & filtering
router.get('/activity-logs', async (req, res) => {
    const pool = req.app.locals.db;
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 50, 100); // Max 100
    const offset = (page - 1) * limit;
    const userId = req.query.userId;
    const actionType = req.query.actionType;

    try {
        let whereClause = 'WHERE 1=1';
        const params = [];

        if (userId) {
            whereClause += ' AND user_id = ?';
            params.push(userId);
        }
        if (actionType) {
            whereClause += ' AND action_type = ?';
            params.push(actionType);
        }

        const [countResult] = await pool.execute(
            `SELECT COUNT(*) as total FROM activity_logs ${whereClause}`,
            params
        );
        const total = countResult[0].total;

        const [logs] = await pool.execute(
            `SELECT log_id, user_id, action_type, target_id, details, created_at
             FROM activity_logs
             ${whereClause}
             ORDER BY created_at DESC
             LIMIT ? OFFSET ?`,
            [...params, limit, offset]
        );

        res.json({
            data: logs,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        });
    } catch (err) {
        console.error('Activity logs error:', err);
        res.status(500).json({ error: 'Failed to fetch logs' });
    }
});

module.exports = router;