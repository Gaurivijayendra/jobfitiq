import type { TooltipProps } from 'recharts'
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart as RechartsRadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import type { KeywordCategoryBreakdown } from '../types/api'
import { useTheme } from '../lib/theme'

interface RadarChartProps {
  breakdown: KeywordCategoryBreakdown[]
}

interface RadarDatum {
  category: string
  coverage: number
  matched: number
  total: number
}

function cssVarColor(name: string): string {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  if (!raw) return '#35577A'
  // Recharts applies this as a raw SVG fill/stroke attribute, which needs the
  // legacy comma-separated rgb() syntax — the modern space-separated CSS Color
  // 4 syntax (used everywhere else via Tailwind's arbitrary-value classes)
  // fails to parse there and silently renders invisible text/shapes.
  const [r, g, b] = raw.split(/\s+/)
  return `rgb(${r}, ${g}, ${b})`
}

function ChartTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null
  const datum = payload[0].payload as RadarDatum

  return (
    <div className="rounded-lg border border-hairline bg-surface px-3 py-2 text-xs shadow-soft">
      <p className="font-medium text-ink">{datum.category}</p>
      <p className="mt-0.5 font-mono text-ink/60">
        {datum.total === 0 ? 'not requested' : `${datum.matched}/${datum.total} skills (${datum.coverage}%)`}
      </p>
    </div>
  )
}

export function RadarChart({ breakdown }: RadarChartProps) {
  useTheme()

  const data: RadarDatum[] = breakdown.map((b) => ({
    category: b.category,
    coverage: b.total === 0 ? 100 : Math.round((b.matched / b.total) * 100),
    matched: b.matched,
    total: b.total,
  }))

  const accent = cssVarColor('--color-accent')
  const hairline = cssVarColor('--color-hairline')
  const ink = cssVarColor('--color-ink')

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart data={data} outerRadius="70%">
          <PolarGrid stroke={hairline} />
          <PolarAngleAxis dataKey="category" tick={{ fill: ink, fontSize: 11, fontFamily: 'IBM Plex Mono' }} />
          <Tooltip content={<ChartTooltip />} />
          <Radar
            dataKey="coverage"
            stroke={accent}
            fill={accent}
            fillOpacity={0.2}
            strokeWidth={2}
            dot={{ r: 3, fill: accent, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: accent, strokeWidth: 0 }}
            isAnimationActive={false}
          />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  )
}
