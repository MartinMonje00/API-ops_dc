const express = require('express');
const router = express.Router();

const {
    getIncidents, createIncident, updateIncident,
    getLogs, createLog, updateLog
} = require('../controllers/docsController');

const {
    validateIncident,
    validateLogBook
} = require('../middlewares/validateFields');

router.get('/incidents', getIncidents);
router.post('/incidents', validateIncident, createIncident);
router.put('/incidents/:id', updateIncident);

router.get('/logBook', getLogs);
router.post('/logBook', validateLogBook, createLog);
router.put('/logBook/:id', updateLog);

module.exports = router;
