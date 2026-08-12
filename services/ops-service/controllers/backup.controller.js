const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const BACKUP_DIR = path.join(__dirname, '../backups');

if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

const createBackup = (req, res) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup_data_${timestamp}.sql`;
    const filePath = path.join(BACKUP_DIR, filename);

    const dbHost = process.env.DB_HOST || 'db-service';
    const dbUser = process.env.DB_USER;
    const dbPassword = process.env.DB_PASSWORD;
    const dbName = process.env.DB_NAME;

    const cmd = `mysqldump --host=${dbHost} --user=${dbUser} --password="${dbPassword}" --no-create-info --complete-insert ${dbName} > "${filePath}"`;

    exec(cmd, (error, stdout, stderr) => {
        if (error) {
            console.error('error ejecutando mysqldump:', stderr || error.message);
            return res.status(500).json({ code: 'INTERNAL_SERVER_ERROR', message: 'Error interno al generar copia de seguridad.' });
        }

        return res.status(201).json({ code: 'BACKUP_CREATION_SUCCESS', message: 'Copia de seguridad creada exitosamente.', file: { filename, createdAt: new Date() } });
    });
};

const listBackups = (req, res) => {
    fs.readdir(BACKUP_DIR, (err, files) => {
        if (err) {
            console.error('Error en la lectura de directorio de copias de seguridad:', err);
            return res.status(500).json({ code: 'DIR_READ_ERROR', message: 'Error al obtener la lista de copias de seguridad.' });
        }

        const backupList = files
            .filter(file => file.endsWith('.sql'))
            .map(file => {
                const stats = fs.statSync(path.join(BACKUP_DIR, file));
                return {
                    filename: file,
                    sizeKb: (stats.size / 1024).toFixed(2),
                    createdAt: stats.birthtime
                }
            })
            .sort((a, b) => b.createdAt - a.createdAt);
        return res.json(backupList)
    });
};

const downloadBackup = (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(BACKUP_DIR, filename);

    const safePath = path.normalize(filePath);
    if(!safePath.startsWith(BACKUP_DIR)) {
        return res.status(400).json({ code: 'INVALID_PETITION', message: 'Peticion de archivo no valida.' });
    }

    if (!fs.existsSync(safePath)) {
        return res.status(404).json({ code: 'NO_FILE_FOUND', message: 'El archivo solicitado no existe.' });
    }

    return res.download(safePath);
};

module.exports = {
    createBackup,
    listBackups,
    downloadBackup
};
