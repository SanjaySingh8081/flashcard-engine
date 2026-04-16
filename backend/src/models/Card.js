const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema(
  {
    front: { type: String, required: true, trim: true },
    back: { type: String, required: true, trim: true },
    deck: { type: mongoose.Schema.Types.ObjectId, ref: 'Deck', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // SM-2 spaced repetition fields
    repetitions: { type: Number, default: 0 },
    easeFactor: { type: Number, default: 2.5 },
    interval: { type: Number, default: 1 }, // in days
    nextReview: { type: Date, default: Date.now },
    lastReviewed: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Card', cardSchema);
