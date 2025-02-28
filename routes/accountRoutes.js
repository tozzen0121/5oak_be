const express = require('express');
const { me, login, register, check } = require('../controllers/accountController');
const authenticateToken = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/me', authenticateToken, me);
router.post('/login', login);
router.post('/register', register);
router.post('/check', check);

module.exports = router;