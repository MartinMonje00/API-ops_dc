const validateIncident = (req, res, next) => {
    const { name, description } = req.body;

    if (!name || !description) {
        return res.status(400).json ({ error: 'Los campos "Nombre" y "Descripcion" son obligatorios.' });
    }
    next();
};

const validateLogBook = (req, res, next) => {
    const { description } = req.body;

    if (!req.user || !req.user.user_id) {
        return res.status(401).json({ error: 'Acceso denegado. Sesión activa invalida' });
    }

    if (!description) {
        return res.status(400).json({ error: 'El campo "Descripción" es obligatorio' });
    }

    next();
};

const validateTempLog = (req, res, next) => {
    const { roomName, tempC, humidityPercent, notes } = req.body;

    if (!roomName || tempC === undefined || humidityPercent === undefined || !notes) {
        return res.status(400).json({ error: 'Los campos "Nombre del cuarto", " Temperatura", "Porcentaje de humedad" y "Notas" son obligatorios' });
    }
    next();
};

module.exports = {
    validateIncident,
    validateLogBook,
    validateTempLog
};
