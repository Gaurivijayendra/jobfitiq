from pydantic import BaseModel, Field

from app.config import (
    JD_MAX_CHARS,
    JD_MIN_CHARS,
    KEYWORD_MAX_CHARS,
    RESUME_MAX_CHARS,
    RESUME_MIN_CHARS,
)


class MatchRequest(BaseModel):
    resume: str = Field(..., min_length=RESUME_MIN_CHARS, max_length=RESUME_MAX_CHARS)
    jobDescription: str = Field(..., min_length=JD_MIN_CHARS, max_length=JD_MAX_CHARS)


class SuggestionRequest(BaseModel):
    keyword: str = Field(..., min_length=1, max_length=KEYWORD_MAX_CHARS)
    resume: str = Field(..., min_length=RESUME_MIN_CHARS, max_length=RESUME_MAX_CHARS)
    jobDescription: str = Field(..., min_length=JD_MIN_CHARS, max_length=JD_MAX_CHARS)


class BulkSuggestionRequest(BaseModel):
    keywords: list[str] = Field(..., min_length=1, max_length=20)
    resume: str = Field(..., min_length=RESUME_MIN_CHARS, max_length=RESUME_MAX_CHARS)
    jobDescription: str = Field(..., min_length=JD_MIN_CHARS, max_length=JD_MAX_CHARS)


class CategoryBreakdown(BaseModel):
    category: str
    matched: int
    total: int


class MatchResponse(BaseModel):
    score: int
    matchedKeywords: list[str]
    missingKeywords: list[str]
    categoryBreakdown: list[CategoryBreakdown]
