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
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ code: 'TOKEN_EXPIRED', error: 'Token expirado. Inicie sesión nuevamente.' });
        }
        return res.status(401).json({ code: 'INVALID_TOKEN_ERROR', error: 'Token inválido o no autorizado.' });
    }
};

module.exports = validateJWT;