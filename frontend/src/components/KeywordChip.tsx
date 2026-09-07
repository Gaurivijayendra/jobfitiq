interface KeywordChipProps {
  label: string
  state: 'match' | 'gap'
  onClick?: () => void
}

export function KeywordChip({ label, state, onClick }: KeywordChipProps) {
  const isGap = state === 'gap'
  const base =
    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium shadow-sm transition-all duration-150'
  const stateClasses = isGap
    ? 'border-gap/30 bg-gap/5 text-gap hover:border-gap hover:bg-gap/10 hover:shadow'
    : 'border-match/30 bg-match/5 text-match'

  const content = (
    <>
      <span aria-hidden="true">{isGap ? '✕' : '✓'}</span>
      {label}
    </>
  )

  if (isGap && onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${base} ${stateClasses} cursor-pointer active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent`}
      >
        {content}
      </button>
    )
  }

  return <span className={`${base} ${stateClasses}`}>{content}</span>
}
