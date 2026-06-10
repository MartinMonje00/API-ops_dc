const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Por favor, ingrese email y contraseña validos.' });
    }

    try {
        const [rows] = await db.query('SELECT * FROM USER WHERE email = ?', [email]);

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Credenciales Invalidas.' });
        }

        const user = rows[0];

        const correctPasswd = await bcrypt.compare(password, user.password);

        if (!correctPasswd) {
            return res.status(401).json({ error: 'Credenciales Invalidas.' });
        }

        const payload = {
            id: user.id,
            email: user.email,
            role: user.role
        }

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '8h'
        });

        res.json({
            token,
            usuario: {
                id: user.id,
                name: user.name,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Error en el proceso de inicio de sesion: ', error);
        res.status(500).json({ error: 'Error interno del servidor.'})
    }
}
