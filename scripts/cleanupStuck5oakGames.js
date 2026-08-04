/**
 * One-time cleanup: remove Intelligate-only games stuck in 5oak launch games / reports.
 *
 * Usage (on server, from 5oak_be):
 *   node scripts/cleanupStuck5oakGames.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const { getReportModel } = require('../models/Report');
const { getLaunchGameModel } = require('../models/LaunchGame');

const STUCK_GAMES = [
  'Crowns of the Gods',
  'Sweet Crowns',
  'Crown Jester Jackpots',
  'Mummy Empress x1000',
  'Crowns Bao Bao',
];

async function run() {
  const dbUri = process.env.MONGO_URI || 'mongodb://localhost:27017/5oka';
  await mongoose.connect(dbUri);

  const Report = getReportModel('5oak');
  const LaunchGame = getLaunchGameModel('5oak');

  const reportsDeleted = await Report.deleteMany({ game: { $in: STUCK_GAMES } });
  const gamesDeleted = await LaunchGame.deleteMany({ name: { $in: STUCK_GAMES } });

  console.log(`Removed ${reportsDeleted.deletedCount} report rows from reports_5oak`);
  console.log(`Removed ${gamesDeleted.deletedCount} launch games from launchgames_5oak`);
  console.log('Games:', STUCK_GAMES.join(', '));

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
