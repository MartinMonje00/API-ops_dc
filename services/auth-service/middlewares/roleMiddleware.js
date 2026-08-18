const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({
                code: 'FORBIDDEN',
                message: 'No se encontro informacion de rol en la sesion'
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                code: 'INSUFFICIENT_PERMISSIONS',
                message: 'Acceso denegado Requiere el rol de administrador'
            });
        }

        next();
    };
};

module.exports = { authorizeRoles };