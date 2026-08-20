const db = require('../config/db');

const getContacts = async (req, res) => {
    try {
        const [contacts] = await db.query(
            `SELECT
                contact_id AS id,
                name,
                company,
                charge,
                email,
                telephone,
                type
             FROM contacts
             ORDER BY name ASC`
        );
        return res.status(200).json(contacts);
    } catch (error) {
        console.error('Error al obtener los contactos:', error);
        return res.status(500).json({ code: 'INTERNAL_SERVER_ERROR', message: 'Error interno del servidor' })
    }
};

const createContact = async (req, res) => {
    try {
        const { name, company, charge, email, telephone, type } = req.body;

        if (!name) {
            return res.status(400).json({ code: 'BAD_REQUEST', message: 'El nombre es obligatorio.' });
        }

        if (email) {
            const [existing] = await db.query('SELECT contact_id FROM contacts WHERE email = ? LIMIT 1', [email]);
            if (existing.length > 0) {
                return res.status(409).json({ code: 'EMAIL_ALREADY_EXISTS', message: 'El correo electronico ya esta registrado.' });
            }
        }

        const query = `
            INSERT INTO contacts (name, company, charge, email, telephone, type)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        await db.query(query, [
            name,
            company || null,
            charge || null,
            email || null,
            telephone || null,
            type || 'cliente'
        ]);

        return res.status(201).json({ code: 'CREATE_SUCCESS', message: 'Contacto creado exitosamente.' });
    } catch (error) {
        console.error('Error al crear el contacto:', error);
        return res.status(500).json({ code: 'INTERNAL_SERVER_ERROR', message: 'Error interno del servidor.' });
    }
};

const updateContact = async (req, res) => {
    try {
        const { id } = req.params;
        const allowedFields = ['name', 'company', 'charge', 'email', 'telephone', 'type'];

        const fieldsToUpdate = [];
        const values = [];

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                fieldsToUpdate.push(`${field} = ?`);
                values.push(req.body[field]);
            }
        });

        if (fieldsToUpdate.length === 0) {
            return res.status(400).json({ code: 'NO_FIELDS_PROVIDED', message: 'No se proporcionaron campos para actualizar.' });
        }

        values.push(id);

        const query = `UPDATE contacts SET ${fieldsToUpdate.join(', ')} WHERE contact_id = ?`;
        const [result] = await db.query(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ code: 'NOT_FOUND', message: 'Contacto no encontrado.' });
        }

        return res.status(200).json({ code: 'FIELDS_UPDATE_SUCCESS', message: 'Contacto actualizado exitosamente.' });
    } catch (error) {
        console.error('Error al actualizar el contacto:', error);
        return res.status(500).json({ code: 'INTERNAL_SERVER_ERROR', message: 'Error interno del servidor.' });
    }
};

const deleteContact = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [result] = await db.query('DELETE FROM contacts WHERE contact_id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ code: 'NOT_FOUND', message: 'Contacto no encontrado.' });
        }

        return res.status(200).json({ code: 'DELETE_ROW_OK', message: 'Contacto eliminado exitosamente.' });
    } catch (error) {
        console.error('Error al eliminar el contacto:', error);
        return res.status(500).json({ code: 'INTERNAL_SERVER_ERROR', message: 'Error interno del servidor' });
    }
};

module.exports = {
    getContacts,
    createContact,
    updateContact,
    deleteContact
}