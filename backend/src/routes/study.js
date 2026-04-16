const express = require('express');
const router = express.Router({ mergeParams: true });
const Card = require('../models/Card');
const Deck = require('../models/Deck');
const { protect } = require('../middleware/auth');

// SM-2 spaced repetition algorithm
function sm2(card, quality) {
  let { repetitions, easeFactor, interval } = card;

  if (quality >= 3) {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.round(interval * easeFactor);
    repetitions += 1;
  } else {
    repetitions = 0;
    interval = 1;
  }

  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  return { repetitions, easeFactor, interval, nextReview };
}

// GET /api/decks/:deckId/study
// Query params:
//   ?all=true  → return every card in the deck (Study All mode)
//   (default)  → return only cards due today (SM-2 schedule)
router.get('/', protect, async (req, res) => {
  try {
    const deck = await Deck.findOne({ _id: req.params.deckId, user: req.user._id });
    if (!deck) return res.status(404).json({ message: 'Deck not found' });

    const query = { deck: req.params.deckId };
    if (req.query.all !== 'true') {
      query.nextReview = { $lte: new Date() };
    }

    const cards = await Card.find(query).limit(200);

    res.json({ deck, cards, total: cards.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/decks/:deckId/study/:cardId  — submit a review rating
router.post('/:cardId', protect, async (req, res) => {
  try {
    const { quality } = req.body; // 0 = Again, 3 = Hard, 4 = Good, 5 = Easy

    if (quality === undefined || quality < 0 || quality > 5) {
      return res.status(400).json({ message: 'Quality must be between 0 and 5' });
    }

    const card = await Card.findOne({ _id: req.params.cardId, user: req.user._id });
    if (!card) return res.status(404).json({ message: 'Card not found' });

    const updates = sm2(card, quality);
    Object.assign(card, updates, { lastReviewed: new Date() });
    await card.save();

    res.json(card);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
