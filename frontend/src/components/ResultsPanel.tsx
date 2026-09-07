import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import type { MatchResponse } from '../types/api'
import { KeywordChip } from './KeywordChip'
import { RadarChart } from './RadarChart'
import { ScoreGauge } from './ScoreGauge'

interface ResultsPanelProps {
  result: MatchResponse | null
  status: 'idle' | 'debouncing' | 'loading' | 'error' | 'ready'
  errorMessage?: string
  idleMessage?: string
  onRetry?: () => void
  onSelectMissingKeyword?: (keyword: string) => void
  onShowImprovements?: () => void
}

const retryButtonClasses =
  'mt-3 rounded-lg bg-accent px-4 py-2 text-xs font-medium text-white shadow-sm transition-all duration-150 hover:bg-accent/90 hover:shadow active:scale-95'

export function ResultsPanel({
  result,
  status,
  errorMessage,
  idleMessage,
  onRetry,
  onSelectMissingKeyword,
  onShowImprovements,
}: ResultsPanelProps) {
  const reduceMotion = useReducedMotion()

  if (status === 'idle') {
    return (
      <div className="rounded-2xl border border-hairline bg-surface p-8 text-sm text-ink/50 shadow-soft">
        {idleMessage ?? 'Paste your resume and a job description to see how well they match.'}
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="rounded-2xl border border-hairline bg-surface p-8 shadow-soft">
        <p className="text-sm text-gap">{errorMessage ?? 'Something went wrong.'}</p>
        {onRetry && (
          <button type="button" onClick={onRetry} className={retryButtonClasses}>
            Retry
          </button>
        )}
      </div>
    )
  }

  const isWaitingOnFirstResult = !result && (status === 'loading' || status === 'debouncing')

  if (isWaitingOnFirstResult) {
    return (
      <div className="rounded-2xl border border-hairline bg-surface p-8 shadow-soft">
        <div className="flex items-center gap-5">
          <div className="h-[120px] w-[120px] shrink-0 animate-pulse rounded-full border-8 border-hairline" />
          <span className="font-mono text-xs text-ink/40">
            {status === 'debouncing' ? 'Waiting for you to finish typing…' : 'Analyzing…'}
          </span>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          {[16, 20, 14, 22, 18].map((w, i) => (
            <div
              key={i}
              className="h-7 animate-pulse rounded-full bg-hairline"
              style={{ width: `${w * 4}px` }}
            />
          ))}
        </div>
      </div>
    )
  }

  if (!result) return null

  const isPerfect = result.missingKeywords.length === 0
  const isNearZero = result.matchedKeywords.length === 0 && result.missingKeywords.length === 0
  const isUpdating = status === 'debouncing' || status === 'loading'

  const chips = [
    ...result.matchedKeywords.map((kw) => ({ key: `m-${kw}`, label: kw, state: 'match' as const })),
    ...result.missingKeywords.map((kw) => ({ key: `g-${kw}`, label: kw, state: 'gap' as const })),
  ]

  return (
    <div className="rounded-2xl border border-hairline bg-surface p-8 shadow-soft">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="relative shrink-0">
            <div className="absolute inset-0 -m-3 rounded-full bg-accent/[0.06] blur-md" />
            <ScoreGauge score={result.score} />
          </div>
          <div>
            <p className="font-mono text-xs font-medium uppercase tracking-wide text-ink/40">
              Match score
            </p>
            <p className="mt-1 text-sm text-ink/60">out of 100</p>
          </div>
        </div>
        {isUpdating && (
          <span className="font-mono text-xs text-ink/40">
            {status === 'debouncing' ? 'Updating…' : 'Analyzing…'}
          </span>
        )}
      </div>

      {isNearZero ? (
        <p className="mt-8 text-sm text-ink/60">
          Little overlap found between this resume and job description. Double-check you
          pasted the right documents.
        </p>
      ) : (
        <div className="mt-8 flex flex-wrap gap-2.5">
          <AnimatePresence mode="popLayout">
            {chips.map(({ key, label, state }, index) => (
              <motion.div
                key={key}
                layout={!reduceMotion}
                initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduceMotion ? undefined : { opacity: 0, scale: 0.9 }}
                transition={{
                  duration: 0.18,
                  ease: 'easeOut',
                  delay: reduceMotion ? 0 : Math.min(index * 0.025, 0.3),
                }}
              >
                <KeywordChip
                  label={label}
                  state={state}
                  onClick={
                    state === 'gap' && onSelectMissingKeyword
                      ? () => onSelectMissingKeyword(label)
                      : undefined
                  }
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {!isPerfect && !isNearZero && onShowImprovements && (
        <button
          type="button"
          onClick={onShowImprovements}
          className="mt-5 rounded-lg bg-accent px-4 py-2 text-xs font-medium text-white shadow-sm transition-all duration-150 hover:bg-accent/90 hover:shadow active:scale-95"
        >
          Suggest resume improvements
        </button>
      )}

      {isPerfect && !isNearZero && (
        <p className="mt-5 text-sm font-medium text-match">
          Full keyword coverage. This resume matches every skill this JD asks for.
        </p>
      )}

      {!isNearZero && (
        <div className="mt-8 border-t border-hairline pt-8">
          <p className="font-mono text-xs font-medium uppercase tracking-wide text-ink/40">
            Category coverage
          </p>
          <RadarChart breakdown={result.categoryBreakdown} />
        </div>
      )}
    </div>
  )
}
