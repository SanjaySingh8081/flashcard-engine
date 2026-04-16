require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

connectDB();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/decks', require('./routes/decks'));
app.use('/api/decks/:deckId/cards', require('./routes/cards'));
app.use('/api/decks/:deckId/study', require('./routes/study'));
app.use('/api/generate', require('./routes/generate'));

app.get('/', (req, res) => res.json({ message: 'Flashcard Engine API is running' }));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
