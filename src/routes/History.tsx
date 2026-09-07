import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../lib/store'
import { useSettings } from '../lib/settings'
import { currentStreak, sessionDurationSeconds, sessionSetCount, sessionVolume } from '../lib/db'
import { formatDate, formatDuration, formatVolume } from '../lib/format'
import { Empty, Spinner } from '../components/Common'
import { ChartIcon, ChevronRight } from '../components/Icons'

export function History() {
  const { sessions, loading } = useStore()
  const { unit } = useSettings()

  const grouped = useMemo(() => {
    const months = new Map<string, typeof sessions>()
    for (const s of sessions) {
      const key = new Date(s.started_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
      const bucket = months.get(key) ?? []
      bucket.push(s)
      months.set(key, bucket)
    }
    return [...months.entries()]
  }, [sessions])

  const totalVolume = useMemo(() => sessions.reduce((n, s) => n + sessionVolume(s), 0), [sessions])

  if (loading && sessions.length === 0) return <Spinner />

  return (
    <main className="page">
      <div className="page-head">
        <div>
          <h1>History</h1>
          <p className="sub">
            {sessions.length} workout{sessions.length === 1 ? '' : 's'} · {formatVolume(totalVolume, unit)} lifted
          </p>
        </div>
        <Link to="/progress" className="btn sm">
          <ChartIcon />
          Progress
        </Link>
      </div>

      {sessions.length === 0 ? (
        <Empty emoji="📅" title="No workouts yet">
          Finish a session and it will show up here.
        </Empty>
      ) : (
        <>
          <div className="grid stats" style={{ marginBottom: 22 }}>
            <div className="stat">
              <div className="value tabular">{currentStreak(sessions)}</div>
              <div className="label">Day streak</div>
            </div>
            <div className="stat">
              <div className="value tabular">
                {Math.round(sessions.reduce((n, s) => n + sessionSetCount(s), 0))}
              </div>
              <div className="label">Sets logged</div>
            </div>
          </div>

          {grouped.map(([month, list]) => (
            <section key={month}>
              <div className="section-head">
                <h2>{month}</h2>
                <span className="small muted">{list.length}</span>
              </div>
              <div className="list-rows">
                {list.map((s) => {
                  const seconds = sessionDurationSeconds(s)
                  return (
                    <Link key={s.id} to={`/session/${s.id}`} className="ex-row" style={{ padding: 12 }}>
                      <div className="body">
                        <div className="name">{s.name ?? 'Workout'}</div>
                        <div className="meta">
                          {formatDate(s.started_at)} · {s.session_exercises.length} exercises ·{' '}
                          {sessionSetCount(s)} sets
                          {seconds ? ` · ${formatDuration(seconds)}` : ''}
                        </div>
                      </div>
                      <span className="badge tabular">{formatVolume(sessionVolume(s), unit)}</span>
                      <ChevronRight className="" />
                    </Link>
                  )
                })}
              </div>
            </section>
          ))}
        </>
      )}
    </main>
  )
}
