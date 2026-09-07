import { useRef } from 'react'
import { buildHighlightSegments, type HighlightTerm } from '../lib/highlight'

interface HighlightedTextareaProps {
  value: string
  onChange: (value: string) => void
  placeholder: string
  maxChars: number
  terms: HighlightTerm[]
}

const SHARED_TEXT_CLASSES =
  'min-h-[240px] whitespace-pre-wrap break-words p-5 text-[15px] leading-relaxed font-sans'

export function HighlightedTextarea({
  value,
  onChange,
  placeholder,
  maxChars,
  terms,
}: HighlightedTextareaProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const segments = buildHighlightSegments(value, terms)

  return (
    <div className="relative flex-1">
      <div
        ref={overlayRef}
        aria-hidden="true"
        className={`${SHARED_TEXT_CLASSES} pointer-events-none absolute inset-0 overflow-hidden text-ink`}
      >
        {segments.map((segment, i) =>
          segment.state ? (
            <mark
              key={i}
              className={
                segment.state === 'match'
                  ? 'rounded bg-match/15 text-ink'
                  : 'rounded bg-gap/15 text-ink'
              }
            >
              {segment.text}
            </mark>
          ) : (
            <span key={i}>{segment.text}</span>
          ),
        )}
        {value.endsWith('\n') && ' '}
      </div>
      <textarea
        className={`${SHARED_TEXT_CLASSES} relative h-full w-full resize-none bg-transparent text-transparent caret-ink outline-none placeholder:text-ink/35`}
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, maxChars))}
        onScroll={(e) => {
          if (overlayRef.current) {
            overlayRef.current.scrollTop = e.currentTarget.scrollTop
            overlayRef.current.scrollLeft = e.currentTarget.scrollLeft
          }
        }}
        placeholder={placeholder}
        maxLength={maxChars}
        spellCheck={false}
      />
    </div>
  )
}
