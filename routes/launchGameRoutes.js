const express = require('express');
const {
  createLaunchGame,
  getLaunchGames,
  getLaunchGameById,
  updateLaunchGame,
  deleteLaunchGame
} = require('../controllers/launchGameController');

const router = express.Router();

router.post('/', createLaunchGame);
router.get('/', getLaunchGames);
router.get('/:id', getLaunchGameById);
router.put('/:id', updateLaunchGame);
router.delete('/:id', deleteLaunchGame);

module.exports = router;