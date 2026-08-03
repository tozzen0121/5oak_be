const { LegacyReport, getReportModel } = require('../models/Report');
const { LegacyLaunchGame, getLaunchGameModel } = require('../models/LaunchGame');

/**
 * Idempotent: copy legacy `reports` / `launchgames` into `*_5oak`
 * when the tenant collections are empty.
 */
async function migrateLegacyReportsTo5oak() {
  try {
    const Report5oak = getReportModel('5oak');
    const LaunchGame5oak = getLaunchGameModel('5oak');

    const [tenantReports, tenantGames, legacyReports, legacyGames] = await Promise.all([
      Report5oak.countDocuments(),
      LaunchGame5oak.countDocuments(),
      LegacyReport.countDocuments(),
      LegacyLaunchGame.countDocuments(),
    ]);

    if (tenantReports === 0 && legacyReports > 0) {
      const docs = await LegacyReport.find().lean();
      const cleaned = docs.map(({ _id, __v, ...rest }) => rest);
      if (cleaned.length) {
        await Report5oak.insertMany(cleaned);
        console.log(`Migrated ${cleaned.length} reports → reports_5oak`);
      }
    }

    if (tenantGames === 0 && legacyGames > 0) {
      const docs = await LegacyLaunchGame.find().lean();
      const cleaned = docs.map(({ _id, __v, ...rest }) => rest);
      if (cleaned.length) {
        await LaunchGame5oak.insertMany(cleaned);
        console.log(`Migrated ${cleaned.length} launch games → launchgames_5oak`);
      }
    }
  } catch (error) {
    console.error('Tenant migration error:', error.message);
  }
}

module.exports = { migrateLegacyReportsTo5oak };
