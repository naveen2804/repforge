import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { EQUIPMENT_LABEL, imageUrl, isTimedExercise, youtubeUrl } from '../data/catalog'
import { useStore } from '../lib/store'
import { useSession } from '../lib/session'
import { useSettings } from '../lib/settings'
import { exerciseHistory, personalRecords, recentSetsFor } from '../lib/db'
import { formatDuration, formatWeight, relativeDay, titleCase } from '../lib/format'
import { BackButton, Empty, Spinner } from '../components/Common'
import { ExternalIcon, PlusIcon, StarIcon } from '../components/Icons'
import { ProgressChart } from '../components/ProgressChart'
import { InfoTip } from '../components/InfoTip'

export function ExerciseDetail() {
  const { id = '' } = useParams()
  const exerciseId = decodeURIComponent(id)
  const { byId, loading, sessions, favorites, toggleFavorite } = useStore()
  const { draft, addExercise } = useSession()
  const { unit } = useSettings()
  const navigate = useNavigate()
  const [added, setAdded] = useState(false)

  const exercise = byId.get(exerciseId)

  const recent = useMemo(() => recentSetsFor(sessions, exerciseId), [sessions, exerciseId])
  const history = useMemo(() => exerciseHistory(sessions, exerciseId), [sessions, exerciseId])
  const record = useMemo(() => personalRecords(sessions).get(exerciseId), [sessions, exerciseId])

  if (loading && !exercise) return <Spinner />

  if (!exercise) {
    return (
      <main className="page">
        <BackButton />
        <Empty emoji="🤔" title="Exercise not found">
          It may have been renamed in the catalogue.
        </Empty>
      </main>
    )
  }

  const timed = isTimedExercise(exercise)
  const isFavorite = favorites.has(exercise.id)

  function addToWorkout() {
    addExercise(exerciseId)
    setAdded(true)
    setTimeout(() => navigate('/log'), 350)
  }

  return (
    <main className="page">
      <div className="row between" style={{ marginBottom: 12 }}>
        <BackButton />
        <button
          type="button"
          className="btn ghost sm"
          onClick={() => void toggleFavorite(exercise.id)}
          style={isFavorite ? { color: 'var(--brand)' } : undefined}
        >
          <StarIcon filled={isFavorite} />
          {isFavorite ? 'Favourited' : 'Favourite'}
        </button>
      </div>

      <h1 style={{ marginBottom: 10 }}>{exercise.name}</h1>

      <div className="row wrap" style={{ marginBottom: 14, gap: 6 }}>
        <span className="badge brand">{EQUIPMENT_LABEL[exercise.equipment]}</span>
        {exercise.mechanic && <span className="badge">{titleCase(exercise.mechanic)}</span>}
        <span className="badge">{titleCase(exercise.level)}</span>
        {exercise.force && <span className="badge">{titleCase(exercise.force)}</span>}
        <span className="badge">{titleCase(exercise.category)}</span>
      </div>

      {exercise.images.length > 0 && (
        <div className={exercise.images.length > 1 ? 'hero' : 'hero single'} style={{ marginBottom: 16 }}>
          {exercise.images.map((i) => (
            <img key={i} src={imageUrl(exercise.id, i)} alt={`${exercise.name} demonstration`} loading="lazy" />
          ))}
        </div>
      )}

      <div className="row" style={{ gap: 9, marginBottom: 20 }}>
        <button type="button" className="btn primary" style={{ flex: 1 }} onClick={addToWorkout} disabled={added}>
          <PlusIcon />
          {added ? 'Added!' : draft ? 'Add to workout' : 'Start workout with this'}
        </button>
        <a className="btn" href={youtubeUrl(exercise)} target="_blank" rel="noreferrer noopener">
          <ExternalIcon />
          Video
        </a>
      </div>

      <section>
        <div className="section-head">
          <h2>Muscles worked</h2>
        </div>
        <div className="card">
          <div className="setting-row" style={{ paddingTop: 0 }}>
            <div className="label">Primary</div>
            <div className="row wrap" style={{ gap: 5, justifyContent: 'flex-end' }}>
              {exercise.primaryMuscles.map((m) => (
                <span key={m} className="badge brand">
                  {titleCase(m)}
                </span>
              ))}
            </div>
          </div>
          {exercise.secondaryMuscles.length > 0 && (
            <div className="setting-row" style={{ paddingBottom: 0 }}>
              <div className="label">Secondary</div>
              <div className="row wrap" style={{ gap: 5, justifyContent: 'flex-end' }}>
                {exercise.secondaryMuscles.map((m) => (
                  <span key={m} className="badge">
                    {titleCase(m)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {exercise.instructions.length > 0 && (
        <section>
          <div className="section-head">
            <h2>How to do it</h2>
          </div>
          <div className="card">
            <ol className="steps">
              {exercise.instructions.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {record && (
        <section>
          <div className="section-head">
            <h2>Your records</h2>
          </div>
          <div className="grid stats">
            {timed ? (
              <div className="stat">
                <div className="value tabular">{formatDuration(record.bestDurationSeconds)}</div>
                <div className="label">Longest</div>
              </div>
            ) : (
              <>
                <div className="stat">
                  <div className="value tabular">{formatWeight(record.bestWeightKg, unit)}</div>
                  <div className="label">Heaviest set</div>
                </div>
                <div className="stat">
                  <div className="value tabular">{formatWeight(record.bestEstimated1RM, unit)}</div>
                  <div className="label row" style={{ gap: 3 }}>
                    Est. 1RM
                    <InfoTip term="oneRepMax" />
                  </div>
                </div>
              </>
            )}
            <div className="stat">
              <div className="value tabular">{record.totalSets}</div>
              <div className="label">Sets logged</div>
            </div>
          </div>
        </section>
      )}

      {history.length > 1 && !timed && (
        <section>
          <div className="section-head">
            <h2>Progress</h2>
            <span className="small muted">Top set per workout</span>
          </div>
          <div className="card">
            <ProgressChart points={history} unit={unit} />
          </div>
        </section>
      )}

      {recent.length > 0 && (
        <section>
          <div className="section-head">
            <h2>Recent sets</h2>
          </div>
          <div className="list-rows">
            {recent.map((entry) => (
              <div key={entry.date} className="card tight">
                <div className="row between">
                  <span className="small" style={{ fontWeight: 600 }}>
                    {relativeDay(entry.date)}
                  </span>
                  <span className="small muted tabular">
                    {entry.sets
                      .map((s) =>
                        s.duration_seconds
                          ? formatDuration(s.duration_seconds)
                          : `${s.reps ?? '—'}×${s.weight_kg != null ? formatWeight(s.weight_kg, unit) : 'BW'}`,
                      )
                      .join('  ·  ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
