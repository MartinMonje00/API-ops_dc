const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController')
const { verifyToken } = require('../middlewares/authMiddleware')

router.post('/login', authController.login);

router.get('/me', verifyToken, (req, res) => {
    res.json({
        message: 'Token válido',
        user: req.user
    });
});

module.exports = router;
