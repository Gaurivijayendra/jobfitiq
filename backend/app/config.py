import os

from dotenv import load_dotenv

load_dotenv()

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
RATE_LIMIT_PER_HOUR = int(os.getenv("RATE_LIMIT_PER_HOUR", "20"))

RESUME_MIN_CHARS = 50
RESUME_MAX_CHARS = 10_000
JD_MIN_CHARS = 50
JD_MAX_CHARS = 10_000
KEYWORD_MAX_CHARS = 100
