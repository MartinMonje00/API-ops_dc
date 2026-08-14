const db = require('../config/db');

const getUsers = async (req, res) => {
    try {
        const [users] = await db.query(
            `SELECT user_id, name, username, email, role, last_login FROM users ORDER BY name ASC`
        );
        return res.status(200).json(users);
    } catch (error) {
        console.error('Error al obtener los usuarios:', error);
        return res.status(500).json({ code: 'INTERNAL_SERVER_ERROR', message: 'Error en el selvidor.' });
    }
};

module.exports = { getUsers };
