import type { HighlightTerm } from '../lib/highlight'
import { HighlightedTextarea } from './HighlightedTextarea'

interface TextPanelProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  minChars: number
  maxChars: number
  highlightTerms?: HighlightTerm[]
}

export function TextPanel({
  label,
  value,
  onChange,
  placeholder,
  minChars,
  maxChars,
  highlightTerms,
}: TextPanelProps) {
  const count = value.length
  const belowMin = count > 0 && count < minChars
  const nearMax = count > maxChars * 0.9

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-hairline bg-surface shadow-soft transition-shadow duration-200 focus-within:border-accent focus-within:shadow-focus focus-within:ring-1 focus-within:ring-accent hover:shadow-softHover">
      <div className="flex items-center justify-between border-b border-hairline px-5 py-3.5">
        <h2 className="text-sm font-semibold tracking-tight text-ink">{label}</h2>
        <span
          className={`font-mono text-xs transition-colors duration-150 ${nearMax ? 'text-gap' : 'text-ink/50'}`}
        >
          {count}/{maxChars}
        </span>
      </div>
      {highlightTerms && highlightTerms.length > 0 ? (
        <HighlightedTextarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          maxChars={maxChars}
          terms={highlightTerms}
        />
      ) : (
        <textarea
          className="min-h-[240px] flex-1 resize-none bg-transparent p-5 text-[15px] leading-relaxed text-ink outline-none placeholder:text-ink/35"
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, maxChars))}
          placeholder={placeholder}
          maxLength={maxChars}
          spellCheck={false}
        />
      )}
      {belowMin && (
        <div className="border-t border-hairline bg-gap/5 px-5 py-2.5 text-xs text-gap">
          Not enough text yet. Add at least {minChars} characters for a meaningful analysis.
        </div>
      )}
    </div>
  )
}
