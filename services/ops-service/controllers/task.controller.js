const db = require('../config/db');

const getTasks = async (req, res) => {
    try {
        const query = `
            SELECT *
            FROM tasks
            WHERE status IN (1, 2)
            ORDER BY date DESC
        `;
        const [rows] = await db.query(query);

        return res.status(200).json({ data: rows })
    } catch (error) {
        console.error('Error al obtener las tareas:', error);
        return res.status(500).json({ code: 'INTERNAL_SERVER_ERROR', message: 'Error interno del servidor.' });
    }
};

const createTask = async (req, res) => {
    try {
        const { name, description, priority, date } = req.body;

        if (!name || !priority) {
            return res.status(400).json({ code: 'MISSING_REQUIRED_FIELDS', message: 'El nombre y prioridad son obligatorios' });
        }

        const query = `
            INSERT INTO tasks (name, description, priority, date)
            VALUES (?, ?, ?, ?)
        `;
        
        const [result] = await db.query(query, [
            name,
            description || null,
            priority,
            date || null
        ]);

        return res.status(201).json({ code: '', message: 'Tarea creada exitosamente', data: rows[0] });
    } catch (error) {
        console.error('Error al crear la tarea:', error);
        return res.status(500).json({ code: 'INTERNAL_SERVER_ERROR', message: 'Error interno del servidor' });
    }
};

const updateTaskStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { action, status } = req.body;

        const [existingRows] = await db.query('SELECT task_id FROM tasks WHERE task_id = ? LIMIT 1', [id]);
        if (existingRows === 0) {
            return res.status(404).json({ code: 'NO_FIELD_FOUND', message: 'La tarea especificada no existe' });
        }

        const task = existingRows[0];
        let newStatus;
        let onTimeValue = null;

        if (action === 'toggle') {
            newStatus = task.status === 2 ? 1 : 2;
        } else if (status !== undefined) {
            newStatus = parseInt(status, 10);
        } else {
            return res.status(400).json({ code: 'INVALID_VALUE', message: 'Debe de espeificar una accion o valor validos.' });
        }

        if (newStatus === 0) {
            if (task.date) {
                const dueDate = new Date(task.date);
                dueDate.setHours(23, 59, 59, 999);

                const now = new Date();

                onTimeValue = now <= dueDate ? 1 : 0
            } else {
                onTimeValue = 1;
            }
        }

        await db.query(
            'UPDATE tasks SET status = ?, on_time = ? WHERE task_id = ?',
            [newStatus, onTimeValue, id]
        );

        const [rows] = await db.query('SELECT * FROM tasks WHERE task_id = ?', [id]);

        return res.status(200).json({ code: 'STATUS_UPDATE_OK', message: 'Estado actualizado correctamente.', data: rows[0] })
    } catch (error) {
        console.error('Error al actualizar la tarea:', error);
        return res.status(500).json({ code: 'INTERNAL_SERVER_ERROR', message: 'Error interno del servidor' });
    }
}

module.exports = {
    getTasks, createTask, updateTaskStatus
};