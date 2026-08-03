const mongoose = require('mongoose');

const LaunchGameSchema = new mongoose.Schema({
  name: { type: String, required: true },
  launchDate: { type: Date, required: true }
}, {
  timestamps: true
});

const modelCache = {};

const getLaunchGameModel = (tenant) => {
  const key = String(tenant || '').toLowerCase();
  const modelName = `LaunchGame_${key}`;
  const collectionName = `launchgames_${key}`;

  if (!modelCache[modelName]) {
    modelCache[modelName] =
      mongoose.models[modelName] ||
      mongoose.model(modelName, LaunchGameSchema, collectionName);
  }

  return modelCache[modelName];
};

// Legacy default model (pre-tenant collection name "launchgames")
const LegacyLaunchGame =
  mongoose.models.LaunchGame ||
  mongoose.model('LaunchGame', LaunchGameSchema, 'launchgames');

module.exports = getLaunchGameModel;
module.exports.getLaunchGameModel = getLaunchGameModel;
module.exports.LegacyLaunchGame = LegacyLaunchGame;
module.exports.LaunchGameSchema = LaunchGameSchema;
