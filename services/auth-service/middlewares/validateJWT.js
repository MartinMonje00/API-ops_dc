const jwt = require('jsonwebtoken');

const validateJWT = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ code: 'NO_TOKEN_PROVIDED', error: 'Acceso denegado.' });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);

        req.user = verified;

        next();
    } catch (error) {
        return res.status(403).json({ code: 'INVALID_TOKEN_ERROR', error: 'Token invalido o expirado' });
    }
};

module.exports = validateJWT;