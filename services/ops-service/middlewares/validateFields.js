const validateIncident = (req, res, next) => {
    const { name, description } = req.body;

    if (!name || !description) {
        return res.status(400).json ({ error: 'Los campos "Nombre" y "Descripcion" son obligatorios.' });
    }
    next();
};

const validateLogBook = (req, res, next) => {
    const { category, description } = req.body;

    if (!description) {
        return res.status(400).json({ error: 'El campo "Descripcion" es obligatorio' });
    }

    if (!category) {
        return res.status(400).json({ error: 'El campo "Categoria" es obligatorio' });
    }

    next();
};

module.exports = {
    validateIncident,
    validateLogBook
};
