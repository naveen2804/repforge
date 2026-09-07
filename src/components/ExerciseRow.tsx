import { Link } from 'react-router-dom'
import { EQUIPMENT_LABEL, imageUrl } from '../data/catalog'
import { titleCase } from '../lib/format'
import type { Exercise } from '../lib/types'

/** Placeholder keeps layout stable for the handful of exercises with no photo. */
function Thumb({ exercise }: { exercise: Exercise }) {
  if (exercise.images.length === 0) {
    return <div className="ex-thumb" style={{ display: 'grid', placeItems: 'center', fontSize: 20 }}>🏋️</div>
  }
  return (
    <img className="ex-thumb" src={imageUrl(exercise.id, exercise.images[0])} alt="" loading="lazy" decoding="async" />
  )
}

export function ExerciseRow({
  exercise,
  action,
  prescription,
}: {
  exercise: Exercise
  action?: React.ReactNode
  /** e.g. "3 × 10 · per side" — shown instead of the muscle/equipment line when present. */
  prescription?: string
}) {
  return (
    <div className="ex-row">
      <Link to={`/exercise/${encodeURIComponent(exercise.id)}`} className="row" style={{ flex: 1, minWidth: 0, gap: 12, textDecoration: 'none', color: 'inherit' }}>
        <Thumb exercise={exercise} />
        <div className="body">
          <div className="name">{exercise.name}</div>
          <div className="meta">
            {titleCase(exercise.primaryMuscles[0] ?? exercise.category)} · {EQUIPMENT_LABEL[exercise.equipment]}
            {exercise.mechanic ? ` · ${titleCase(exercise.mechanic)}` : ''}
          </div>
          {prescription && <div className="prescription">{prescription}</div>}
        </div>
      </Link>
      {action}
    </div>
  )
}

/** The same row, but as a button — used inside the "add exercise" picker. */
export function ExercisePickRow({
  exercise,
  selected,
  onClick,
}: {
  exercise: Exercise
  selected: boolean
  onClick: () => void
}) {
  return (
    <button type="button" className="ex-row" onClick={onClick} style={selected ? { borderColor: 'var(--brand)' } : undefined}>
      <Thumb exercise={exercise} />
      <div className="body">
        <div className="name">{exercise.name}</div>
        <div className="meta">
          {titleCase(exercise.primaryMuscles[0] ?? exercise.category)} · {EQUIPMENT_LABEL[exercise.equipment]}
        </div>
      </div>
      <span className={selected ? 'badge brand' : 'badge'}>{selected ? 'Added' : 'Add'}</span>
    </button>
  )
}
