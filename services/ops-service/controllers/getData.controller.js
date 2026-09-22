const db = require('../config/db');

const getDatacenterData = async (req, res) => {
    try {
        const query = `
            SELECT
                IFNULL(i.sum_time_down, 0) AS time_down,
                IFNULL(i.total_active_incidents, 0) AS total_active,
                IFNULL(i.total, 0) AS total_incidents,
                IFNULL(ts.total_status, 0) AS total_tasks,
                IFNULL(ts.total_next, 0) AS total_next_tasks
            FROM (
                SELECT
                    SUM(time_down) AS sum_time_down,
                    COUNT(CASE WHEN state = 'abierto' THEN 1 END) AS total_active_incidents,
                    COUNT(*) AS total
                FROM incidents
                WHERE startedAt >= NOW() - INTERVAL 30 DAY
                    AND severity IN ('media', 'alta', 'critica')
            ) i
            CROSS JOIN (
                SELECT
                    COUNT(CASE WHEN status IN (1, 2) THEN 1 END) AS total_status,
                    COUNT(CASE WHEN status IN (1, 2) AND \`date\` BETWEEN NOW() AND NOW() + INTERVAL 7 DAY THEN 1 END) AS total_next
                FROM tasks
            ) ts;
        `;

        const [rows] = await db.query(query);

        return res.status(200).json({
            code: 'DATA_GET_OK',
            data: rows[0]
        });
    } catch (error) {
        console.error('Error al obtener los datos solicitados:', error);
        return res.status(500).json({ code: 'SERVER_INTERNAL_ERROR', error: 'Error interno del servidor' });
    }
};

const getDashboardIncidents = async (req, res) => {
    try {
        const query = `
            SELECT
                incident_id,
                name,
                affected_service,
                createdAt,
                severity
            FROM incidents
            WHERE state != 'cerrado'
        `;

        const [rows] = await db.query(query);

        return res.status(200).json({ code: 'DATA_GET_OK', data: rows });
    } catch (error) {
        console.error('Error al recuperar datos de incidentes para el dashboard:', error);
        return res.status(500).json({ code: 'INTERNAL_SERVER_ERROR', error: 'Error interno del servidor.' });
    }
};

const getDashboardTasks = async (req, res) => {
    try {
        const query = `
            SELECT
                task_id,
                name,
                description,
                status
            FROM tasks
            WHERE status != 0
        `;

        const [rows] = await db.query(query);

        return res.status(200).json({ code: 'DATA_GET_OK', data: rows });
    } catch (error) {
        console.error('Error al recuperar datos de tareas para el dashboard:', error);
        return res.status(500).json({ code: 'INTERNAL_SERVER_ERROR', error: 'Error interno del servidor.' });
    }
};

module.exports = {
    getDatacenterData,
    getDashboardIncidents,
    getDashboardTasks
};