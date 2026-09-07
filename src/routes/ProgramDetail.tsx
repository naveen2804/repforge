import { Link, useParams } from 'react-router-dom'
import { LEVEL_LABEL, PROGRAM_BY_KEY } from '../data/programs'
import { useStore } from '../lib/store'
import { formatDuration } from '../lib/format'
import { BackButton, Empty } from '../components/Common'
import { BodyMap } from '../components/BodyMap'
import { ChevronRight, ShieldIcon } from '../components/Icons'

export function ProgramDetail() {
  const { key = '' } = useParams()
  const { byId } = useStore()
  const program = PROGRAM_BY_KEY[key]

  if (!program) {
    return (
      <main className="page">
        <BackButton to="/programs" label="Plans" />
        <Empty emoji="🤷" title="Plan not found" />
      </main>
    )
  }

  return (
    <main className="page">
      <BackButton to="/programs" label="Plans" />

      <div className="row" style={{ marginTop: 12, marginBottom: 14, gap: 14, alignItems: 'flex-start' }}>
        <BodyMap parts={program.sessions[0].focus} size={48} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1>{program.name}</h1>
          <p className="sub">{program.blurb}</p>
        </div>
      </div>

      <div className="row wrap" style={{ gap: 6, marginBottom: 18 }}>
        <span className="badge brand">{LEVEL_LABEL[program.level]}</span>
        <span className="badge">{program.minutes} min</span>
        <span className="badge">{program.perWeek}</span>
        {program.tags.map((t) => (
          <span key={t} className="badge">
            {t}
          </span>
        ))}
      </div>

      <section style={{ marginTop: 0 }}>
        <div className="section-head">
          <h2>Who it's for</h2>
        </div>
        <div className="card">
          <p>{program.who}</p>
        </div>
      </section>

      <section>
        <div className="section-head">
          <h2>How to run it</h2>
        </div>
        <div className="card">
          <p>{program.howToRun}</p>
        </div>
      </section>

      {program.caution && (
        <div className="notice warn row" style={{ marginTop: 20, gap: 10, alignItems: 'flex-start' }}>
          <ShieldIcon />
          <span>{program.caution}</span>
        </div>
      )}

      <section>
        <div className="section-head">
          <h2>{program.sessions.length > 1 ? `${program.sessions.length} sessions` : 'The session'}</h2>
          <span className="small muted">Tap to review and start</span>
        </div>
        <div className="list-rows">
          {program.sessions.map((session, i) => (
            <Link key={session.name} to={`/template/program:${program.key}:${i}`} className="card session-card">
              <div className="row between" style={{ marginBottom: 8 }}>
                <div className="row" style={{ gap: 10 }}>
                  <BodyMap parts={session.focus} size={26} />
                  <span style={{ fontWeight: 650 }}>{session.name}</span>
                </div>
                <ChevronRight />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {session.exercises.map((e) => (
                  <div key={e.exerciseId} className="row between small">
                    <span className="truncate muted">{byId.get(e.exerciseId)?.name ?? e.exerciseId}</span>
                    <span className="tabular" style={{ whiteSpace: 'nowrap', marginLeft: 10 }}>
                      {e.reps
                        ? `${e.sets} × ${e.reps}`
                        : `${e.sets} × ${formatDuration(e.durationSeconds ?? 0)}`}
                    </span>
                  </div>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
