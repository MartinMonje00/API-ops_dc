const express = require('express');
const router = express.Router();

const {
    getIncidents, createIncident, updateIncident,
    getLogs, createLog, updateLog
} = require('../controllers/docs.controller');

const {
    validateIncident,
    validateLogBook,
    validateTask
} = require('../middlewares/validateFields');

const {
    createBackup, listBackups, downloadBackup
} = require('../controllers/backup.controller');

const {
    getContacts, createContact, updateContact, deleteContact
} = require('../controllers/contacts.controller');

const {
    getTasks, createTask, updateTaskStatus
} = require('../controllers/task.controller');

router.get('/tasks', getTasks);
router.post('/tasks', validateTask, createTask);
router.patch('/tasks/:id', updateTaskStatus);

router.get('/incidents', getIncidents);
router.post('/incidents', validateIncident, createIncident);
router.patch('/incidents/:id', updateIncident);

router.get('/logBook', getLogs);
router.post('/logBook', validateLogBook, createLog);
router.patch('/logBook/:id', updateLog);

router.get('/backups', listBackups);
router.post('/backups/create', createBackup);
router.get('/backups/download/:filename', downloadBackup);

router.get('/contacts', getContacts);
router.post('/contacts', createContact);
router.put('/contacts/:id', updateContact);
router.delete('/contacts/:id', deleteContact);

module.exports = router;
