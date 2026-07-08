const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email && !password) {
        return res.status(400).json({ code: 'AUTH_MISSING_FIELDS' });
    }

    try {
        const [rows] = await db.query('SELECT user_id AS id, name, email, password, role, active FROM users WHERE email = ?', [email]);

        if (rows.length === 0) {
            return res.status(401).json({ code: 'AUTH_INVALID_CREDENTIALS' })
        }

        const user = rows[0];

        const correctPassword = await bcrypt.compare(password, user.password);

        if (!correctPassword) {
            return res.status(401).json({ code: 'AUTH_INVALID_CREDENTIALS' });
        }

        if (user.active === 0) {
            return res.status(403).json({ code: 'AUTH_USER_DISABLED' });
        }

        const payload = {
            id: user.id,
            email: user.email,
            role: user.role
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '8h'
        });

        res.json({
            code: 'AUTH_SUCCESS',
            token,
            user: {
                id: user.id,
                name: user.name,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Error interno del servidor:', error);
        res.status(500).json({ code: 'SERVER_INTERNAL_ERROR' })
    }
}
