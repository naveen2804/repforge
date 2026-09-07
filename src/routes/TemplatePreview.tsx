import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { TEMPLATE_BY_KEY } from '../data/templates'
import { PROGRAM_BY_KEY } from '../data/programs'
import { useStore } from '../lib/store'
import { useSession } from '../lib/session'
import { formatDuration } from '../lib/format'
import { BackButton, Empty, Spinner } from '../components/Common'
import { BodyMap } from '../components/BodyMap'
import { ExercisePicker } from '../components/ExercisePicker'
import { ExerciseRow } from '../components/ExerciseRow'
import { PlayIcon, PlusIcon, TrashIcon } from '../components/Icons'
import type { BodyPart, PlanItem } from '../lib/types'

interface Resolved {
  name: string
  blurb: string
  focus: BodyPart[]
  templateKey: string | null
  plan: PlanItem[]
  caution?: string
}

/**
 * The last stop before a workout starts. Whatever you arrived from — a split, a saved
 * template, or one session of a program — lands here as an editable list, because a plan
 * is a starting point and the squat rack is always taken by someone.
 *
 * Route keys: `push` (built-in split), `custom:<id>`, `program:<key>:<sessionIndex>`.
 */
export function TemplatePreview() {
  const { key = '' } = useParams()
  const { byId, loading, customTemplates } = useStore()
  const { start } = useSession()
  const navigate = useNavigate()

  const resolved = useMemo<Resolved | null>(() => {
    if (key.startsWith('program:')) {
      const [, programKey, indexRaw] = key.split(':')
      const program = PROGRAM_BY_KEY[programKey]
      const session = program?.sessions[Number(indexRaw) || 0]
      if (!program || !session) return null
      return {
        name: program.sessions.length > 1 ? `${program.name} — ${session.name}` : program.name,
        blurb: program.blurb,
        focus: session.focus,
        templateKey: `program:${programKey}`,
        caution: program.caution,
        plan: session.exercises.map((e) => ({
          exerciseId: e.exerciseId,
          sets: e.sets,
          reps: e.reps,
          durationSeconds: e.durationSeconds,
          note: e.note,
        })),
      }
    }

    if (key.startsWith('custom:')) {
      const found = customTemplates.find((t) => t.id === key.slice(7))
      if (!found) return null
      return {
        name: found.name,
        blurb: 'Your saved template',
        focus: [],
        templateKey: null,
        plan: found.exercise_ids.map((id) => ({ exerciseId: id })),
      }
    }

    const template = TEMPLATE_BY_KEY[key]
    if (!template) return null
    return {
      name: template.name,
      blurb: template.blurb,
      focus: template.focus,
      templateKey: key,
      plan: template.exerciseIds.map((id) => ({ exerciseId: id })),
    }
  }, [key, customTemplates])

  const [plan, setPlan] = useState<PlanItem[]>([])
  const [picking, setPicking] = useState(false)

  useEffect(() => {
    if (resolved) setPlan(resolved.plan)
  }, [resolved])

  if (loading && !resolved) return <Spinner />

  if (!resolved) {
    return (
      <main className="page">
        <BackButton />
        <Empty emoji="🤷" title="Not found">
          That plan no longer exists.
        </Empty>
      </main>
    )
  }

  const rows = plan
    .map((item) => ({ item, exercise: byId.get(item.exerciseId) }))
    .filter((r): r is { item: PlanItem; exercise: NonNullable<typeof r.exercise> } => Boolean(r.exercise))

  return (
    <main className="page" style={{ paddingBottom: 'calc(var(--nav-h) + env(safe-area-inset-bottom) + 92px)' }}>
      <BackButton />

      <div className="row" style={{ marginTop: 12, marginBottom: 16, gap: 14, alignItems: 'flex-start' }}>
        <BodyMap parts={resolved.focus} size={44} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1>{resolved.name}</h1>
          <p className="sub">{resolved.blurb}</p>
        </div>
      </div>

      {resolved.caution && (
        <div className="notice warn" style={{ marginBottom: 16 }}>
          {resolved.caution}
        </div>
      )}

      <div className="ex-list">
        {rows.map(({ item, exercise }) => (
          <ExerciseRow
            key={exercise.id}
            exercise={exercise}
            prescription={describe(item)}
            action={
              <button
                type="button"
                className="icon-btn"
                aria-label={`Remove ${exercise.name}`}
                onClick={() => setPlan((prev) => prev.filter((p) => p.exerciseId !== exercise.id))}
              >
                <TrashIcon />
              </button>
            }
          />
        ))}
      </div>

      {rows.length === 0 && (
        <Empty emoji="📝" title="Empty plan">
          Add a few exercises to get going.
        </Empty>
      )}

      <button type="button" className="btn block" style={{ marginTop: 12 }} onClick={() => setPicking(true)}>
        <PlusIcon />
        Add exercise
      </button>

      <div className="sticky-bar">
        <div className="inner">
          <div style={{ flex: 1 }} className="small muted">
            {rows.length} exercise{rows.length === 1 ? '' : 's'}
          </div>
          <button
            type="button"
            className="btn primary"
            disabled={rows.length === 0}
            onClick={() => {
              start({ name: resolved.name, templateKey: resolved.templateKey, plan })
              navigate('/log')
            }}
          >
            <PlayIcon />
            Start workout
          </button>
        </div>
      </div>

      {picking && (
        <ExercisePicker
          alreadyIn={new Set(plan.map((p) => p.exerciseId))}
          onPick={(id) => {
            setPlan((prev) => (prev.some((p) => p.exerciseId === id) ? prev : [...prev, { exerciseId: id }]))
            setPicking(false)
          }}
          onClose={() => setPicking(false)}
        />
      )}
    </main>
  )
}

/** "3 × 10" or "2 × 45s", plus any coaching note the program carried. */
function describe(item: PlanItem): string | undefined {
  const sets = item.sets ?? 0
  let core: string | null = null
  if (sets && item.reps) core = `${sets} × ${item.reps}`
  else if (sets && item.durationSeconds) core = `${sets} × ${formatDuration(item.durationSeconds)}`
  else if (item.reps) core = `${item.reps} reps`
  else if (item.durationSeconds) core = formatDuration(item.durationSeconds)

  return [core, item.note].filter(Boolean).join(' · ') || undefined
}
