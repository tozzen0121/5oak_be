const express = require('express');
const { save, get } = require('../controllers/homeController');

const router = express.Router();

router.get('/', get);
router.post('/', save);

module.exports = router;