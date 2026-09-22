const db = require('../config/db');

const calculateTimeDown = (affect, startedAt, endedAt) => {
    if (!affect || !startedAt || !endedAt) return null;

    const start = new Date(startedAt);
    const end = new Date(endedAt);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) {
        return null;
    }

    return Math.floor((end - start) / (1000 * 60));
};

const calculateTimePass = (startedAt, endedAt) => {
    const start = new Date(startedAt);
    const end = new Date(endedAt);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) {
        return null;
    }

    return Math.floor((end - start) / (1000 * 60));
};

const getIncidents = async (req, res) => {
    try {
        const query = `
            SELECT * FROM incidents
            WHERE state != 'cerrado'
                OR (state = 'cerrado' AND endedAt >= NOW() - INTERVAL 30 DAY)
            ORDER BY createdAt DESC
        `;
        const [rows] = await db.query(query);
        return res.status(200).json({ data: rows });
    } catch (error) {
        console.error('Error al obtener los incidentes:', error);
        return res.status(500).json({ code: 'SERVER_INTERNAL_ERROR', error: 'Error interno del servidor' });
    }
};

const createIncident = async (req, res) => {
    try {
        const { name, type, affected_service, description, severity, startedAt, endedAt, state, affect } = req.body;

        const finalStartedAt = startedAt ? new Date(startedAt) : new Date();
        const finalEndedAt = endedAt ? new Date(endedAt) : null;

        const finalState = state || (finalEndedAt ? 'cerrado' : 'abierto');
        const finalSeverity = severity || 'baja';
        const finalAffect = affect ? 1 : 0;

        const computedTimeDown = calculateTimeDown(finalAffect, finalStartedAt, finalEndedAt);
        const computedTimePass = calculateTimePass(finalStartedAt, finalEndedAt);

        const query = `
            INSERT INTO incidents (
                name, type, affected_service, description, severity,
                startedAt, endedAt, state, affect, time_down,
                time_pass
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await db.query(query, [
            name, type || null, affected_service || null, description, finalSeverity,
            finalStartedAt, finalEndedAt, finalState, finalAffect, computedTimeDown,
            computedTimePass
        ]);

        const [rows] = await db.query(
            'SELECT * FROM incidents WHERE name = ? ORDER BY createdAt DESC LIMIT 1',
            [name]
        );

        return res.status(201).json({ code: 'ROW_INSERT_OK', message: 'Incidente reistrado exitosamente.', data: rows[0] });
    } catch (error) {
        console.error('Error al crear el incidente:', error);
        return res.status(500).json({ code: 'INTERNAL_SERVER_ERROR', error: 'Error interno del servidor' });
    }
};

const updateIncident = async (req, res) => {
    try {
        const { id } = req.params;

        const [existing] = await db.query('SELECT incident_id, state, startedAt, affect FROM incidents WHERE incident_id = ? LIMIT 1', [id]);

        if (existing.length === 0) {
            return res.status(404).json({ code: 'NO_RESOURCE_FOUND', error: 'Incidente no registrado.' });
        }

        const incident = existing[0];

        if (incident.state === 'cerrado') {
            return res.status(400).json({ code: 'RESOURCE_LOCKED', error: 'El incidente ya se encuentra cerrado.' });
        }

        const now = new Date();
        const computedTimeDown = calculateTimeDown(incident.affect, incident.startedAt, now);
        const computedTimePass = calculateTimePass(incident.startedAt, now);

        await db.query(
            "UPDATE incidents SET state = 'cerrado', endedAt = ?, time_down = ?, time_pass = ? WHERE incident_id = ?",
            [now, computedTimeDown, computedTimePass, id]
        );

        const [rows] = await db.query('SELECT * FROM incidents WHERE incident_id = ?', [id]);
        return res.status(200).json({ code: 'ROW_UPDATE_OK', message: 'Incidente resuelto y cerrado correctamente', data: rows[0] })
    } catch (error) {
        console.error('Error al cerrar el incidente:', error);
        return res.status(500).json({ code: 'INTERNAL_SERVER_ERROR', error: 'Error interno del servidor.' })
    }
};

const getLogs = async (req, res) => {
    try {
        const query = `
            SELECT * FROM logBook
            WHERE state != 'cerrado'
                OR (state = 'cerrado' AND updatedAt >= NOW() - INTERVAL 30 DAY)
            ORDER BY createdAt DESC
        `;
        const [rows] = await db.query(query);
        return res.status(200).json({ data: rows });
    } catch (error) {
        console.error('Error al obtener las bitácoras:', error);
        return res.status(500).json({ code: 'INTERNAL_SERVER_ERROR', error: 'Error interno del servidor' });
    }
};

const createLog = async (req, res) => {
    try {
        const { title, category, description, state } = req.body;
        const user_id = req.user?.id || req.user?.user_id || req.body.user_id;

        if (!user_id) {
            return res.status(400).json({ code: 'MISSING_FIELDS', error: 'El usuario es obligatorio' });
        }

        await db.query(
            `INSERT INTO logBook (user_id, title, category, description, state)
             VALUES (?, ?, ?, ?, ?)`,
            [user_id, title, category || null, description, state || 'abierto']
        );

        const [rows] = await db.query('SELECT * FROM logBook WHERE title = ? ORDER BY createdAt DESC LIMIT 1', [title]);
        return res.status(201).json({ code: 'ROW_INSERT_OK', message: 'Registro de bitácora guardado exitosamente', data: rows[0] });
    } catch (error) {
        console.error('Error al guardar la bitacora:', error);
        return res.status(500).json({ code: 'INTERNAL_SERVER_ERROR', error: 'Error interno del servidor' });
    }
};

const updateLog = async (req, res) => {
    try {
        const { id } = req.params;
        const { description, state } = req.body;

        const [existing] = await db.query('SELECT log_id, state FROM logBook WHERE log_id = ? LIMIT 1', [id]);

        if (existing.length === 0) {
            return res.status(404).json({ code: 'NO_RESOURCE_FOUND', error: 'Registro no encontrado.' });
        }
        if (existing[0].state === 'cerrado') {
            return res.status(400).json({ code: 'RESOURCE_LOCKED', error: 'No se puede modificar una bitacora cerrada.' });
        }

        const fields = [];
        const params = [];

        if (description !== undefined) {
            fields.push('description = ?');
            params.push(description);
        }
        if (state !== undefined) {
            fields.push('state = ?');
            params.push(state);
        }

        if (fields.length === 0) {
            return res.status(400).json({ code: 'NO_FIEDS_TO_UPDATE', error: 'No hay campos validos por actualizar' });
        }

        params.push(id);
        await db.query(`UPDATE logBook SET ${fields.join(', ')} WHERE log_id = ?`, params);

        const [rows] = await db.query('SELECT * FROM logBook WHERE log_id = ?', [id]);
        return res.status(200).json({ code: 'ROW_UPDATE_OK', message: 'Bicatoca actualizada exitosamente.', data: rows[0] });
    } catch (error) {
        console.error('Error al actualizar la bitacora:', error);
        return res.status(500).json({ code: 'SERVER_INTERNAL_ERROR', error: 'Error interno del servidor' });
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
