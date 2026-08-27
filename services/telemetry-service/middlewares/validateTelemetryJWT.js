const jwt = require('jsonwebtoken');

const validateTelemetryJWT = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
        return res.status(401).json({ code: 'NO_TOKEN_PROVIDED', error: 'Acceso denegado.' })
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);

        if (verified.role !== 'telemetry_agent') {
            return res.status(403).json({ code: 'FORBIDDEN_ACCESS', error: 'Acceso denegado. Token no autorizado.' });
        }

        req.device = verified;
        next();
    } catch (error) {
        return res.status(401).json({ code: 'INVALID_API_KEY', error: 'API Key invalida o corrupta.' });
    }
}

module.exports = validateTelemetryJWT;