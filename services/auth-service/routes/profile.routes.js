const express = require('express');
const router = express.Router();
const validateJWT = require('../middlewares/validateJWT');

const { updateUser } = require('../controllers/profile.controller');
const { authorizeRoles } = require('../middlewares/roleMiddleware');

router.put('/:user_id', validateJWT, authorizeRoles('admin', 'administrador', 'Administrador'), updateUser);

module.exports = router;