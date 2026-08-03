// Create a new LaunchGame
exports.createLaunchGame = async (req, res) => {
  try {
    const { name, launchDate } = req.body;
    const newGame = new req.LaunchGame({ name, launchDate });
    await newGame.save();
    res.status(201).json(newGame);
  } catch (error) {
    res.status(500).json({ error: 'Error creating launch game' });
  }
};

// Get all LaunchGames
exports.getLaunchGames = async (req, res) => {
  try {
    const games = await req.LaunchGame.find();
    res.json(games);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching launch games' });
  }
};

// Get a single LaunchGame by ID
exports.getLaunchGameById = async (req, res) => {
  try {
    const game = await req.LaunchGame.findById(req.params.id);
    if (!game) return res.status(404).json({ error: 'Game not found' });
    res.json(game);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching the launch game' });
  }
};

// Update a LaunchGame by ID
exports.updateLaunchGame = async (req, res) => {
  try {
    const updatedGame = await req.LaunchGame.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedGame) return res.status(404).json({ error: 'Game not found' });
    res.json(updatedGame);
  } catch (error) {
    res.status(500).json({ error: 'Error updating launch game' });
  }
};

// Delete a LaunchGame by ID
exports.deleteLaunchGame = async (req, res) => {
  try {
    const deletedGame = await req.LaunchGame.findByIdAndDelete(req.params.id);
    if (!deletedGame) return res.status(404).json({ error: 'Game not found' });
    res.json({ message: 'Game deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting launch game' });
  }
};
