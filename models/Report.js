const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  summary: {
    type: Date,
    required: true,
  },
  game: {
    type: String,
    required: true,
  },
  betsEuro: {
    type: Number,
    required: true,
  },
  winsEuro: {
    type: Number,
    required: true,
  },
  ggrEuro: {
    type: Number,
    required: true,
  },
  avgBet: {
    type: Number,
    required: true,
  },
  spins: {
    type: Number,
    required: true,
  },
  uniquePlayers: {
    type: Number,
    required: true,
  },
}, { timestamps: true });

const modelCache = {};

const getReportModel = (tenant) => {
  const key = String(tenant || '').toLowerCase();
  const modelName = `Report_${key}`;
  const collectionName = `reports_${key}`;

  if (!modelCache[modelName]) {
    modelCache[modelName] =
      mongoose.models[modelName] ||
      mongoose.model(modelName, reportSchema, collectionName);
  }

  return modelCache[modelName];
};

// Legacy default model (pre-tenant collection name "reports")
const LegacyReport =
  mongoose.models.Report || mongoose.model("Report", reportSchema, "reports");

module.exports = getReportModel;
module.exports.getReportModel = getReportModel;
module.exports.LegacyReport = LegacyReport;
module.exports.reportSchema = reportSchema;
