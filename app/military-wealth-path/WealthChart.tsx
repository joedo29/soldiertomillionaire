'use client'

import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { compactCurrency, currency, wealthPathMilestones } from '@/lib/wealthPath'

interface Point {
  year: number
  value: number
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: { payload: Point }[]
}) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  const nextMilestone = wealthPathMilestones.find((m) => m > point.value)

  return (
    <div className="mwp-tooltip">
      <div className="mwp-tooltip-year">
        {point.year === 0 ? 'Today' : `Year ${point.year}`}
      </div>
      <div className="mwp-tooltip-value">{currency(point.value)}</div>
      {nextMilestone && (
        <div className="mwp-tooltip-next">
          {currency(nextMilestone - point.value)} to {compactCurrency(nextMilestone)}
        </div>
      )}
    </div>
  )
}

export default function WealthChart({ data }: { data: Point[] }) {
  const maxValue = Math.max(...data.map((d) => d.value))
  // Only draw milestones the projection actually reaches, so a small
  // starting balance doesn't get squashed against the bottom of the chart.
  const visibleMilestones = wealthPathMilestones.filter((m) => m <= maxValue)

  return (
    <div className="mwp-chart" aria-label="10 year net worth projection chart">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 2, left: 2 }}>
          <defs>
            <linearGradient id="mwpFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2D4A1E" stopOpacity={0.34} />
              <stop offset="100%" stopColor="#2D4A1E" stopOpacity={0.03} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#DDD6C6" vertical={false} />

          <XAxis
            dataKey="year"
            tick={{ fontSize: 11, fill: '#6B7565' }}
            tickLine={false}
            axisLine={{ stroke: '#DDD6C6' }}
            tickFormatter={(v: number) => (v === 0 ? 'Now' : `${v}y`)}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#6B7565' }}
            tickLine={false}
            axisLine={false}
            width={52}
            tickFormatter={(v: number) => compactCurrency(v)}
          />

          {visibleMilestones.map((m) => (
            <ReferenceLine
              key={m}
              y={m}
              stroke="#C9A84C"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: compactCurrency(m),
                position: 'insideTopLeft',
                fontSize: 10,
                fill: '#A8873A',
                fontWeight: 700,
              }}
            />
          ))}

          <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#2D4A1E', strokeWidth: 1 }} />

          <Area
            type="monotone"
            dataKey="value"
            stroke="#2D4A1E"
            strokeWidth={3}
            fill="url(#mwpFill)"
            // Recharts defaults to 0.6, which would dilute the gradient's own stops.
            fillOpacity={1}
            activeDot={{ r: 5, fill: '#2D4A1E', stroke: '#fff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
