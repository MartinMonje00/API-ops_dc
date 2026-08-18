const express = require('express');
const router = express.Router();
const validateJWT = require('../middlewares/validateJWT');

const { createUser } = require('../controllers/user.controller');
const { authorizeRoles } = require('../middlewares/roleMiddleware');

router.post('/register', validateJWT, authorizeRoles('admin', 'administrador', 'Administrador'), createUser);

module.exports = router;