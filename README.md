# Flashcard Engine

A full-stack flashcard application with AI-powered card generation and spaced repetition learning.

## Features

- **Spaced Repetition (SM-2)** — Cards are scheduled for review using the SM-2 algorithm, so you study what you need to, when you need to
- **AI Flashcard Generation** — Upload a PDF and Google Gemini automatically generates 15–25 flashcards from the content
- **Deck Management** — Create, edit, and delete decks; view due and mastered card counts at a glance
- **JWT Authentication** — Secure registration and login with password hashing

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| Auth | JWT + bcryptjs |
| AI | Google Gemini (`gemini-2.5-flash`) |
| PDF Parsing | pdf-parse, multer |
| Deployment | Docker |

## Project Structure

```
flashcard-engine/
├── backend/
│   ├── src/
│   │   ├── config/db.js          # MongoDB connection
│   │   ├── middleware/auth.js    # JWT middleware
│   │   ├── models/               # User, Deck, Card schemas
│   │   └── routes/
│   │       ├── auth.js           # Register / login
│   │       ├── decks.js          # Deck CRUD
│   │       ├── cards.js          # Card CRUD
│   │       ├── study.js          # SM-2 study sessions
│   │       └── generate.js       # AI generation from PDFs
│   ├── Dockerfile
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/index.js          # Axios client
    │   ├── context/AuthContext.jsx
    │   ├── pages/                # Landing, Home, Study, DeckDetail, Login, Register
    │   └── components/           # Navbar and shared UI
    └── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Google Gemini API key ([get one here](https://aistudio.google.com/))

### 1. Clone the repo

```bash
git clone https://github.com/SanjaySingh8081/flashcard-engine.git
cd flashcard-engine
```

### 2. Configure the backend

Create `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/flashcards
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 4. Start the development servers

**Backend** (runs on `http://localhost:5000`):
```bash
cd backend && npm run dev
```

**Frontend** (runs on `http://localhost:5173`):
```bash
cd frontend && npm run dev
```

## API Reference

All routes except auth require a `Authorization: Bearer <token>` header.

### Auth
| Method | Endpoint | Body |
|---|---|---|
| POST | `/api/auth/register` | `{ name, email, password }` |
| POST | `/api/auth/login` | `{ email, password }` |

### Decks
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/decks` | List all decks (with due/mastered counts) |
| POST | `/api/decks` | Create deck |
| GET | `/api/decks/:id` | Get single deck |
| PUT | `/api/decks/:id` | Update deck |
| DELETE | `/api/decks/:id` | Delete deck and all its cards |

### Cards
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/decks/:deckId/cards` | List cards in a deck |
| POST | `/api/decks/:deckId/cards` | Create card |
| PUT | `/api/decks/:deckId/cards/:cardId` | Update card |
| DELETE | `/api/decks/:deckId/cards/:cardId` | Delete card |

### Study
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/decks/:deckId/study` | Get due cards (add `?all=true` for all cards) |
| POST | `/api/decks/:deckId/study/:cardId` | Submit review with `{ quality: 0-5 }` |

Quality scale: `0` = Again, `3` = Hard, `4` = Good, `5` = Easy

### AI Generation
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/generate` | Upload a PDF (`multipart/form-data`: `pdf`, `title`, `description`) |

## Docker (Backend)

```bash
cd backend
docker build -t flashcard-engine-backend .
docker run -p 8080:8080 \
  -e MONGODB_URI=... \
  -e JWT_SECRET=... \
  -e GEMINI_API_KEY=... \
  -e CLIENT_URL=... \
  flashcard-engine-backend
```

## How Spaced Repetition Works

After each card review, you rate your recall quality (0–5). The SM-2 algorithm uses this to:

1. **Adjust the ease factor** — cards you find hard get reviewed sooner
2. **Set the next review interval** — starts at 1 day, grows to 6 days, then scales by ease factor
3. **Reset on failure** — a quality of 0 restarts the interval from scratch

This ensures you spend more time on difficult cards and less on cards you've mastered.
