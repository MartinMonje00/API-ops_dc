const db = require('../config/db');
const jwt = require('jsonwebtoken');
const { authenticateLDAP } = require('../services/ldap.service');

const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ code: 'BAD_REQUEST' })
        }

        const ldapUser = await authenticateLDAP(username, password);

        const [rows] = await db.query(
            'SELECT user_id, username, name, email, role, active FROM users WHERE username = ? LIMIT 1',
            [ldapUser.username]
        );

        let dbUser = rows[0];

        if (dbUser) {
            if(!dbUser.active) {
                return res.status(403).json({ code: 'FORBIDDEN', message: 'Cuenta inactiva, Contacte con el administrador.' });
            }

            await db.query(
                `UPDATE users
                 SET name = ?, email = ?, last_login = NOW()
                 WHERE user_id = ?`,
                [ldapUser.full_name, ldapUser.email, dbUser.user_id]
            );
        } else {
            const autoProvision = process.env.LDAP_AUTO_PROVISION === 'true';

            if (!autoProvision) {
                return res.status(403).json({ code: 'UNAUTHORIZED_USER', message: 'Usuario autenticado en Active Directory, pero no registrado en la base de datos de la aplicación.' });
            }

            const defaultRole = process.env.LDAP_DEFAULT_ROLE || 'ventas';

            await db.query(
                `INSERT INTO users (username, name, email, role, last_login)
                 VALUES (?, ?, ?, ?, NOW())`,
                [ldapUser.username, ldapUser.full_name, ldapUser.email, defaultRole]
            );

            const [newRows] = await db.query(
                'SELECT user_id, username, name, email, role FROM users WHERE username = ? LIMIT 1',
                [ldapUser.username]
            );

            dbUser = newRows[0];
        }

        const token = jwt.sign(
            {
                user_id: dbUser.user_id,
                username: dbUser.username,
                role: dbUser.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        return res.status(200).json({
            code: 'AUTH_SUCCESS',
            message: 'Inicio de sesion exitoso.',
            token,
            user: {
                id: dbUser.user_id,
                name: dbUser.name || ldapUser.full_name,
                role: dbUser.role
            }
        });
    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ message: error.message });
        }
        console.error('Error en el proceso de autenticación:', error);
        return res.status(500).json({ code: 'INTERNAL_SERVER_ERROR', message: 'Error interno del servidor durante el inicio de sesión.' });
    }
};

module.exports = { login };