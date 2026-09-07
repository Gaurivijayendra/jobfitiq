import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { ApiError, fetchMatch, streamBulkSuggestions } from '../lib/api'

interface ImproveSuggestionsPanelProps {
  missingKeywords: string[]
  resume: string
  jobDescription: string
  currentScore: number
  onClose: () => void
}

type StreamStatus = 'streaming' | 'done' | 'error' | 'interrupted'

const MAX_KEYWORDS = 20

const retryButtonClasses =
  'mt-2 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-all duration-150 hover:bg-accent/90 hover:shadow active:scale-95'

export function ImproveSuggestionsPanel({
  missingKeywords,
  resume,
  jobDescription,
  currentScore,
  onClose,
}: ImproveSuggestionsPanelProps) {
  const [text, setText] = useState('')
  const [status, setStatus] = useState<StreamStatus>('streaming')
  const [errorMessage, setErrorMessage] = useState<string>()
  const [projectedScore, setProjectedScore] = useState<number | null>(null)
  const [retryToken, setRetryToken] = useState(0)
  const reduceMotion = useReducedMotion()

  const textRef = useRef('')
  const keywords = missingKeywords.slice(0, MAX_KEYWORDS)
  const keywordsKey = keywords.join('|')

  useEffect(() => {
    const controller = new AbortController()
    textRef.current = ''
    setText('')
    setStatus('streaming')
    setErrorMessage(undefined)
    setProjectedScore(null)

    // Best-effort projection: what the deterministic match score would be if the
    // resume already mentioned every flagged skill. Computed by the same scoring
    // algorithm as the live analysis, not guessed by the model, so it's an honest
    // ceiling rather than a fabricated number.
    const augmentedResume = `${resume}\n\n${keywords.join(', ')}`.slice(0, 10000)
    fetchMatch({ resume: augmentedResume, jobDescription }, controller.signal)
      .then((data) => setProjectedScore(data.score))
      .catch(() => {
        /* projection is a nice-to-have; ignore failures silently */
      })

    async function run() {
      try {
        for await (const chunk of streamBulkSuggestions(
          { keywords, resume, jobDescription },
          controller.signal,
        )) {
          textRef.current += chunk
          setText(textRef.current)
        }
        setStatus('done')
      } catch (err) {
        if (controller.signal.aborted) return
        if (textRef.current.length > 0) {
          setStatus('interrupted')
        } else {
          setStatus('error')
        }
        setErrorMessage(err instanceof ApiError ? err.message : 'Could not reach the server.')
      }
    }

    run()

    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resume, jobDescription, keywordsKey, retryToken])

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="rounded-2xl border border-hairline border-l-4 border-l-accent bg-surface p-7 shadow-soft"
    >
      <div className="flex items-center justify-between">
        <p className="font-mono text-xs font-medium uppercase tracking-wide text-ink/40">
          Resume improvement suggestions
        </p>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md px-2 py-1 text-xs text-ink/40 transition-colors duration-150 hover:bg-ink/5 hover:text-ink active:scale-95"
          aria-label="Close improvement suggestions"
        >
          Close
        </button>
      </div>

      {projectedScore !== null && projectedScore > currentScore && (
        <p className="mt-3 text-sm text-match">
          If you can honestly add experience with these skills, your match score could rise from{' '}
          <span className="font-mono font-semibold">{currentScore}</span> to as high as{' '}
          <span className="font-mono font-semibold">{projectedScore}</span>.
        </p>
      )}

      <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink">
        {text}
        {status === 'streaming' && <span className="animate-pulse text-accent">▍</span>}
      </p>

      <p className="mt-4 text-xs text-ink/40">
        Only add these if they genuinely reflect your experience. Fabricated skills tend to fall
        apart in an interview.
      </p>

      {status === 'error' && (
        <div className="mt-3">
          <p className="text-sm text-gap">{errorMessage ?? 'Something went wrong.'}</p>
          <button type="button" onClick={() => setRetryToken((t) => t + 1)} className={retryButtonClasses}>
            Retry
          </button>
        </div>
      )}

      {status === 'interrupted' && (
        <div className="mt-3">
          <p className="text-xs text-gap">
            Response was interrupted.{errorMessage ? ` ${errorMessage}` : ''}
          </p>
          <button type="button" onClick={() => setRetryToken((t) => t + 1)} className={retryButtonClasses}>
            Retry
          </button>
        </div>
      )}
    </motion.div>
  )
}
