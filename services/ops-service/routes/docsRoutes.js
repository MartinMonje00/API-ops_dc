const express = require('express');
const router = express.Router();

const {
    createIncident, updateIncident,
    createLog, updateLog
} = require('../controllers/docsControllerr');

const {
    validateIncident,
    validateLogBook
} = require('../middlewares/validateFields');

router.post('/incidents', validateIncident, createIncident);
router.put('/incidents/:id', updateIncident);

router.post('/logBook', validateLogBook, createLog);
router.put('/logBook/:id', updateLog);

module.exports = router;
