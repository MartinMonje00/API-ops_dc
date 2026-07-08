const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.headers['autorization'];

    if (!token) {
        return res.status(401).json({ code: "AUTH_REQUIRED", message: "No tienes permiso" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;

        next();
    } catch (error) {
        return res.status(403).json({ code: "INVALID_TOKEN" })
    }
};