import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LEVEL_LABEL, PROGRAMS, PROGRAM_CATEGORIES } from '../data/programs'
import { BodyMap } from '../components/BodyMap'
import { BackButton } from '../components/Common'

/**
 * Programs are indexed by situation rather than by muscle: what you can commit to, what
 * kit you have, and how your body feels today.
 */
export function Programs() {
  const [category, setCategory] = useState<string | null>(null)
  const shown = category ? PROGRAMS.filter((p) => p.category === category) : PROGRAMS

  return (
    <main className="page">
      <BackButton to="/" label="Home" />

      <div className="page-head" style={{ marginTop: 10 }}>
        <div>
          <h1>Ready-made plans</h1>
          <p className="sub">Pick the one that matches where you are today.</p>
        </div>
      </div>

      <div className="chips" style={{ marginBottom: 16 }}>
        <button type="button" className={category === null ? 'chip on' : 'chip'} onClick={() => setCategory(null)}>
          All
        </button>
        {PROGRAM_CATEGORIES.map((c) => (
          <button
            key={c.key}
            type="button"
            className={category === c.key ? 'chip on' : 'chip'}
            onClick={() => setCategory(category === c.key ? null : c.key)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {PROGRAM_CATEGORIES.filter((c) => !category || c.key === category).map((c) => {
        const list = shown.filter((p) => p.category === c.key)
        if (list.length === 0) return null
        return (
          <section key={c.key}>
            <div className="section-head">
              <h2>{c.label}</h2>
              <span className="small muted">{c.blurb}</span>
            </div>
            <div className="list-rows">
              {list.map((p) => (
                <Link key={p.key} to={`/program/${p.key}`} className="program-row">
                  <BodyMap parts={p.sessions[0].focus} size={34} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="name">{p.name}</div>
                    <div className="meta">{p.blurb}</div>
                    <div className="row wrap" style={{ gap: 5, marginTop: 6 }}>
                      <span className="badge brand">{LEVEL_LABEL[p.level]}</span>
                      <span className="badge">{p.minutes} min</span>
                      <span className="badge">{p.perWeek}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )
      })}
    </main>
  )
}
