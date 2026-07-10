const jwt = require('jsonwebtoken');

const validateJWT = (req, res, next) => {
    console.log("=== ¡ENTRANDO A VALIDATE_JWT! ===");
    console.log("Cabecera recibida:", req.headers['authorization']);

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Acceso denegado. No se proporciono un token de autenticacion.' });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);

        req.user = verified;

        next();
    } catch (error) {
        return res.status(403).json({ error: 'Token invalido o expirado' })
    }
};

module.exports = validateJWT;