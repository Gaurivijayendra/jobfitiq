import type {
  BulkSuggestionRequest,
  MatchRequest,
  MatchResponse,
  SuggestionRequest,
} from '../types/api'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export async function fetchMatch(
  payload: MatchRequest,
  signal: AbortSignal,
): Promise<MatchResponse> {
  const res = await fetch(`${API_BASE_URL}/api/match`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => null)
    const message =
      typeof body?.detail === 'string'
        ? body.detail
        : Array.isArray(body?.detail)
          ? body.detail.map((d: { msg: string }) => d.msg).join('; ')
          : `Request failed with status ${res.status}`
    throw new ApiError(res.status, message)
  }

  return res.json()
}

async function readErrorBody(res: Response): Promise<string> {
  const body = await res.json().catch(() => null)
  if (typeof body?.detail === 'string') return body.detail
  if (Array.isArray(body?.detail)) {
    return body.detail.map((d: { msg: string }) => d.msg).join('; ')
  }
  return `Request failed with status ${res.status}`
}

async function* streamFromEndpoint(
  path: string,
  payload: unknown,
  signal: AbortSignal,
): AsyncGenerator<string> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  })

  if (!res.ok || !res.body) {
    throw new ApiError(res.status, await readErrorBody(res))
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    yield decoder.decode(value, { stream: true })
  }
}

export function streamSuggestion(
  payload: SuggestionRequest,
  signal: AbortSignal,
): AsyncGenerator<string> {
  return streamFromEndpoint('/api/suggest', payload, signal)
}

export function streamBulkSuggestions(
  payload: BulkSuggestionRequest,
  signal: AbortSignal,
): AsyncGenerator<string> {
  return streamFromEndpoint('/api/suggest-bulk', payload, signal)
}

export { API_BASE_URL }
