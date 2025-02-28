const mongoose = require('mongoose');

const LaunchGameSchema = new mongoose.Schema({
  name: { type: String, required: true },
  launchDate: { type: Date, required: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('LaunchGame', LaunchGameSchema);