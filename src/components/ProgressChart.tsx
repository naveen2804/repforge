import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { kgToDisplay } from '../lib/format'
import type { ExercisePoint } from '../lib/db'
import type { Unit } from '../lib/types'

/**
 * Top set and estimated 1RM over time. Values are converted to the display unit up front
 * so the axis, the tooltip and the rest of the app all agree.
 */
export function ProgressChart({ points, unit }: { points: ExercisePoint[]; unit: Unit }) {
  const data = points.map((p) => ({
    date: new Date(p.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }),
    top: Math.round(kgToDisplay(p.topSetKg, unit) * 10) / 10,
    orm: Math.round(kgToDisplay(p.estimated1RM, unit) * 10) / 10,
  }))

  return (
    <div style={{ width: '100%', height: 220 }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-faint)' }} tickLine={false} axisLine={false} minTickGap={18} />
          <YAxis tick={{ fontSize: 11, fill: 'var(--text-faint)' }} tickLine={false} axisLine={false} width={44} />
          <Tooltip
            contentStyle={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              fontSize: 12,
              color: 'var(--text)',
            }}
            formatter={(value, name) => [`${value as number} ${unit}`, name === 'top' ? 'Top set' : 'Est. 1RM']}
          />
          <Line type="monotone" dataKey="top" stroke="var(--brand)" strokeWidth={2.2} dot={{ r: 2.5 }} name="top" />
          <Line type="monotone" dataKey="orm" stroke="var(--text-faint)" strokeWidth={1.6} strokeDasharray="4 4" dot={false} name="orm" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
