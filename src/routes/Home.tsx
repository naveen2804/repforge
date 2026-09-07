import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { BODY_PARTS } from '../data/catalog'
import { TEMPLATES } from '../data/templates'
import { PROGRAMS } from '../data/programs'
import { useStore } from '../lib/store'
import { useSession } from '../lib/session'
import { useSettings } from '../lib/settings'
import { useAuth } from '../lib/auth'
import { currentStreak, sessionSetCount, sessionVolume, sessionsThisWeek } from '../lib/db'
import { formatVolume, relativeDay } from '../lib/format'
import { Spinner } from '../components/Common'
import { BodyMap } from '../components/BodyMap'
import { InfoTip } from '../components/InfoTip'
import { ChevronRight, CompassIcon, FlameIcon, PlayIcon, PlusIcon } from '../components/Icons'

/** The plans surfaced on the home screen; the rest live behind "See all". */
const FEATURED = ['first-week', 'express-20', 'under-the-weather', 'no-equipment']

export function Home() {
  const { loading, sessions, exercises } = useStore()
  const { draft, start } = useSession()
  const { unit } = useSettings()
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()

  // Returning users get the About card collapsed; a first-timer sees it open.
  const [aboutOpen, setAboutOpen] = useState(() => sessions.length === 0)

  const stats = useMemo(
    () => ({
      week: sessionsThisWeek(sessions),
      streak: currentStreak(sessions),
      total: sessions.length,
    }),
    [sessions],
  )

  const last = sessions[0]
  const featured = FEATURED.map((k) => PROGRAMS.find((p) => p.key === k)).filter(
    (p): p is NonNullable<typeof p> => Boolean(p),
  )

  function startEmpty() {
    start({ name: 'Workout', templateKey: null, plan: [] })
    navigate('/log')
  }

  if (loading && exercises.length === 0) return <Spinner />

  return (
    <main className="page">
      <div className="page-head">
        <div>
          <h1>Hey{profile?.username ? `, ${profile.username}` : ''} 👋</h1>
          <p className="sub">
            {stats.week === 0
              ? 'No workouts logged this week yet.'
              : `${stats.week} workout${stats.week === 1 ? '' : 's'} logged this week.`}
          </p>
        </div>
      </div>

      <section>
        <div className="grid stats">
          <div className="stat">
            <div className="value tabular">{stats.week}</div>
            <div className="label">This week</div>
          </div>
          <div className="stat">
            <div className="value tabular row" style={{ gap: 5 }}>
              {stats.streak}
              {stats.streak > 0 && <FlameIcon />}
            </div>
            <div className="label row" style={{ gap: 3 }}>
              Day streak
              <InfoTip term="streak" />
            </div>
          </div>
          <div className="stat">
            <div className="value tabular">{stats.total}</div>
            <div className="label">Total workouts</div>
          </div>
        </div>
      </section>

      <section>
        {draft ? (
          <Link to="/log" className="card row between" style={{ textDecoration: 'none', borderColor: 'var(--brand)' }}>
            <div>
              <span className="badge brand">In progress</span>
              <div style={{ fontWeight: 650, marginTop: 6 }}>{draft.name || 'Workout'}</div>
              <div className="small muted">
                {draft.exercises.length} exercise{draft.exercises.length === 1 ? '' : 's'} · started{' '}
                {relativeDay(draft.startedAt).toLowerCase()}
              </div>
            </div>
            <span className="btn primary sm">
              <PlayIcon />
              Resume
            </span>
          </Link>
        ) : (
          <button type="button" className="btn primary lg block" onClick={startEmpty}>
            <PlusIcon />
            Start an empty workout
          </button>
        )}
      </section>

      {/* About — open by default until the first workout is logged. */}
      <section>
        <div className="about-card">
          <button
            type="button"
            className="about-toggle"
            onClick={() => setAboutOpen((v) => !v)}
            aria-expanded={aboutOpen}
          >
            <img src={`${import.meta.env.BASE_URL}icons/icon-192.png`} alt="" />
            <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
              <div style={{ fontWeight: 650 }}>What is RepForge?</div>
              <div className="small muted">A gym notebook that does the arithmetic.</div>
            </div>
            <ChevronRight className={aboutOpen ? 'rot' : ''} />
          </button>

          {aboutOpen && (
            <div className="about-body">
              <p className="small">
                Plan a workout, tick off sets as you do them, and let the app keep score. It ships with a
                searchable library of <strong>876 exercises</strong> — photos, instructions and a video link for
                each — plus ready-made plans for whatever kind of day you are having and the classic training
                splits.
              </p>
              <p className="small" style={{ marginTop: 10 }}>
                Everything you log turns into <strong>volume trends, streaks and personal records</strong> on its
                own. It installs to your home screen and keeps working when the gym Wi-Fi does not. Your workouts
                are private to your account.
              </p>
              <div className="row wrap" style={{ gap: 8, marginTop: 14 }}>
                <Link to="/?tour=1" className="btn sm primary">
                  <CompassIcon />
                  Take the tour
                </Link>
                <Link to="/about" className="btn sm">
                  More about the app
                </Link>
                <Link to="/glossary" className="btn sm">
                  Glossary
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <section>
        <div className="section-head">
          <h2>Ready-made plans</h2>
          <Link to="/programs" className="small" style={{ color: 'var(--brand)' }}>
            See all {PROGRAMS.length}
          </Link>
        </div>
        <div className="grid splits">
          {featured.map((p) => (
            <Link key={p.key} to={`/program/${p.key}`} className="tile with-map">
              <BodyMap parts={p.sessions[0].focus} size={34} />
              <div style={{ minWidth: 0 }}>
                <span className="label">{p.name}</span>
                <span className="meta">{p.blurb}</span>
                <span className="badge" style={{ marginTop: 6 }}>
                  {p.minutes} min
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="section-head">
          <h2 className="row" style={{ gap: 4 }}>
            Splits
            <InfoTip term="split" />
          </h2>
          <span className="small muted">Editable before you start</span>
        </div>
        <div className="grid splits">
          {TEMPLATES.map((t) => (
            <Link key={t.key} to={`/template/${t.key}`} className="tile with-map">
              <BodyMap parts={t.focus} size={34} />
              <div style={{ minWidth: 0 }}>
                <span className="label">{t.name}</span>
                <span className="meta">{t.blurb}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="section-head">
          <h2>Body parts</h2>
          <Link to="/library" className="small" style={{ color: 'var(--brand)' }}>
            Browse all
          </Link>
        </div>
        <div className="grid parts">
          {BODY_PARTS.map((b) => (
            <Link key={b.key} to={`/library?part=${b.key}`} className="tile part-tile">
              <BodyMap parts={[b.key]} size={32} />
              <span className="label">{b.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {last && (
        <section>
          <div className="section-head">
            <h2>Last workout</h2>
            <Link to="/history" className="small" style={{ color: 'var(--brand)' }}>
              All history
            </Link>
          </div>
          <Link to={`/session/${last.id}`} className="card" style={{ display: 'block', textDecoration: 'none' }}>
            <div className="row between">
              <div style={{ fontWeight: 650 }}>{last.name ?? 'Workout'}</div>
              <span className="badge">{relativeDay(last.started_at)}</span>
            </div>
            <div className="small muted" style={{ marginTop: 6 }}>
              {last.session_exercises.length} exercises · {sessionSetCount(last)} sets ·{' '}
              {formatVolume(sessionVolume(last), unit)} volume
            </div>
          </Link>
        </section>
      )}

      {/* The tour is mounted by App; this keeps the ?tour=1 deep link honest. */}
      {params.get('tour') === '1' && <span hidden />}
    </main>
  )
}
