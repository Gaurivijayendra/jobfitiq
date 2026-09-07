type Rgb = [number, number, number]

function readCssVarRgb(varName: string): Rgb {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(varName).trim()
  const [r, g, b] = raw.split(/\s+/).map(Number)
  return [r || 0, g || 0, b || 0]
}

function lerp(a: number, b: number, t: number): number {
  return Math.round(a + (b - a) * t)
}

function lerpRgb(a: Rgb, b: Rgb, t: number): Rgb {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]
}

/**
 * Interpolates gap -> accent -> match based on score, reading the live theme's
 * CSS variables so the gradient stays correct across light/dark toggles.
 */
export function getScoreColor(score: number): string {
  const gap = readCssVarRgb('--color-gap')
  const accent = readCssVarRgb('--color-accent')
  const match = readCssVarRgb('--color-match')

  const clamped = Math.max(0, Math.min(100, score))
  const [r, g, b] =
    clamped <= 50 ? lerpRgb(gap, accent, clamped / 50) : lerpRgb(accent, match, (clamped - 50) / 50)

  return `rgb(${r} ${g} ${b})`
}
