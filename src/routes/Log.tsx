import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { imageUrl, isTimedExercise } from '../data/catalog'
import { useSession } from '../lib/session'
import { useSettings } from '../lib/settings'
import { useStore } from '../lib/store'
import { useAuth } from '../lib/auth'
import { recentSetsFor, saveCustomTemplate } from '../lib/db'
import { displayToKg, formatDuration, formatVolume, formatWeight, kgToDisplay, relativeDay } from '../lib/format'
import { ExercisePicker } from '../components/ExercisePicker'
import { RestTimer } from '../components/RestTimer'
import { Empty, ErrorNote, Sheet } from '../components/Common'
import { ArrowDown, ArrowUp, CheckIcon, PlusIcon, TrashIcon } from '../components/Icons'
import { InfoTip } from '../components/InfoTip'
import type { DraftExercise, DraftSet, Unit } from '../lib/types'

export function Log() {
  const { draft, start, discard, addExercise, removeExercise, moveExercise, addSet, updateSet, removeSet, setName, setNotes, toggleTimed, finish } =
    useSession()
  const { byId, refresh, sessions } = useStore()
  const { unit } = useSettings()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [picking, setPicking] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmFinish, setConfirmFinish] = useState(false)
  const [templateName, setTemplateName] = useState('')

  const alreadyIn = useMemo(
    () => new Set((draft?.exercises ?? []).map((ex) => ex.exerciseId)),
    [draft],
  )

  /** What you did the last time you performed each of today's exercises. */
  const lastTime = useMemo(() => {
    const out = new Map<string, string>()
    for (const ex of draft?.exercises ?? []) {
      if (out.has(ex.exerciseId)) continue
      const [previous] = recentSetsFor(sessions, ex.exerciseId, 1)
      if (!previous) continue
      const sets = previous.sets
        .slice(0, 4)
        .map((set) =>
          set.duration_seconds
            ? formatDuration(set.duration_seconds)
            : `${set.reps ?? '—'} × ${set.weight_kg != null ? formatWeight(set.weight_kg, unit) : 'BW'}`,
        )
        .join(', ')
      out.set(ex.exerciseId, `${relativeDay(previous.date)}: ${sets}`)
    }
    return out
  }, [draft, sessions, unit])

  const totals = useMemo(() => {
    let volume = 0
    let sets = 0
    for (const ex of draft?.exercises ?? []) {
      for (const s of ex.sets) {
        if (!s.completed) continue
        sets += 1
        if (s.reps && s.weightKg) volume += s.reps * s.weightKg
      }
    }
    return { volume, sets }
  }, [draft])

  if (!draft) {
    return (
      <main className="page">
        <div className="page-head">
          <h1>Log</h1>
        </div>
        <Empty emoji="🏋️" title="No workout in progress">
          Start one from the <Link to="/" style={{ color: 'var(--brand)' }}>home screen</Link>, pick a split, or add an
          exercise from the library.
        </Empty>
        <button
          type="button"
          className="btn primary lg block"
          onClick={() => start({ name: 'Workout', templateKey: null, plan: [] })}
        >
          <PlusIcon />
          Start an empty workout
        </button>
        {sessions.length > 0 && (
          <button
            type="button"
            className="btn block"
            style={{ marginTop: 10 }}
            onClick={() => {
              const last = sessions[0]
              start({
                name: last.name ?? 'Workout',
                templateKey: last.template_key,
                plan: last.session_exercises.map((ex) => ({
                  exerciseId: ex.exercise_id,
                  sets: ex.sets.length || 1,
                })),
              })
            }}
          >
            Repeat last workout
          </button>
        )}
      </main>
    )
  }

  async function onFinish() {
    setSaving(true)
    setError(null)
    try {
      const id = await finish()
      if (templateName.trim() && user) {
        await saveCustomTemplate(
          user.uid,
          templateName.trim(),
          draft!.exercises.map((ex) => ex.exerciseId),
        )
      }
      await refresh()
      navigate(`/session/${id}`)
    } catch (e) {
      setError((e as Error).message)
      setSaving(false)
      setConfirmFinish(false)
    }
  }

  return (
    <main className="page" style={{ paddingBottom: 'calc(var(--nav-h) + env(safe-area-inset-bottom) + 92px)' }}>
      <div className="page-head">
        <div style={{ flex: 1 }}>
          <input
            className="input"
            value={draft.name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Workout name"
            style={{ fontSize: '1.25rem', fontWeight: 650, border: 'none', background: 'transparent', padding: '2px 0' }}
          />
          <p className="sub">
            {totals.sets} set{totals.sets === 1 ? '' : 's'} · {formatVolume(totals.volume, unit)}
          </p>
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <RestTimer />
      </div>

      <ErrorNote message={error} />

      {draft.exercises.length === 0 ? (
        <Empty emoji="➕" title="Nothing added yet">
          Add your first exercise to start logging sets.
        </Empty>
      ) : (
        <div>
          {draft.exercises.map((ex, index) => (
            <LogExercise
              key={ex.id}
              draftExercise={ex}
              index={index}
              total={draft.exercises.length}
              unit={unit}
              name={byId.get(ex.exerciseId)?.name ?? ex.exerciseId}
              timed={(() => {
                if (ex.timedOverride !== undefined) return ex.timedOverride
                const found = byId.get(ex.exerciseId)
                return found ? isTimedExercise(found) : false
              })()}
              thumb={(() => {
                const found = byId.get(ex.exerciseId)
                return found && found.images.length > 0 ? imageUrl(found.id, found.images[0]) : null
              })()}
              onAddSet={() => addSet(ex.id)}
              onUpdateSet={(setId, patch) => updateSet(ex.id, setId, patch)}
              onRemoveSet={(setId) => removeSet(ex.id, setId)}
              onRemove={() => removeExercise(ex.id)}
              onMove={(dir) => moveExercise(ex.id, dir)}
              onToggleTimed={() => toggleTimed(ex.id)}
              lastTime={lastTime.get(ex.exerciseId) ?? null}
            />
          ))}
        </div>
      )}

      <button type="button" className="btn block" style={{ marginTop: 12 }} onClick={() => setPicking(true)}>
        <PlusIcon />
        Add exercise
      </button>

      <div className="field" style={{ marginTop: 18 }}>
        <label htmlFor="session-notes">Workout notes</label>
        <textarea
          id="session-notes"
          className="input"
          value={draft.notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="How did it feel?"
        />
      </div>

      <button
        type="button"
        className="btn danger block"
        style={{ marginTop: 18 }}
        onClick={() => {
          if (confirm('Discard this workout? Nothing will be saved.')) {
            discard()
            navigate('/')
          }
        }}
      >
        <TrashIcon />
        Discard workout
      </button>

      <div className="sticky-bar">
        <div className="inner">
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700 }} className="tabular">
              {formatVolume(totals.volume, unit)}
            </div>
            <div className="small muted row" style={{ gap: 3 }}>
              {totals.sets} set{totals.sets === 1 ? '' : 's'} · volume
              <InfoTip term="volume" />
            </div>
          </div>
          <button
            type="button"
            className="btn primary"
            onClick={() => setConfirmFinish(true)}
            disabled={totals.sets === 0 || saving}
          >
            <CheckIcon />
            Finish
          </button>
        </div>
      </div>

      {picking && (
        <ExercisePicker
          alreadyIn={alreadyIn}
          onPick={(id) => {
            addExercise(id)
            setPicking(false)
          }}
          onClose={() => setPicking(false)}
        />
      )}

      {confirmFinish && (
        <Sheet
          title="Finish workout"
          onClose={() => !saving && setConfirmFinish(false)}
          footer={
            <button type="button" className="btn primary block" onClick={() => void onFinish()} disabled={saving}>
              {saving ? 'Saving…' : 'Save workout'}
            </button>
          }
        >
          <p className="muted small" style={{ marginBottom: 14 }}>
            {totals.sets} completed set{totals.sets === 1 ? '' : 's'} across{' '}
            {draft.exercises.filter((ex) => ex.sets.some((s) => s.completed)).length} exercises, totalling{' '}
            {formatVolume(totals.volume, unit)}. Unticked sets are not saved.
          </p>
          <div className="field">
            <label htmlFor="tpl">Save this line-up as a template (optional)</label>
            <input
              id="tpl"
              className="input"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="e.g. Tuesday Push"
            />
          </div>
        </Sheet>
      )}
    </main>
  )
}

function LogExercise({
  draftExercise,
  index,
  total,
  unit,
  name,
  timed,
  thumb,
  onAddSet,
  onUpdateSet,
  onRemoveSet,
  onRemove,
  onMove,
  onToggleTimed,
  lastTime,
}: {
  draftExercise: DraftExercise
  index: number
  total: number
  unit: Unit
  name: string
  timed: boolean
  thumb: string | null
  onAddSet: () => void
  onUpdateSet: (setId: string, patch: Partial<DraftSet>) => void
  onRemoveSet: (setId: string) => void
  onRemove: () => void
  onMove: (dir: -1 | 1) => void
  onToggleTimed: () => void
  lastTime: string | null
}) {
  return (
    <div className="log-ex">
      <header>
        {thumb ? <img src={thumb} alt="" loading="lazy" /> : <div style={{ width: 40 }} />}
        <Link to={`/exercise/${encodeURIComponent(draftExercise.exerciseId)}`} className="name truncate" style={{ textDecoration: 'none' }}>
          {name}
        </Link>
        <button type="button" className="icon-btn" onClick={() => onMove(-1)} disabled={index === 0} aria-label="Move up">
          <ArrowUp />
        </button>
        <button type="button" className="icon-btn" onClick={() => onMove(1)} disabled={index === total - 1} aria-label="Move down">
          <ArrowDown />
        </button>
        <button type="button" className="icon-btn" onClick={onRemove} aria-label={`Remove ${name}`}>
          <TrashIcon />
        </button>
      </header>

      {draftExercise.prescription && (
        <p className="small muted" style={{ margin: '-4px 0 6px' }}>{draftExercise.prescription}</p>
      )}

      {lastTime && <p className="last-time">Last time — {lastTime}</p>}

      <table className="set-table">
        <thead>
          <tr>
            <th>#</th>
            {timed ? (
              <th>Seconds</th>
            ) : (
              <>
                <th>
                  <span className="th-label">
                    {unit}
                    <InfoTip term="bodyweight" label="weight" />
                  </span>
                </th>
                <th>Reps</th>
              </>
            )}
            <th>
              <span className="th-label">
                RPE
                <InfoTip term="rpe" />
              </span>
            </th>
            <th />
          </tr>
        </thead>
        <tbody>
          {draftExercise.sets.map((set, i) => (
            <tr key={set.id} className={set.completed ? 'done' : ''}>
              <td className="num">{i + 1}</td>
              {timed ? (
                <td>
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="—"
                    value={set.durationSeconds ?? ''}
                    onChange={(e) =>
                      onUpdateSet(set.id, { durationSeconds: e.target.value === '' ? null : Number(e.target.value) })
                    }
                  />
                </td>
              ) : (
                <>
                  <td>
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.5"
                      placeholder="BW"
                      value={set.weightKg == null ? '' : Math.round(kgToDisplay(set.weightKg, unit) * 100) / 100}
                      onChange={(e) =>
                        onUpdateSet(set.id, {
                          weightKg: e.target.value === '' ? null : displayToKg(Number(e.target.value), unit),
                        })
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      inputMode="numeric"
                      placeholder="—"
                      value={set.reps ?? ''}
                      onChange={(e) => onUpdateSet(set.id, { reps: e.target.value === '' ? null : Number(e.target.value) })}
                    />
                  </td>
                </>
              )}
              <td>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.5"
                  min="1"
                  max="10"
                  placeholder="—"
                  value={set.rpe ?? ''}
                  onChange={(e) => onUpdateSet(set.id, { rpe: e.target.value === '' ? null : Number(e.target.value) })}
                />
              </td>
              <td>
                <button
                  type="button"
                  className={set.completed ? 'check on' : 'check'}
                  onClick={() => onUpdateSet(set.id, { completed: !set.completed })}
                  aria-label={set.completed ? `Mark set ${i + 1} incomplete` : `Mark set ${i + 1} complete`}
                >
                  <CheckIcon />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="row" style={{ marginTop: 9, gap: 8 }}>
        <button type="button" className="btn sm" onClick={onAddSet}>
          <PlusIcon />
          Add set
        </button>
        {draftExercise.sets.length > 1 && (
          <button
            type="button"
            className="btn ghost sm"
            onClick={() => onRemoveSet(draftExercise.sets[draftExercise.sets.length - 1].id)}
          >
            Remove last
          </button>
        )}
        <button
          type="button"
          className="btn ghost sm"
          style={{ marginLeft: 'auto' }}
          onClick={onToggleTimed}
          title="Switch between logging reps and logging time"
        >
          {timed ? 'Log reps instead' : 'Log time instead'}
        </button>
      </div>
    </div>
  )
}
