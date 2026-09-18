# JobFitIQ

You paste a resume and a job description in. Fifteen seconds later you know exactly which keywords you're missing, which category of your skill set is thin, and — if you want it — a resume bullet written to close that specific gap. No account, no upload, no "optimize your resume for $29/mo."

## What it actually does

Most resume-matching tools give you a vague percentage and call it a day. JobFitIQ shows its work:

- **Match score** blending TF-IDF cosine similarity with `all-MiniLM-L6-v2` sentence embeddings, so it catches both exact keyword hits and semantically close ones ("led a team" matching "management experience," for instance).
- **Coverage radar** across five categories — Frontend, Backend/API, DevOps/Cloud, AI/Data, Testing — so you can see whether you're missing one keyword or an entire competency.
- **Keyword chips** split into matched and missing, pulled from a curated skill vocabulary rather than a naive word-diff.
- **AI suggestions**, generated on demand (not on every keystroke) — either one bullet for a single missing skill, or a full batch with a projected new match score. The projection comes from the same deterministic scoring engine that produced your original score, not a number the model made up, and the model is explicitly told to infer plausible experience rather than invent it outright.

Nothing you paste in gets stored. Both the resume and the job description are processed in memory, per request, and discarded.

## Under the hood

**Frontend** — React + TypeScript + Vite + Tailwind. Analysis runs live and debounced (`useMatchAnalysis`), with in-flight requests cancelled via `AbortController` the moment you keep typing, so you're never staring at a stale score. Framer Motion handles the score-gauge reveal and chip transitions, Recharts draws the radar, and the whole thing runs on a CSS-variable theme that defaults to dark.

**Backend** — FastAPI. The matching engine is the core of the project: it's not an LLM guessing a percentage, it's a deterministic pipeline you could audit line by line. The Claude API only gets involved for the optional suggestion step, kept deliberately separate from scoring so the numbers stay trustworthy.

```
backend/   FastAPI app — matching engine, skill vocabulary, suggestion endpoints
frontend/  React app — Vite + TypeScript + Tailwind
```

## Running it locally

**Backend**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # add your ANTHROPIC_API_KEY
uvicorn app.main:app --reload --port 8000
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

The frontend expects the backend at `http://localhost:8000` in dev (`frontend/.env.development`).

## Environment variables

**Backend** (`backend/.env`)

| Variable | Purpose |
|---|---|
| `ANTHROPIC_API_KEY` | Required for the suggestion endpoints. Match scoring works fine without it. |
| `FRONTEND_ORIGIN` | Locks CORS to your frontend's origin. |
| `RATE_LIMIT_PER_HOUR` | Per-IP cap on the suggestion endpoints (default: 20/hour). |

**Frontend**

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | The backend's base URL. |

## Why I built this

Job hunting means rewriting the same resume a dozen slightly different ways for a dozen slightly different postings, with no real signal on whether any of it is working. I wanted a tool that treats "does my resume match this JD" as a real scoring problem — with a transparent, inspectable pipeline — instead of a black box that spits out a number and asks for your credit card.
