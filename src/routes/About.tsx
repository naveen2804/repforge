import { Link } from 'react-router-dom'
import { BackButton } from '../components/Common'
import { CompassIcon, DumbbellIcon, HistoryIcon, LibraryIcon, SettingsIcon, SparkIcon } from '../components/Icons'

const TABS = [
  { icon: <LibraryIcon />, name: 'Library', text: '876 exercises with photos, instructions, the muscles each one works, and a video link. Filter by body part, equipment, or compound versus isolation.' },
  { icon: <DumbbellIcon />, name: 'Log', text: 'The workout in progress. Type weight and reps, tick each set as you finish it, rest on the built-in timer, and add or reorder exercises as you go.' },
  { icon: <HistoryIcon />, name: 'History', text: 'Every session you have saved, and a Progress tab with weekly volume, your streak, which body parts you have been training, and a personal record for every lift.' },
  { icon: <SettingsIcon />, name: 'Settings', text: 'Theme, kilos or pounds, your saved templates, and an export of everything you have logged as JSON or CSV.' },
]

export function About() {
  return (
    <main className="page">
      <BackButton />

      <div className="row" style={{ marginTop: 10, marginBottom: 8, gap: 12 }}>
        <img
          src={`${import.meta.env.BASE_URL}icons/icon-192.png`}
          alt=""
          style={{ width: 52, height: 52, borderRadius: 14 }}
        />
        <div>
          <h1>About RepForge</h1>
          <p className="sub">A gym notebook that does the arithmetic.</p>
        </div>
      </div>

      <section style={{ marginTop: 20 }}>
        <div className="card">
          <p>
            Plan a workout, log your sets while you do them, and let the app keep score. It ships with a
            searchable library of 876 exercises, ready-made plans for whatever kind of day you are having, and
            the classic training splits — then turns everything you log into trends, streaks and personal
            records without you having to maintain a spreadsheet.
          </p>
          <p style={{ marginTop: 12 }}>
            It works on a phone or a desktop browser, installs to your home screen, and keeps working when the
            signal in the gym does not.
          </p>
        </div>
      </section>

      <section>
        <div className="section-head">
          <h2>The four tabs</h2>
        </div>
        <div className="list-rows">
          {TABS.map((t) => (
            <div key={t.name} className="card row" style={{ gap: 12, alignItems: 'flex-start' }}>
              <span className="about-icon">{t.icon}</span>
              <div>
                <div style={{ fontWeight: 650 }}>{t.name}</div>
                <p className="small muted" style={{ marginTop: 2 }}>
                  {t.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="section-head">
          <h2>New to all this?</h2>
        </div>
        <div className="list-rows">
          <Link to="/?tour=1" className="card row between" style={{ textDecoration: 'none' }}>
            <div className="row" style={{ gap: 12 }}>
              <span className="about-icon">
                <CompassIcon />
              </span>
              <div>
                <div style={{ fontWeight: 650 }}>Take the guided tour</div>
                <p className="small muted">A minute-long walkthrough of every screen.</p>
              </div>
            </div>
          </Link>
          <Link to="/glossary" className="card row between" style={{ textDecoration: 'none' }}>
            <div className="row" style={{ gap: 12 }}>
              <span className="about-icon">
                <SparkIcon />
              </span>
              <div>
                <div style={{ fontWeight: 650 }}>Glossary</div>
                <p className="small muted">RPE, volume, 1RM and the rest, explained without jargon.</p>
              </div>
            </div>
          </Link>
          <Link to="/programs" className="card row between" style={{ textDecoration: 'none' }}>
            <div className="row" style={{ gap: 12 }}>
              <span className="about-icon">
                <DumbbellIcon />
              </span>
              <div>
                <div style={{ fontWeight: 650 }}>Start with a ready-made plan</div>
                <p className="small muted">Your first week, coming back after a break, or a gentle day.</p>
              </div>
            </div>
          </Link>
        </div>
      </section>

      <section>
        <div className="section-head">
          <h2>Your data</h2>
        </div>
        <div className="card">
          <p className="small muted">
            Workouts are stored against your account and are visible only to you — nobody else using this app
            can see them. Exercise photos and instructions come from{' '}
            <a href="https://github.com/yuhonas/free-exercise-db" target="_blank" rel="noreferrer noopener">
              free-exercise-db
            </a>
            , which is public domain. There is no password reset, so keep an export from Settings somewhere
            safe.
          </p>
        </div>
      </section>

      <p className="small muted" style={{ marginTop: 24, textAlign: 'center' }}>
        Training guidance here is general fitness information, not medical advice.
      </p>
    </main>
  )
}
