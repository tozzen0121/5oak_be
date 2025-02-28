const mongoose = require('mongoose');

const HomeSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Home', HomeSchema);