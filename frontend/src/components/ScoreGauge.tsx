import { animate, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { useTheme } from '../lib/theme'
import { getScoreColor } from '../lib/scoreColor'

const SIZE = 132
const STROKE = 9
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

interface ScoreGaugeProps {
  score: number
}

export function ScoreGauge({ score }: ScoreGaugeProps) {
  const reduceMotion = useReducedMotion()
  useTheme()
  const [displayScore, setDisplayScore] = useState(reduceMotion ? score : 0)
  const previousScore = useRef(reduceMotion ? score : 0)

  useEffect(() => {
    if (reduceMotion) {
      setDisplayScore(score)
      previousScore.current = score
      return
    }

    const controls = animate(previousScore.current, score, {
      duration: 1,
      ease: 'easeOut',
      onUpdate: (value) => setDisplayScore(Math.round(value)),
    })
    previousScore.current = score

    return () => controls.stop()
  }, [score, reduceMotion])

  const clamped = Math.max(0, Math.min(100, displayScore))
  const offset = CIRCUMFERENCE - (clamped / 100) * CIRCUMFERENCE
  const arcColor = getScoreColor(clamped)

  return (
    <div className="relative inline-flex shrink-0 items-center justify-center" style={{ width: SIZE, height: SIZE }}>
      <svg width={SIZE} height={SIZE} className="-rotate-90" viewBox={`0 0 ${SIZE} ${SIZE}`}>
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          strokeWidth={STROKE}
          fill="none"
          className="stroke-hairline"
        />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          strokeWidth={STROKE}
          fill="none"
          strokeLinecap="round"
          stroke={arcColor}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute font-mono text-4xl font-semibold text-ink">{displayScore}</span>
    </div>
  )
}
