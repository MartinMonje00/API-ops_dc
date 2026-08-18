const db = require('../config/db');

const updateUser = async (req, res) => {
    try {
        const { user_id } = req.params;
        const { role, active } = req.body;

        const fieldsToUpdate = [];
        const values = [];

        if (role) {
            fieldsToUpdate.push('role = ?'),
            values.push(role);
        }

        if (typeof active === 'boolean') {
            fieldsToUpdate.push('active = ?');
            values.push(active);
        }

        if (fieldsToUpdate.length === 0) {
            return res.status(400).json({ code: 'NO_FIELDS_PROVIDED', message: 'Se deben de proporcionar os campos requeridos.' });
        }

        values.push(user_id);

        const query = `UPDATE users SET ${fieldsToUpdate.join(', ')} WHERE user_id = ?`;
        const [result] = await db.query(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ code: 'USER_NOT_FOUND', message: 'Usuario no encontrado.' });
        }

        return res.status(200).json({ code: 'USER_UPDATE_SUCCESS', message: 'Usuario actualizado exitosamente.', updatedFields: { role, active } });
    } catch (error) {
        console.error('Error al acualizar el usuario:', error);
        return res.status(500).json({ code: 'INTERNAL_SERVER_ERROR', message: 'Error interno del servidor', error });
    }
};

module.exports = { updateUser }