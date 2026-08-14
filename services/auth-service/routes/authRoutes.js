const express = require('express');
const router = express.Router();
const validateJWT = require('../middlewares/validateJWT');

const { login } = require('../controllers/auth.Controller');
const { getUsers } = require('../controllers/getInfo.controller');

router.post('/login', login);

router.get('/users', validateJWT, getUsers);

module.exports = router;
