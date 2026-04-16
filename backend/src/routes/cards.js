const express = require('express');
const router = express.Router({ mergeParams: true });
const Card = require('../models/Card');
const Deck = require('../models/Deck');
const { protect } = require('../middleware/auth');

// GET /api/decks/:deckId/cards
router.get('/', protect, async (req, res) => {
  try {
    const deck = await Deck.findOne({ _id: req.params.deckId, user: req.user._id });
    if (!deck) return res.status(404).json({ message: 'Deck not found' });

    const cards = await Card.find({ deck: req.params.deckId }).sort({ createdAt: -1 });
    res.json(cards);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/decks/:deckId/cards
router.post('/', protect, async (req, res) => {
  try {
    const { front, back } = req.body;
    if (!front || !back) {
      return res.status(400).json({ message: 'Front and back are required' });
    }

    const deck = await Deck.findOne({ _id: req.params.deckId, user: req.user._id });
    if (!deck) return res.status(404).json({ message: 'Deck not found' });

    const card = await Card.create({
      front,
      back,
      deck: req.params.deckId,
      user: req.user._id,
    });

    await Deck.findByIdAndUpdate(req.params.deckId, { $inc: { cardCount: 1 } });
    res.status(201).json(card);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/decks/:deckId/cards/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const { front, back } = req.body;
    const card = await Card.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { front, back },
      { new: true }
    );
    if (!card) return res.status(404).json({ message: 'Card not found' });
    res.json(card);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/decks/:deckId/cards/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const card = await Card.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!card) return res.status(404).json({ message: 'Card not found' });
    await Deck.findByIdAndUpdate(req.params.deckId, { $inc: { cardCount: -1 } });
    res.json({ message: 'Card deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
