import { useMemo, useState } from 'react'
import { BODY_PARTS, EMPTY_FILTERS, filterExercises } from '../data/catalog'
import { useStore } from '../lib/store'
import { Sheet } from './Common'
import { ExercisePickRow } from './ExerciseRow'
import { SearchIcon } from './Icons'
import type { BodyPart } from '../lib/types'

/** Search-and-tap picker used to add exercises to a workout in progress. */
export function ExercisePicker({
  alreadyIn,
  onPick,
  onClose,
}: {
  alreadyIn: Set<string>
  onPick: (exerciseId: string) => void
  onClose: () => void
}) {
  const { exercises, favorites } = useStore()
  const [query, setQuery] = useState('')
  const [bodyPart, setBodyPart] = useState<BodyPart | null>(null)

  const results = useMemo(
    () => filterExercises(exercises, { ...EMPTY_FILTERS, query, bodyPart }, favorites).slice(0, 120),
    [exercises, query, bodyPart, favorites],
  )

  return (
    <Sheet title="Add an exercise" onClose={onClose}>
      <div className="search" style={{ marginBottom: 10 }}>
        <SearchIcon />
        <input
          className="input"
          placeholder="Search 876 exercises…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </div>

      <div className="chips" style={{ marginBottom: 12 }}>
        <button type="button" className={bodyPart === null ? 'chip on' : 'chip'} onClick={() => setBodyPart(null)}>
          All
        </button>
        {BODY_PARTS.map((b) => (
          <button
            key={b.key}
            type="button"
            className={bodyPart === b.key ? 'chip on' : 'chip'}
            onClick={() => setBodyPart(bodyPart === b.key ? null : b.key)}
          >
            {b.label}
          </button>
        ))}
      </div>

      <div className="ex-list">
        {results.map((ex) => (
          <ExercisePickRow
            key={ex.id}
            exercise={ex}
            selected={alreadyIn.has(ex.id)}
            onClick={() => onPick(ex.id)}
          />
        ))}
        {results.length === 0 && <p className="muted small">Nothing matches that search.</p>}
      </div>
    </Sheet>
  )
}
