import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useStore } from '../lib/store'
import { useSettings } from '../lib/settings'
import { bodyPartSplit, personalRecords, volumeByWeek } from '../lib/db'
import { BODY_PART_LABEL } from '../data/catalog'
import { formatDuration, formatWeight, kgToDisplay, relativeDay } from '../lib/format'
import { BackButton, Empty, Spinner } from '../components/Common'
import { InfoTip } from '../components/InfoTip'
import type { BodyPart } from '../lib/types'

export function Progress() {
  const { sessions, byId, loading } = useStore()
  const { unit, resolvedTheme } = useSettings()
  const [tab, setTab] = useState<'volume' | 'records'>('volume')

  const weekly = useMemo(
    () =>
      volumeByWeek(sessions).map((w) => ({
        label: new Date(w.week).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }),
        volume: Math.round(kgToDisplay(w.volume, unit)),
        workouts: w.workouts,
      })),
    [sessions, unit],
  )

  const split = useMemo(
    () =>
      bodyPartSplit(sessions, (id) => byId.get(id)?.bodyParts ?? []).map((row) => ({
        ...row,
        name: BODY_PART_LABEL[row.name as BodyPart] ?? row.name,
      })),
    [sessions, byId],
  )

  const records = useMemo(() => {
    const list = [...personalRecords(sessions).values()]
    return list.sort((a, b) => Date.parse(b.lastPerformed) - Date.parse(a.lastPerformed))
  }, [sessions])

  const gridColor = resolvedTheme === 'dark' ? '#2c2c33' : '#e2e2e7'

  if (loading && sessions.length === 0) return <Spinner />

  if (sessions.length === 0) {
    return (
      <main className="page">
        <BackButton to="/history" label="History" />
        <Empty emoji="📈" title="Nothing to chart yet">
          Log a couple of workouts and your trends will appear here.
        </Empty>
      </main>
    )
  }

  return (
    <main className="page">
      <BackButton to="/history" label="History" />

      <div className="page-head" style={{ marginTop: 10 }}>
        <h1>Progress</h1>
      </div>

      <div className="seg" style={{ marginBottom: 18 }}>
        <button type="button" className={tab === 'volume' ? 'on' : ''} onClick={() => setTab('volume')}>
          Trends
        </button>
        <button type="button" className={tab === 'records' ? 'on' : ''} onClick={() => setTab('records')}>
          Records
        </button>
      </div>

      {tab === 'volume' ? (
        <>
          <section>
            <div className="section-head">
              <h2 className="row" style={{ gap: 4 }}>
                Weekly volume
                <InfoTip term="volume" />
              </h2>
              <span className="small muted">Last 12 weeks · {unit}</span>
            </div>
            <div className="card">
              <div style={{ width: '100%', height: 230 }}>
                <ResponsiveContainer>
                  <BarChart data={weekly} margin={{ top: 6, right: 6, left: -14, bottom: 0 }}>
                    <CartesianGrid stroke={gridColor} vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--text-faint)' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--text-faint)' }} tickLine={false} axisLine={false} width={52} />
                    <Tooltip
                      cursor={{ fill: 'var(--surface-2)' }}
                      contentStyle={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 10,
                        fontSize: 12,
                        color: 'var(--text)',
                      }}
                      formatter={(value) => [`${(value as number).toLocaleString()} ${unit}`, 'Volume']}
                    />
                    <Bar dataKey="volume" radius={[5, 5, 0, 0]}>
                      {weekly.map((w, i) => (
                        <Cell key={i} fill={w.volume > 0 ? 'var(--brand)' : 'var(--surface-3)'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          <section>
            <div className="section-head">
              <h2>Where the work went</h2>
              <span className="small muted">Sets in the last 30 days</span>
            </div>
            {split.length === 0 ? (
              <p className="muted small">No sets logged in the last 30 days.</p>
            ) : (
              <div className="card">
                {split.map((row) => {
                  const max = split[0].sets
                  return (
                    <div key={row.name} style={{ padding: '7px 0' }}>
                      <div className="row between small" style={{ marginBottom: 4 }}>
                        <span style={{ fontWeight: 600 }}>{row.name}</span>
                        <span className="muted tabular">{row.sets} sets</span>
                      </div>
                      <div style={{ height: 7, background: 'var(--surface-2)', borderRadius: 999 }}>
                        <div
                          style={{
                            width: `${(row.sets / max) * 100}%`,
                            height: '100%',
                            background: 'var(--brand)',
                            borderRadius: 999,
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        </>
      ) : (
        <section>
          <div className="section-head">
            <h2 className="row" style={{ gap: 4 }}>
              Personal records
              <InfoTip term="pr" />
            </h2>
            <span className="small muted">{records.length} exercises</span>
          </div>
          <div className="list-rows">
            {records.map((r) => (
              <Link key={r.exerciseId} to={`/exercise/${encodeURIComponent(r.exerciseId)}`} className="ex-row" style={{ padding: 12 }}>
                <div className="body">
                  <div className="name">{byId.get(r.exerciseId)?.name ?? r.exerciseId}</div>
                  <div className="meta">
                    {r.totalSets} sets · last {relativeDay(r.lastPerformed).toLowerCase()}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="tabular" style={{ fontWeight: 700 }}>
                    {r.bestWeightKg > 0
                      ? formatWeight(r.bestWeightKg, unit)
                      : r.bestDurationSeconds > 0
                        ? formatDuration(r.bestDurationSeconds)
                        : '—'}
                  </div>
                  <div className="small muted">
                    {r.bestWeightKg > 0 ? `× ${r.bestWeightReps} reps` : 'best'}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
