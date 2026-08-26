'use client'

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { compactCurrency, currency, type ChartPoint } from '@/lib/mortgage'

interface TooltipEntry {
  name: string
  value: number
  color: string
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: TooltipEntry[]
  label?: number
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="mp-tooltip">
      <div className="mp-tooltip-year">Year {label}</div>
      {payload.map((entry) => (
        <div key={entry.name} className="mp-tooltip-row">
          <span className="mp-tooltip-dot" style={{ background: entry.color }} />
          <span className="mp-tooltip-label">{entry.name}</span>
          <span className="mp-tooltip-value">{currency(entry.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function PayoffChart({ data }: { data: ChartPoint[] }) {
  return (
    <div className="mp-chart">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#DDD6C6" vertical={false} />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 11, fill: '#6B7565' }}
            tickLine={false}
            axisLine={{ stroke: '#DDD6C6' }}
            label={{
              value: 'Years',
              position: 'insideBottom',
              offset: -2,
              fontSize: 11,
              fill: '#6B7565',
            }}
          />
          <YAxis
            tickFormatter={(v: number) => compactCurrency(v)}
            tick={{ fontSize: 11, fill: '#6B7565' }}
            tickLine={false}
            axisLine={{ stroke: '#DDD6C6' }}
            width={58}
          />
          <Tooltip content={<ChartTooltip />} />
          <Legend
            verticalAlign="top"
            height={30}
            iconType="plainline"
            wrapperStyle={{ fontSize: 12 }}
          />
          <Line
            type="monotone"
            dataKey="balance"
            name="Remaining Balance"
            stroke="#2D4A1E"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="cumulativeInterest"
            name="Cumulative Interest Paid"
            stroke="#C9A84C"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
