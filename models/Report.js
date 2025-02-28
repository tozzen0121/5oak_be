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

const Report = mongoose.model("Report", reportSchema);

module.exports = Report;