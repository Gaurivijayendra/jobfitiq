export const CATEGORIES = [
  'Frontend',
  'Backend/API',
  'DevOps/Cloud',
  'AI/Data',
  'Testing',
] as const

export type Category = (typeof CATEGORIES)[number]

export interface MatchRequest {
  resume: string
  jobDescription: string
}

export interface KeywordCategoryBreakdown {
  category: Category
  matched: number
  total: number
}

export interface MatchResponse {
  score: number
  matchedKeywords: string[]
  missingKeywords: string[]
  categoryBreakdown: KeywordCategoryBreakdown[]
}

export interface SuggestionRequest {
  keyword: string
  resume: string
  jobDescription: string
}

export interface BulkSuggestionRequest {
  keywords: string[]
  resume: string
  jobDescription: string
}

export interface ApiErrorBody {
  detail: string
}

export const RESUME_MIN_CHARS = 50
export const RESUME_MAX_CHARS = 10000
export const JD_MIN_CHARS = 50
export const JD_MAX_CHARS = 10000
