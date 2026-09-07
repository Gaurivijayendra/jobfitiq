import re
from typing import Optional

import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from app.vocabulary import VOCABULARY

_embedding_model: Optional[SentenceTransformer] = None


def _get_embedding_model() -> SentenceTransformer:
    global _embedding_model
    if _embedding_model is None:
        _embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
    return _embedding_model


def _term_pattern(term: str) -> re.Pattern:
    escaped = re.escape(term).replace(r"\ ", r"\s+")
    return re.compile(rf"(?<![A-Za-z0-9])({escaped})(?![A-Za-z0-9])", re.IGNORECASE)


_TERM_PATTERNS = {
    category: [(term, _term_pattern(term)) for term in terms]
    for category, terms in VOCABULARY.items()
}


def _terms_found_in(text: str) -> dict[str, set[str]]:
    found: dict[str, set[str]] = {category: set() for category in VOCABULARY}
    for category, patterns in _TERM_PATTERNS.items():
        for term, pattern in patterns:
            if pattern.search(text):
                found[category].add(term)
    return found


def _tfidf_similarity(resume: str, job_description: str) -> float:
    vectorizer = TfidfVectorizer(stop_words="english")
    try:
        matrix = vectorizer.fit_transform([resume, job_description])
    except ValueError:
        return 0.0
    similarity = cosine_similarity(matrix[0], matrix[1])[0][0]
    return float(similarity)


def _embedding_similarity(resume: str, job_description: str) -> float:
    model = _get_embedding_model()
    embeddings = model.encode([resume, job_description], convert_to_numpy=True)
    a, b = embeddings[0], embeddings[1]
    denom = np.linalg.norm(a) * np.linalg.norm(b)
    if denom == 0:
        return 0.0
    return float(np.dot(a, b) / denom)


def compute_match(resume: str, job_description: str) -> dict:
    tfidf_sim = _tfidf_similarity(resume, job_description)
    embedding_sim = _embedding_similarity(resume, job_description)
    blended = 0.4 * tfidf_sim + 0.6 * embedding_sim
    score = int(round(max(0.0, min(1.0, blended)) * 100))

    jd_terms_by_category = _terms_found_in(job_description)
    resume_terms_by_category = _terms_found_in(resume)

    matched: list[str] = []
    missing: list[str] = []
    breakdown = []

    for category, jd_terms in jd_terms_by_category.items():
        resume_terms = resume_terms_by_category[category]
        category_matched = jd_terms & resume_terms
        category_missing = jd_terms - resume_terms
        matched.extend(sorted(category_matched))
        missing.extend(sorted(category_missing))
        breakdown.append(
            {
                "category": category,
                "matched": len(category_matched),
                "total": len(jd_terms),
            }
        )

    return {
        "score": score,
        "matchedKeywords": matched,
        "missingKeywords": missing,
        "categoryBreakdown": breakdown,
    }
