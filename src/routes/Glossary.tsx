import { GLOSSARY_LIST } from '../data/glossary'
import { BackButton } from '../components/Common'

export function Glossary() {
  return (
    <main className="page">
      <BackButton />

      <div className="page-head" style={{ marginTop: 10 }}>
        <div>
          <h1>Glossary</h1>
          <p className="sub">Every bit of gym jargon this app uses, in plain English.</p>
        </div>
      </div>

      <div className="list-rows">
        {GLOSSARY_LIST.map((entry) => (
          <div key={entry.key} className="card">
            <div className="row between" style={{ marginBottom: 5 }}>
              <h3>{entry.term}</h3>
              <span className="badge">{entry.short}</span>
            </div>
            <p className="muted small">{entry.long}</p>
            {entry.example && (
              <div className="notice info" style={{ marginTop: 10 }}>
                {entry.example}
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  )
}
