const jwt = require('jsonwebtoken');

const validateTelemetryJWT = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
        return res.status(401).json({ error: "Acceso denegado. (BORRAR EN PRODUCCION) Falta API Key de telemetria" })
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);

        if (verified.role !== 'telemetry_agent') {
            return res.status(403).json({ error: "Acceso denegado. Token no autorizado." });
        }

        req.device = verified;
        next();
    } catch (error) {
        return res.status(403).json({ error: "API Key invalida o corrupta." });
    }
}

module.exports = validateTelemetryJWT;