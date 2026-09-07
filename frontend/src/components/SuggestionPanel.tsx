import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { ApiError, streamSuggestion } from '../lib/api'

interface SuggestionPanelProps {
  keyword: string
  resume: string
  jobDescription: string
  onClose: () => void
}

type StreamStatus = 'streaming' | 'done' | 'error' | 'interrupted'

const retryButtonClasses =
  'mt-2 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-all duration-150 hover:bg-accent/90 hover:shadow active:scale-95'

export function SuggestionPanel({ keyword, resume, jobDescription, onClose }: SuggestionPanelProps) {
  const [text, setText] = useState('')
  const [status, setStatus] = useState<StreamStatus>('streaming')
  const [errorMessage, setErrorMessage] = useState<string>()
  const [retryToken, setRetryToken] = useState(0)
  const reduceMotion = useReducedMotion()

  const textRef = useRef('')

  useEffect(() => {
    const controller = new AbortController()
    textRef.current = ''
    setText('')
    setStatus('streaming')
    setErrorMessage(undefined)

    async function run() {
      try {
        for await (const chunk of streamSuggestion({ keyword, resume, jobDescription }, controller.signal)) {
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
  }, [keyword, resume, jobDescription, retryToken])

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="rounded-2xl border border-hairline border-l-4 border-l-accent bg-surface p-7 shadow-soft"
    >
      <div className="flex items-center justify-between">
        <p className="font-mono text-xs font-medium uppercase tracking-wide text-ink/40">
          Suggested bullet for <span className="text-accent">{keyword}</span>
        </p>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md px-2 py-1 text-xs text-ink/40 transition-colors duration-150 hover:bg-ink/5 hover:text-ink active:scale-95"
          aria-label="Close suggestion panel"
        >
          Close
        </button>
      </div>

      <p className="mt-3 min-h-[3rem] text-sm leading-relaxed text-ink">
        {text}
        {status === 'streaming' && <span className="animate-pulse text-accent">▍</span>}
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
