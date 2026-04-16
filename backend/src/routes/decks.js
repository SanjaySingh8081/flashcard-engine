const express = require('express');
const router = express.Router();
const Deck = require('../models/Deck');
const Card = require('../models/Card');
const { protect } = require('../middleware/auth');

// GET /api/decks
router.get('/', protect, async (req, res) => {
  try {
    const decks = await Deck.find({ user: req.user._id }).sort({ createdAt: -1 });
    const now = new Date();

    const decksWithStats = await Promise.all(
      decks.map(async (deck) => {
        const [dueCount, masteredCount] = await Promise.all([
          // Cards whose next review date has passed
          Card.countDocuments({ deck: deck._id, nextReview: { $lte: now } }),
          // Cards reviewed successfully at least twice (past the 1-day and 6-day milestones)
          Card.countDocuments({ deck: deck._id, repetitions: { $gte: 2 } }),
        ]);
        return { ...deck.toObject(), dueCount, masteredCount };
      })
    );

    res.json(decksWithStats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/decks
router.post('/', protect, async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });

    const deck = await Deck.create({ title, description, user: req.user._id });
    res.status(201).json(deck);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/decks/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const deck = await Deck.findOne({ _id: req.params.id, user: req.user._id });
    if (!deck) return res.status(404).json({ message: 'Deck not found' });
    res.json(deck);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/decks/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const deck = await Deck.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { title: req.body.title, description: req.body.description },
      { new: true }
    );
    if (!deck) return res.status(404).json({ message: 'Deck not found' });
    res.json(deck);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/decks/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const deck = await Deck.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!deck) return res.status(404).json({ message: 'Deck not found' });
    await Card.deleteMany({ deck: req.params.id });
    res.json({ message: 'Deck deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
