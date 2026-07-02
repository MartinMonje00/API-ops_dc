const db = require('../config/db');

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

const createLog = async (req, res) => {
    try {
        const { category, description, state } = req.body;

        const user_id = req.user.user_id;

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

const createTempLog = async (req, res) => {
    try {
        const { roomName, tempC, humidityPercent, notes } = res.body;

        const query = `
            INSERT INTO tempLogs (roomName, tempC, humidityPercent, notes)
            VALUES (?, ?, ?, ?)
        `;

        const [result] = await db.query(query, [
            roomName,
            tempC,
            humidityPercent,
            notes
        ]);

        res.status(201).json({ message: 'Métrica térmica registrada' });
    } catch (error) {
        res.status(500).json({ error: 'Error al registrar métrica térmica', details: error.message });
    }
};

const updateTempLog = async (req, res) => {
    try {
        const { id } = req.params;
        const { roomName, tempC, humidityPercent, notes, measuredAt } = req.body;

        const query = `
            UPDATE  SET
            WHERE temp_id = ?
        `;

        const [result] = await db.query(query, [
            roomName,
            tempC,
            humidityPercent,
            notes,
            measuredAt,
            id
        ]);

        if (result.affectedRows === 0) return res.status(404).json({ error: 'Registro térmico no encontrado' });
        res.json({  message: 'Registro térmico rectificado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al rectificar métrica térmica', details: error.message });
    }
};

module.exports = {
    createIncident,
    updateIncident,
    createLog,
    updateLog,
    createTempLog,
    updateTempLog
};
