from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.config import ANTHROPIC_API_KEY, FRONTEND_ORIGIN, RATE_LIMIT_PER_HOUR
from app.matching import compute_match
from app.schemas import BulkSuggestionRequest, MatchRequest, MatchResponse, SuggestionRequest
from app.suggestions import stream_bulk_suggestions, stream_suggestion

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="JobFitIQ API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/api/match", response_model=MatchResponse)
def match(payload: MatchRequest) -> dict:
    return compute_match(payload.resume, payload.jobDescription)


@app.post("/api/suggest")
@limiter.limit(f"{RATE_LIMIT_PER_HOUR}/hour")
async def suggest(request: Request, payload: SuggestionRequest) -> StreamingResponse:
    if not ANTHROPIC_API_KEY:
        raise HTTPException(
            status_code=503, detail="AI suggestions are not configured on this server."
        )

    return StreamingResponse(
        stream_suggestion(payload.keyword, payload.resume, payload.jobDescription),
        media_type="text/plain",
    )


@app.post("/api/suggest-bulk")
@limiter.limit(f"{RATE_LIMIT_PER_HOUR}/hour")
async def suggest_bulk(request: Request, payload: BulkSuggestionRequest) -> StreamingResponse:
    if not ANTHROPIC_API_KEY:
        raise HTTPException(
            status_code=503, detail="AI suggestions are not configured on this server."
        )

    return StreamingResponse(
        stream_bulk_suggestions(payload.keywords, payload.resume, payload.jobDescription),
        media_type="text/plain",
    )
