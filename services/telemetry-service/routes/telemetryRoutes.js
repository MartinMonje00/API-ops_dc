const express = require('express');
const router = express.Router();

const { getTempLogs, createTempLog } = require('../controllers/telemetryController');

const validateTelemetryJWT = require('../middlewares/validateTelemetryJWT');

router.get('/tempLogs', validateTelemetryJWT, getTempLogs);
router.post('/tempLogs', validateTelemetryJWT, createTempLog);

module.exports = router;