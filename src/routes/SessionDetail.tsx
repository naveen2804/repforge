import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { useStore } from '../lib/store'
import { useSettings } from '../lib/settings'
import { useSession } from '../lib/session'
import { deleteSession, sessionDurationSeconds, sessionSetCount, sessionVolume } from '../lib/db'
import { formatDateLong, formatDuration, formatTime, formatVolume, formatWeight } from '../lib/format'
import { BackButton, Empty, ErrorNote, Spinner } from '../components/Common'
import { PlayIcon, TrashIcon } from '../components/Icons'

export function SessionDetail() {
  const { id = '' } = useParams()
  const { sessions, byId, loading, refresh } = useStore()
  const { unit } = useSettings()
  const { start } = useSession()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const session = useMemo(() => sessions.find((s) => s.id === id), [sessions, id])

  if (loading && !session) return <Spinner />

  if (!session) {
    return (
      <main className="page">
        <BackButton to="/history" label="History" />
        <Empty emoji="🔎" title="Workout not found" />
      </main>
    )
  }

  const seconds = sessionDurationSeconds(session)

  async function onDelete() {
    if (!confirm('Delete this workout permanently?')) return
    setBusy(true)
    try {
      await deleteSession(id)
      await refresh()
      navigate('/history')
    } catch (e) {
      setError((e as Error).message)
      setBusy(false)
    }
  }

  return (
    <main className="page">
      <BackButton to="/history" label="History" />

      <div className="page-head" style={{ marginTop: 10 }}>
        <div>
          <h1>{session.name ?? 'Workout'}</h1>
          <p className="sub">
            {formatDateLong(session.started_at)} at {formatTime(session.started_at)}
          </p>
        </div>
      </div>

      <ErrorNote message={error} />

      <div className="grid stats" style={{ marginBottom: 20 }}>
        <div className="stat">
          <div className="value tabular">{formatVolume(sessionVolume(session), unit)}</div>
          <div className="label">Volume</div>
        </div>
        <div className="stat">
          <div className="value tabular">{sessionSetCount(session)}</div>
          <div className="label">Sets</div>
        </div>
        {seconds !== null && (
          <div className="stat">
            <div className="value tabular">{formatDuration(seconds)}</div>
            <div className="label">Duration</div>
          </div>
        )}
      </div>

      {session.notes && (
        <div className="notice info" style={{ marginBottom: 18 }}>
          {session.notes}
        </div>
      )}

      <div className="list-rows">
        {session.session_exercises.map((ex) => (
          <div key={ex.id} className="card">
            <Link
              to={`/exercise/${encodeURIComponent(ex.exercise_id)}`}
              style={{ fontWeight: 650, textDecoration: 'none' }}
            >
              {byId.get(ex.exercise_id)?.name ?? ex.exercise_id}
            </Link>
            {ex.notes && <p className="small muted" style={{ marginTop: 3 }}>{ex.notes}</p>}
            <div className="divider" style={{ margin: '10px 0' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {ex.sets.map((s) => (
                <div key={s.id} className="row between small tabular">
                  <span className="muted">Set {s.set_number}</span>
                  <span style={{ fontWeight: 600 }}>
                    {s.duration_seconds
                      ? formatDuration(s.duration_seconds)
                      : `${s.reps ?? '—'} × ${s.weight_kg != null ? formatWeight(s.weight_kg, unit) : 'bodyweight'}`}
                    {s.rpe ? <span className="muted" style={{ fontWeight: 400 }}> · RPE {s.rpe}</span> : null}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="row" style={{ marginTop: 20, gap: 9 }}>
        <button
          type="button"
          className="btn primary"
          style={{ flex: 1 }}
          onClick={() => {
            start({
              name: session.name ?? 'Workout',
              templateKey: session.template_key,
              plan: session.session_exercises.map((ex) => ({
                exerciseId: ex.exercise_id,
                sets: ex.sets.length || 1,
              })),
            })
            navigate('/log')
          }}
        >
          <PlayIcon />
          Repeat this workout
        </button>
        <button type="button" className="btn danger" onClick={() => void onDelete()} disabled={busy}>
          <TrashIcon />
        </button>
      </div>
    </main>
  )
}
