import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSettings } from '../lib/settings'
import { useAuth } from '../lib/auth'
import { useStore } from '../lib/store'
import { deleteCustomTemplate } from '../lib/db'
import { ErrorNote } from '../components/Common'
import { CompassIcon, SparkIcon, TrashIcon } from '../components/Icons'
import type { ThemeChoice, Unit } from '../lib/types'

export function Settings() {
  const { theme, setTheme, unit, setUnit } = useSettings()
  const { profile, signOut } = useAuth()
  const { sessions, byId, customTemplates, refresh, favorites } = useStore()
  const [error, setError] = useState<string | null>(null)

  /**
   * Export is the only backup that exists — there is no password reset, so it doubles as
   * an escape hatch if an account is ever lost. Exercise names are resolved so the file
   * is readable without the app.
   */
  function exportJson() {
    const payload = {
      exportedAt: new Date().toISOString(),
      username: profile?.username ?? null,
      unit,
      favorites: [...favorites],
      customTemplates,
      sessions: sessions.map((s) => ({
        ...s,
        session_exercises: s.session_exercises.map((ex) => ({
          ...ex,
          exercise_name: byId.get(ex.exercise_id)?.name ?? ex.exercise_id,
        })),
      })),
    }
    download(`repforge-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(payload, null, 2), 'application/json')
  }

  function exportCsv() {
    const rows = [
      ['date', 'workout', 'exercise', 'set', 'reps', 'weight_kg', 'duration_seconds', 'rpe'].join(','),
    ]
    for (const s of sessions) {
      for (const ex of s.session_exercises) {
        const name = (byId.get(ex.exercise_id)?.name ?? ex.exercise_id).replace(/"/g, '""')
        for (const set of ex.sets) {
          rows.push(
            [
              s.started_at,
              `"${(s.name ?? 'Workout').replace(/"/g, '""')}"`,
              `"${name}"`,
              set.set_number,
              set.reps ?? '',
              set.weight_kg ?? '',
              set.duration_seconds ?? '',
              set.rpe ?? '',
            ].join(','),
          )
        }
      }
    }
    download(`repforge-${new Date().toISOString().slice(0, 10)}.csv`, rows.join('\n'), 'text/csv')
  }

  function download(filename: string, content: string, type: string) {
    const url = URL.createObjectURL(new Blob([content], { type }))
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  async function removeTemplate(id: string) {
    try {
      await deleteCustomTemplate(id)
      await refresh()
    } catch (e) {
      setError((e as Error).message)
    }
  }

  return (
    <main className="page">
      <div className="page-head">
        <div>
          <h1>Settings</h1>
          <p className="sub">Signed in as {profile?.username ?? '…'}</p>
        </div>
      </div>

      <ErrorNote message={error} />

      <section>
        <div className="section-head">
          <h2>Appearance</h2>
        </div>
        <div className="card">
          <div className="setting-row" style={{ paddingTop: 0 }}>
            <div>
              <div className="label">Theme</div>
              <div className="desc">Light is the default.</div>
            </div>
            <div className="seg">
              {(['light', 'dark', 'system'] as ThemeChoice[]).map((t) => (
                <button key={t} type="button" className={theme === t ? 'on' : ''} onClick={() => setTheme(t)}>
                  {t[0].toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="setting-row" style={{ paddingBottom: 0 }}>
            <div>
              <div className="label">Units</div>
              <div className="desc">Weights are stored in kg and converted for display.</div>
            </div>
            <div className="seg">
              {(['kg', 'lb'] as Unit[]).map((u) => (
                <button key={u} type="button" className={unit === u ? 'on' : ''} onClick={() => setUnit(u)}>
                  {u}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {customTemplates.length > 0 && (
        <section>
          <div className="section-head">
            <h2>Your templates</h2>
          </div>
          <div className="list-rows">
            {customTemplates.map((t) => (
              <div key={t.id} className="ex-row" style={{ padding: 12 }}>
                <Link to={`/template/custom:${t.id}`} className="body" style={{ textDecoration: 'none' }}>
                  <div className="name">{t.name}</div>
                  <div className="meta">{t.exercise_ids.length} exercises</div>
                </Link>
                <button type="button" className="icon-btn" onClick={() => void removeTemplate(t.id)} aria-label={`Delete ${t.name}`}>
                  <TrashIcon />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="section-head">
          <h2>Your data</h2>
        </div>
        <div className="card">
          <p className="small muted" style={{ marginBottom: 12 }}>
            {sessions.length} workout{sessions.length === 1 ? '' : 's'} stored in Supabase. There is no password
            reset, so keep an export somewhere safe.
          </p>
          <div className="row" style={{ gap: 9 }}>
            <button type="button" className="btn sm" onClick={exportJson}>
              Export JSON
            </button>
            <button type="button" className="btn sm" onClick={exportCsv}>
              Export CSV
            </button>
          </div>
        </div>
      </section>

      <section>
        <div className="section-head">
          <h2>Help</h2>
        </div>
        <div className="list-rows">
          <Link to="/?tour=1" className="card row" style={{ gap: 12, textDecoration: 'none' }}>
            <span className="about-icon">
              <CompassIcon />
            </span>
            <div>
              <div style={{ fontWeight: 650 }}>Replay the guided tour</div>
              <p className="small muted">A minute-long walkthrough of every screen.</p>
            </div>
          </Link>
          <Link to="/glossary" className="card row" style={{ gap: 12, textDecoration: 'none' }}>
            <span className="about-icon">
              <SparkIcon />
            </span>
            <div>
              <div style={{ fontWeight: 650 }}>Glossary</div>
              <p className="small muted">RPE, volume, 1RM and the rest, explained.</p>
            </div>
          </Link>
          <Link to="/about" className="card row" style={{ gap: 12, textDecoration: 'none' }}>
            <span className="about-icon">
              <SparkIcon />
            </span>
            <div>
              <div style={{ fontWeight: 650 }}>About RepForge</div>
              <p className="small muted">What the app does and where the data lives.</p>
            </div>
          </Link>
        </div>
      </section>

      <section>
        <div className="section-head">
          <h2>Account</h2>
        </div>
        <button type="button" className="btn danger block" onClick={() => void signOut()}>
          Sign out
        </button>
      </section>

      <p className="small muted" style={{ marginTop: 26, textAlign: 'center' }}>
        RepForge · exercise data from{' '}
        <a href="https://github.com/yuhonas/free-exercise-db" target="_blank" rel="noreferrer noopener">
          free-exercise-db
        </a>{' '}
        (public domain)
      </p>
    </main>
  )
}
