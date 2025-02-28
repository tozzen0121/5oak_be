const express = require('express');

const { get, getOne, save, update, remove } = require('../controllers/jobController');

const router = express.Router();

router.get('/', get);
router.get('/:id', getOne);
router.post('/', save);
router.put('/:id', update);
router.delete('/:id', remove);

module.exports = router;