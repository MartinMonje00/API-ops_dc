const db = require('../config/db');

const getTempLogs = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM tempLogs ORDER BY createdAt DESC');

        return res.status(200).json(rows);
    } catch (error) {
        console.error("Error en getTempLogs:", error);
        return res.status(500).json ({ error: "Error en recuperacion de telemetria." });
    }
};

const createTempLog = async (req, res) => {
    try {
        const { roomName, tempC, humidityPercent, notes } = req.body;

        const MAX_TEMP = 24.5;
        const MIN_TEMP = 17.0;
        const MAX_HUMIDITY = 60.0;

        let finalNotes = notes || '';
        let isAlert = false;
        let alertDetails = []

        if (tempC > MAX_TEMP) {
            isAlert = true;
            alertDetails.push(`CRITICO: Alta temperatura detectada (${tempC}°C). Riesgo de sobrecalentamiento.`);
        }

        if (tempC < MIN_TEMP) {
            isAlert = true;
            alertDetails.push(`ADVERTENCIA: Baja temperatura detectada (${tempC}°C).`);
        }

        if (humidityPercent > MAX_HUMIDITY) {
            isAlert = true;
            alertDetails.push(`CRITICO: Humedad alta detectada (${humidityPercent}%). Riesgo de condensacion.`);
        }


        if (isAlert) {
            finalNotes = `[ALERTA CRM] ${alertDetails.join(' | ')} ${finalNotes ? ' - Obs: ' + finalNotes : ''}`;
        } else {
            if (!finalNotes) {
                finalNotes = 'Lectura de parametros automatizada. Sistema operando dentro del rango óptimo.'
            }
        }

        const query = `
            INSERT INTO tempLogs (roomName, tempC, humidityPercent, notes)
            VALUES (?, ?, ?, ?)
        `;

        const [result] = await db.query(query, [roomName, tempC, humidityPercent, finalNotes]);

        res.status(201).json({
            message: 'Metrica termica registrada correctamente',
            affectedRows: result.affectedRows
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al registrar metrica termica', details: error.message });
    }
};

module.exports = {
    getTempLogs,
    createTempLog
};