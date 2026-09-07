import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { BODY_PARTS, EMPTY_FILTERS, EQUIPMENT, filterExercises } from '../data/catalog'
import { useStore } from '../lib/store'
import { Empty, Spinner } from '../components/Common'
import { ExerciseRow } from '../components/ExerciseRow'
import { SearchIcon, StarIcon } from '../components/Icons'
import { InfoTip } from '../components/InfoTip'
import type { BodyPart, Equipment } from '../lib/types'

const PAGE = 40

export function Library() {
  const { exercises, favorites, loading, toggleFavorite } = useStore()
  const [params, setParams] = useSearchParams()

  const [query, setQuery] = useState('')
  const [equipment, setEquipment] = useState<Equipment | null>(null)
  const [mechanic, setMechanic] = useState<'compound' | 'isolation' | null>(null)
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [visible, setVisible] = useState(PAGE)

  const bodyPart = (params.get('part') as BodyPart | null) ?? null

  const results = useMemo(
    () =>
      filterExercises(
        exercises,
        { ...EMPTY_FILTERS, query, bodyPart, equipment, mechanic, favoritesOnly },
        favorites,
      ),
    [exercises, query, bodyPart, equipment, mechanic, favoritesOnly, favorites],
  )

  // Reset the "show more" window whenever the result set itself changes.
  useEffect(() => setVisible(PAGE), [query, bodyPart, equipment, mechanic, favoritesOnly])

  function setBodyPart(next: BodyPart | null) {
    const p = new URLSearchParams(params)
    if (next) p.set('part', next)
    else p.delete('part')
    setParams(p, { replace: true })
  }

  if (loading && exercises.length === 0) return <Spinner />

  return (
    <main className="page">
      <div className="page-head">
        <div>
          <h1>Library</h1>
          <p className="sub">
            {results.length} of {exercises.length} exercises
          </p>
        </div>
      </div>

      <div className="search" style={{ marginBottom: 10 }}>
        <SearchIcon />
        <input
          className="input"
          placeholder="Search by name, muscle or equipment…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoCapitalize="none"
          autoCorrect="off"
        />
      </div>

      <div className="chips" style={{ marginBottom: 8 }}>
        <button type="button" className={bodyPart === null ? 'chip on' : 'chip'} onClick={() => setBodyPart(null)}>
          All body parts
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

      <div className="chips" style={{ marginBottom: 8 }}>
        <button type="button" className={equipment === null ? 'chip on' : 'chip'} onClick={() => setEquipment(null)}>
          Any equipment
        </button>
        {EQUIPMENT.map((e) => (
          <button
            key={e.key}
            type="button"
            className={equipment === e.key ? 'chip on' : 'chip'}
            onClick={() => setEquipment(equipment === e.key ? null : e.key)}
          >
            {e.label}
          </button>
        ))}
      </div>

      <div className="chips" style={{ marginBottom: 16, alignItems: 'center' }}>
        <button
          type="button"
          className={mechanic === 'compound' ? 'chip on' : 'chip'}
          onClick={() => setMechanic(mechanic === 'compound' ? null : 'compound')}
        >
          Compound
        </button>
        <InfoTip term="compound" />
        <button
          type="button"
          className={mechanic === 'isolation' ? 'chip on' : 'chip'}
          onClick={() => setMechanic(mechanic === 'isolation' ? null : 'isolation')}
        >
          Isolation
        </button>
        <InfoTip term="isolation" />
        <button
          type="button"
          className={favoritesOnly ? 'chip on' : 'chip'}
          onClick={() => setFavoritesOnly((v) => !v)}
        >
          ★ Favourites
        </button>
      </div>

      {results.length === 0 ? (
        <Empty emoji="🔍" title="No matches">
          Try a different search or clear a filter.
        </Empty>
      ) : (
        <>
          <div className="ex-list">
            {results.slice(0, visible).map((ex) => (
              <ExerciseRow
                key={ex.id}
                exercise={ex}
                action={
                  <button
                    type="button"
                    className="icon-btn"
                    aria-label={favorites.has(ex.id) ? 'Remove favourite' : 'Add favourite'}
                    style={favorites.has(ex.id) ? { color: 'var(--brand)' } : undefined}
                    onClick={() => void toggleFavorite(ex.id)}
                  >
                    <StarIcon filled={favorites.has(ex.id)} />
                  </button>
                }
              />
            ))}
          </div>
          {visible < results.length && (
            <button type="button" className="btn block" style={{ marginTop: 12 }} onClick={() => setVisible((v) => v + PAGE)}>
              Show more ({results.length - visible} left)
            </button>
          )}
        </>
      )}
    </main>
  )
}
