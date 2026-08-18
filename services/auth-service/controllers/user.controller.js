const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { json } = require('express');

const createUser = async (req, res) => {
    try {
        const { username, name, email, password, role } = req.body;

        if (!username || !name || !email || !password || !role) {
            return res.status(400).json({
                code: 'BAD_REQUEST',
                message: 'Los campos username, name, email, password y role son obligatorios'
            });
        }

        const [existing] = await db.query(
            'SELECT user_id FROM users WHERE username = ? OR email = ? LIMIT 1',
            [username, email]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                code: 'USER_EXISTS',
                message: 'El nombre de usuario o correo ya se encuentra registrado'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.query(
            'INSERT INTO users (username, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
            [username, name, email, hashedPassword, role]
        );

        return res.status(201).json({
            code: 'USER_REGISTER_SUCCESS',
            message: 'Usuario registrado exitosamente',
            user: { username, name, email, role }
        });
    } catch (error) {
        console.error('Error durante la creacion del usuario:', error);
        return res.status(500).json({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Error interno al procesar el registro'
        });
    }
};

module.exports = { createUser };