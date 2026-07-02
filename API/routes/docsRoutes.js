const express = require('express');
const router = express.Router();

const {
    createIncident, updateIncident,
    createLog, updateLog,
    createTempLog, updateTempLog
} = require('../controllers/docsController');

const {
    validateIncident,
    validateLogBook,
    validateTempLog
} = require('../middlewares/validateFields');

router.post('/incidents', validateIncident, createIncident);
router.put('/incidents/:id', updateIncident);

router.post('/logBook', validateLogBook, createLog);
router.put('/logBook/:id', updateLog);

router.post('/tempLogs', validateTempLog, createTempLog);
router.put('/tempLogs/:id', updateTempLog);

module.exports = router;
