# JobFitIQ

A live resume-to-job-description matching tool. Paste a resume and a job description and get an
instant match score, matched/missing keyword chips, a category-coverage radar chart, and
Claude-powered suggestions for closing the gaps.

## Architecture

- **Frontend** — React + TypeScript + Vite + Tailwind CSS. Live debounced analysis
  (`useMatchAnalysis`) with `AbortController`-based cancellation of superseded requests,
  Framer Motion for the score-gauge reveal and chip transitions, Recharts for the radar chart,
  and a CSS-variable-driven light/dark theme (default dark).
- **Backend** — FastAPI. Match scoring blends TF-IDF cosine similarity with
  `all-MiniLM-L6-v2` sentence-embedding similarity against a curated skill vocabulary bucketed
  into five categories (Frontend, Backend/API, DevOps/Cloud, AI/Data, Testing). No resume or job
  description text is ever persisted — everything is processed in memory per request.
- **AI suggestions** — a separate, on-demand Claude API call (not run on every keystroke)
  streams a resume bullet point for a single missing skill, or a batch of bullets for every
  missing skill at once alongside a projected match score. The projection is computed by the
  same deterministic matching algorithm (not guessed by the model), and the model is explicitly
  instructed to infer plausible experience rather than fabricate it.

## Project layout

```
backend/    FastAPI app (matching engine, vocabulary, suggestion endpoints)
frontend/   React app (Vite + TypeScript + Tailwind)
```

## Running locally

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # then add your ANTHROPIC_API_KEY
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend expects the backend at `http://localhost:8000` in development
(`frontend/.env.development`).

## Environment variables

**Backend** (`backend/.env`):

- `ANTHROPIC_API_KEY` — required for the suggestion endpoints; the match-scoring endpoint works
  without it.
- `FRONTEND_ORIGIN` — locks CORS to your frontend's origin.
- `RATE_LIMIT_PER_HOUR` — per-IP rate limit on the suggestion endpoints (default 20/hour).

**Frontend**:

- `VITE_API_BASE_URL` — the backend's base URL.
