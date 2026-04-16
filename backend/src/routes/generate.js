const express = require('express');
const router = express.Router();
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Deck = require('../models/Deck');
const Card = require('../models/Card');
const { protect } = require('../middleware/auth');

const getPdfParse = () => require('pdf-parse');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are accepted'), false);
    }
  },
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Retry Gemini calls on 503 Service Unavailable (up to maxRetries attempts)
async function callGeminiWithRetry(model, prompt, maxRetries = 3, delayMs = 2000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    } catch (err) {
      const is503 =
        err.status === 503 ||
        String(err.message).includes('503') ||
        String(err.message).toLowerCase().includes('service unavailable') ||
        String(err.message).toLowerCase().includes('overloaded');

      if (is503 && attempt < maxRetries) {
        await new Promise(r => setTimeout(r, delayMs));
        continue;
      }
      throw err;
    }
  }
}

const GEMINI_PROMPT = (text) => `You are an expert educator creating high-quality flashcards from study material.

Analyze the text below and generate between 15 and 25 flashcards that together give a complete picture of the material. Each card must cover exactly one idea. Aim for cards that feel written by a great teacher, not scraped by a bot.

Cover a mix of:
- Key concepts and their precise definitions
- Important relationships and comparisons between ideas
- Cause-and-effect chains
- Edge cases and common misconceptions students get wrong
- Worked examples or step-by-step reasoning where the material supports it
- Critical facts that must be memorised

Rules for writing great cards:
- question: a clear question or prompt — never just a bare term
- answer: a complete, self-contained answer (2–5 sentences); someone who has never seen the question can understand the answer on its own
- Vary question styles: "What is X?", "How does X differ from Y?", "Why does X happen?", "What happens when X?", "Give an example of X."
- Avoid trivial, overly obvious, or duplicated questions
- Do not invent facts — only use what the text supports

Return ONLY a valid JSON array. No explanation, no markdown fences, no extra keys. Format:
[
  {"question": "Question here?", "answer": "Complete answer here."},
  ...
]

Study material:
${text}`;

// POST /api/generate
router.post('/', protect, (req, res, next) => {
  upload.single('pdf')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'PDF must be under 20 MB' });
      }
      return res.status(400).json({ message: err.message });
    }
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'A PDF file is required' });
    }
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Deck title is required' });
    }

    // Extract text from PDF buffer
    let extractedText;
    try {
      const pdfParse = getPdfParse();
      const pdfData = await pdfParse(req.file.buffer);
      extractedText = pdfData.text.trim();
    } catch {
      return res.status(400).json({
        message: 'Could not read the PDF. Make sure it contains selectable text (not a scanned image).',
      });
    }

    if (!extractedText || extractedText.length < 200) {
      return res.status(400).json({
        message: 'PDF has too little text to generate meaningful flashcards.',
      });
    }

    // Truncate to ~15 000 chars to stay within token limits
    const textForGemini =
      extractedText.length > 15000
        ? extractedText.slice(0, 15000) + '\n\n[Text truncated — remaining content omitted]'
        : extractedText;

    // Call Gemini (auto-retries up to 3× on 503)
    let rawCards;
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      rawCards = await callGeminiWithRetry(model, GEMINI_PROMPT(textForGemini));
    } catch (err) {
      const is503 =
        err.status === 503 ||
        String(err.message).includes('503') ||
        String(err.message).toLowerCase().includes('service unavailable') ||
        String(err.message).toLowerCase().includes('overloaded');

      if (is503) {
        return res.status(503).json({
          message: 'AI service is busy right now. Please try again in a moment.',
        });
      }
      return res.status(502).json({
        message: `Gemini API error: ${err.message}`,
      });
    }

    // Parse — strip accidental markdown fences if Gemini added them
    let cards;
    try {
      const cleaned = rawCards
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();
      cards = JSON.parse(cleaned);

      if (!Array.isArray(cards) || cards.length === 0) {
        throw new Error('empty array');
      }
    } catch {
      return res.status(500).json({
        message: 'Gemini returned an unexpected format. Please try again.',
      });
    }

    // Validate, clean, and map question/answer → front/back (Card model fields)
    const validCards = cards
      .filter((c) => c && typeof c.question === 'string' && typeof c.answer === 'string')
      .map((c) => ({ front: c.question.trim(), back: c.answer.trim() }))
      .filter((c) => c.front.length > 0 && c.back.length > 0);

    if (validCards.length === 0) {
      return res.status(500).json({ message: 'No valid cards were generated. Please try again.' });
    }

    // Persist deck
    const deck = await Deck.create({
      title: title.trim(),
      description: description?.trim() || `Auto-generated from: ${req.file.originalname}`,
      user: req.user._id,
      cardCount: 0,
    });

    // Persist cards
    const cardDocs = validCards.map((c) => ({
      front: c.front,
      back: c.back,
      deck: deck._id,
      user: req.user._id,
    }));

    await Card.insertMany(cardDocs);
    await Deck.findByIdAndUpdate(deck._id, { cardCount: cardDocs.length });

    res.status(201).json({
      deck: { ...deck.toObject(), cardCount: cardDocs.length, dueCount: cardDocs.length },
      cardsGenerated: cardDocs.length,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
