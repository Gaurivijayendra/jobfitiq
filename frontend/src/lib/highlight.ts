export interface HighlightTerm {
  term: string
  state: 'match' | 'gap'
}

export interface TextSegment {
  text: string
  state?: 'match' | 'gap'
}

function escapeRegExp(term: string): string {
  return term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, ' ')

/**
 * Splits `text` into plain and highlighted segments for the given terms.
 * Renders as React text children (never dangerouslySetInnerHTML), so there is
 * no HTML-escaping step needed — React escapes text nodes automatically.
 */
export function buildHighlightSegments(text: string, terms: HighlightTerm[]): TextSegment[] {
  if (terms.length === 0 || text.length === 0) return [{ text }]

  const stateByTerm = new Map(terms.map((t) => [normalize(t.term), t.state]))
  const pattern = [...terms]
    .sort((a, b) => b.term.length - a.term.length)
    .map((t) => escapeRegExp(t.term).replace(/\\ /g, '\\s+'))
    .join('|')
  const regex = new RegExp(`(?<![A-Za-z0-9])(${pattern})(?![A-Za-z0-9])`, 'gi')

  const segments: TextSegment[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: text.slice(lastIndex, match.index) })
    }
    segments.push({ text: match[0], state: stateByTerm.get(normalize(match[0])) })
    lastIndex = regex.lastIndex
    if (match[0].length === 0) regex.lastIndex += 1
  }

  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex) })
  }

  return segments
}
