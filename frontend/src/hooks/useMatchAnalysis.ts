import { useEffect, useMemo, useState } from 'react'
import { ApiError, fetchMatch } from '../lib/api'
import { JD_MIN_CHARS, RESUME_MIN_CHARS, type MatchRequest, type MatchResponse } from '../types/api'
import { useDebouncedValue } from './useDebouncedValue'

export type AnalysisStatus = 'idle' | 'debouncing' | 'loading' | 'ready' | 'error'

const DEBOUNCE_MS = 700

export function useMatchAnalysis(resume: string, jobDescription: string) {
  // Debounced as one unit (not two independent hooks) so resume and jobDescription
  // always settle together in the same render — otherwise their timers can fire on
  // different ticks and briefly pair a final value with a stale, still-typing one.
  const combined = useMemo<MatchRequest>(() => ({ resume, jobDescription }), [resume, jobDescription])
  const debounced = useDebouncedValue(combined, DEBOUNCE_MS)

  const [result, setResult] = useState<MatchResponse | null>(null)
  const [internalStatus, setInternalStatus] = useState<AnalysisStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string>()
  const [retryToken, setRetryToken] = useState(0)

  const canAnalyze = resume.length >= RESUME_MIN_CHARS && jobDescription.length >= JD_MIN_CHARS
  const isPending = canAnalyze && debounced !== combined

  useEffect(() => {
    const debouncedCanAnalyze =
      debounced.resume.length >= RESUME_MIN_CHARS && debounced.jobDescription.length >= JD_MIN_CHARS

    if (!debouncedCanAnalyze) {
      setInternalStatus('idle')
      setResult(null)
      return
    }

    const controller = new AbortController()
    setInternalStatus('loading')
    setErrorMessage(undefined)

    fetchMatch(debounced, controller.signal)
      .then((data) => {
        setResult(data)
        setInternalStatus('ready')
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === 'AbortError') return
        setErrorMessage(err instanceof ApiError ? err.message : 'Could not reach the server.')
        setInternalStatus('error')
      })

    return () => controller.abort()
  }, [debounced, retryToken])

  const status: AnalysisStatus = isPending && internalStatus !== 'loading' ? 'debouncing' : internalStatus

  return {
    result,
    status,
    errorMessage,
    retry: () => setRetryToken((t) => t + 1),
  }
}
