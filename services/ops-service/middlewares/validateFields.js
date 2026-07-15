const validateIncident = (req, res, next) => {
    const { name, description } = req.body;

    if (!name) {
        return res.status(400).json({ code: 'MISSING_REQUIRED_FIELD', error: 'El campo "Nombre" es obligatorios.' });
    }

    if (!description) {
        return res.status(400).json({ code: 'MISSING_REQUIRED_FIELD', error: 'El campo "Descripcion" es obligatorios.' });
    }

    next();
};

const validateLogBook = (req, res, next) => {
    const { category, description } = req.body;

    if (!description) {
        return res.status(400).json({ code: 'MISSING_REQUIRED_FIELD', error: 'El campo "Descripcion" es obligatorio' });
    }

    if (!category) {
        return res.status(400).json({ code: 'MISSING_REQUIRED_FIELD', error: 'El campo "Categoria" es obligatorio' });
    }

    next();
};

module.exports = {
    validateIncident,
    validateLogBook
};
