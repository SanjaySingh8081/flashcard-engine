const mongoose = require('mongoose');

const deckSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    cardCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Deck', deckSchema);
