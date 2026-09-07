import { useState } from 'react'
import { GLOSSARY, type GlossaryEntry, type GlossaryKey } from '../data/glossary'
import { Sheet } from './Common'
import { InfoIcon } from './Icons'

/**
 * A tiny ⓘ next to a label. Tapping it explains the term in full — a sheet rather than a
 * hover tooltip, because most of this app is used one-handed on a phone.
 */
export function InfoTip({ term, label }: { term: GlossaryKey; label?: string }) {
  const [open, setOpen] = useState(false)
  const entry: GlossaryEntry = GLOSSARY[term]

  return (
    <>
      <button
        type="button"
        className="info-tip"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setOpen(true)
        }}
        aria-label={`What does ${label ?? entry.term} mean?`}
      >
        <InfoIcon />
      </button>
      {open && (
        <Sheet title={entry.term} onClose={() => setOpen(false)}>
          <p style={{ marginBottom: entry.example ? 12 : 0 }}>{entry.long}</p>
          {entry.example && <div className="notice info">{entry.example}</div>}
        </Sheet>
      )}
    </>
  )
}

/** The bracketed one-liner, for places where there is room to just say it inline. */
export function Hint({ term }: { term: GlossaryKey }) {
  return <span className="muted"> ({GLOSSARY[term].short})</span>
}
