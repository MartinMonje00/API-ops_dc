const path = require('path');
const fs = require('fs');
const db = require('../config/db')

const BACKUP_DIR = path.join(__dirname, '../backups');

if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

const createBackup = async (req, res) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup_data_${timestamp}.sql`;
    const filePaht = path.join(BACKUP_DIR, filename);

    try {
        const [tables] = await db.query('SHOW TABLES');

        if (!tables.length) {
            return res.status(400).json({ code: '', message: '' });
        }

        const dbNameKey = Object.keys(tables[0])[0];
        let sqlDump = `-- Backup generado desde ops-service\n-- Fecha: ${new Date().toISOString()}\n\n`;

        for (const tableObj of tables) {
            const tableName = tableObj[dbNameKey];
            const [rows] = await db.query(`SELECT * FROM \`${tableName}\``);

            if (rows.length > 0) {
                sqlDump += `--datos de la tabla: ${tableName}\n`;
                for (const row of rows) {
                    const keys = Object.keys(row).map(k => `\`${k}\``).join(', ');
                    const values = Object.values(row).map(val => {
                        if (val === null) return 'NULL';
                        if (typeof val === 'number') return val;
                        if (val instanceof Date) return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
                        return `'${String(val).replace(/'/g, "\\'")}'`;
                    }).join(', ');

                    sqlDump += `INSERT INTO \`${tableName}\` (${keys}) VALUES (${values});\n`;
                }
                sqlDump += '\n';
            }
        }

        fs.writeFileSync(filePaht, sqlDump, 'utf8');

        return res.status(201).json({
            code: '',
            message: 'Copia de seguridad generada exitosamente.',
            file: {
                filename,
                createdAt: new Date()
            }
        });
    } catch (error) {
        console.error('Error al crear el Backup:', error);
        return res.status(500).json({ code: 'SERVER_INTERNAL_ERROR', error: 'Error al generar la copia de seguridad.' })
    }
};

const listBackups = (req, res) => {
    try {
        const files = fs.readdirSync(BACKUP_DIR);

        const backupList = files
            .filter(file => file.endsWith('.sql'))
            .map(filename => {
                const stats = fs.statSync(path.join(BACKUP_DIR, filename));
                return {
                    filename,
                    sizeKb: (stats.size / 1024).toFixed(2),
                    createdAt: stats.birthtime || stats.mtime
                };
            })
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        return res.status(200).json(backupList);
    } catch (error) {
        console.error('Error al listar los archivos:', error);
        return res.status(500).json({ code: 'SERVER_INTERNAL_ERROR', error: 'Error al obtener la lista de copias de seguridad.' });
    }
};

const downloadBackup = (req, res) => {
    try {
        const { filename } = req.params;

        const sanitizedFilename = path.basename(filename);
        const filePath = path.join(BACKUP_DIR, sanitizedFilename);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ code: 'RESOURCE_NOT_FOUND', message: 'El archivo no existe.' });
        }

        return res.download(filePath, sanitizedFilename);
    } catch (error) {
        console.error('');
        return res.status(500).json({ code: 'SERVER_INTERNAL_ERROR', error: 'Error al procesar la descarga del archivo.' });
    }
};

module.exports = {
    createBackup,
    listBackups,
    downloadBackup
};
