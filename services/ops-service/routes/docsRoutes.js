const express = require('express');
const router = express.Router();

const {
    getIncidents, createIncident, updateIncident,
    getLogs, createLog, updateLog
} = require('../controllers/docs.controller');

const {
    validateIncident,
    validateLogBook
} = require('../middlewares/validateFields');

const {
    createBackup, listBackups, downloadBackup
} = require('../controllers/backup.controller');

router.get('/incidents', getIncidents);
router.post('/incidents', validateIncident, createIncident);
router.put('/incidents/:id', updateIncident);

router.get('/logBook', getLogs);
router.post('/logBook', validateLogBook, createLog);
router.put('/logBook/:id', updateLog);

router.post('/backups/create', createBackup);
router.get('/backups', listBackups);
router.get('/backups/download/:filename', downloadBackup);

module.exports = router;
