const db = require('../config/db');

const getIncidents = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM incidents ORDER BY createdAt DESC');

        return res.status(200).json(rows);
    } catch (error) {
        console.log("error en getIncidents:", error);
        return res.status(500).json({ error: 'Error interno del servidor al obtener los incidentes.' });
    }
};

const createIncident = async (req, res) => {
    try {
        const { name, type, affected_service, description, severity } = req.body;

        const query = `
            INSERT INTO incidents (name, type, affected_service, description, severity)
            VALUES (?, ?, ?, ?, ?)
        `;

        const [result] = await db.query(query,
            [
                name,
                type || null,
                affected_service || null,
                description,
                severity || 'Baja'
            ]
        );

        res.status(201).json({ message: 'Incidente registrado en la base de datos.', affectedRows: result.affectedRows });
    } catch (error) {
        res.status(500).json({ error: 'Error al registrar el incidente', details: error.message });
    }
};

const updateIncident = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, type, affected_service, description, severity, endedAt, state } = req.body;

        const query = `
            UPDATE incidents SET
                name = COALESCE(?, name),
                type = COALESCE(?, type),
                affected_service = COALESCE(?, affected_service),
                description = COALESCE(?, description),
                severity = COALESCE(?, severity),
                endedAt = COALESCE(?, endedAt),
                state = COALESCE(?, state)
            WHERE incident_id = ?
        `;

        const [result] = await db.query(query, [
            name,
            type,
            affected_service,
            description,
            severity,
            endedAt,
            state,
            id
        ]);

        if (result.affectedRows === 0) return res.status(404).json ({ error: 'Incidente no encontrado' });
        res.json({ message: 'Incidente actualizado.' });
    } catch (error) {
        res.status(500).json({ error: 'Error al modificar el incidente', details: error.message });
    }
};

const getLogs = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM logBook ORDER BY createdAt DESC');

        return res.status(200).json(rows);
    } catch (error) {
        console.log("error en getLogs:", error);
        return res.status(500).json({ error: 'Error interno del servidor al obtener las bitacoras.' });
    }
};

const createLog = async (req, res) => {
    try {
        const { category, description, state } = req.body;

        const user_id = req.user.id || req.user.user_id || req.body.user_id;

        if (!user_id) {
            return res.status(400).json({ error: "No se pudo asociar un identificador de usuario válido." });
        }

        const query = `
            INSERT INTO logBook (user_id, category, description, state)
            VALUES (?, ?, ?, ?)
        `;

        const [result] = await db.query(query, [
            user_id,
            category || null,
            description,
            state || 'Abierto'
        ]);

        res.status(201).json({ message: 'Registro de bitacora guardado con éxito.', affectedRows: result.affectedRows });
    } catch (error) {
        res.status(500).json({ error: 'Error al registrar la bitacora', details: error.message });
    }
};

const updateLog = async (req, res) => {
    try {
        const { id } = req.params;
        const { category, description, state } = req.body;

        const query = `
            UPDATE logBook SET
                category = COALESCE(?, category),
                description = COALESCE(?, description),
                state = COALESCE(?, state)
            WHERE log_id = ?
        `;

        const [result] = await db.query(query, [
            category,
            description,
            state,
            id
        ]);

        if (result.affectedRows === 0) return res.status(404).json({ error: 'Registro de Bitacora no encontrado' });
        res.json({ message: 'Registro de Bitacora actualizado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al modificar la bitacora', details: error.message });
    }
};

module.exports = {
    getIncidents,
    createIncident,
    updateIncident,
    getLogs,
    createLog,
    updateLog
};
