import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { supabase } from './supabase'
import { useAuth } from './auth'
import type { DraftExercise, DraftSession, DraftSet, PlanItem } from './types'

/**
 * The workout in progress lives in localStorage, not in Supabase. That keeps set entry
 * instant and fully usable with no signal in a gym basement; the whole session is written
 * to Supabase in one go when you tap Finish.
 */
const DRAFT_KEY = 'repforge-active-session'

function newId(): string {
  return crypto.randomUUID()
}

export function emptySet(): DraftSet {
  return { id: newId(), reps: null, weightKg: null, durationSeconds: null, rpe: null, completed: false }
}

function readDraft(): DraftSession | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    return raw ? (JSON.parse(raw) as DraftSession) : null
  } catch {
    return null
  }
}

interface SessionValue {
  draft: DraftSession | null
  start: (init: { name: string; templateKey: string | null; plan: PlanItem[] }) => void
  discard: () => void
  addExercise: (exerciseId: string) => void
  removeExercise: (draftExerciseId: string) => void
  moveExercise: (draftExerciseId: string, direction: -1 | 1) => void
  setExerciseNotes: (draftExerciseId: string, notes: string) => void
  toggleTimed: (draftExerciseId: string) => void
  addSet: (draftExerciseId: string) => void
  updateSet: (draftExerciseId: string, setId: string, patch: Partial<DraftSet>) => void
  removeSet: (draftExerciseId: string, setId: string) => void
  setName: (name: string) => void
  setNotes: (notes: string) => void
  finish: () => Promise<string>
}

const SessionContext = createContext<SessionValue | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [draft, setDraft] = useState<DraftSession | null>(readDraft)

  useEffect(() => {
    if (draft) localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
    else localStorage.removeItem(DRAFT_KEY)
  }, [draft])

  const mutateExercise = useCallback(
    (draftExerciseId: string, fn: (ex: DraftExercise) => DraftExercise) => {
      setDraft((d) =>
        d
          ? { ...d, exercises: d.exercises.map((ex) => (ex.id === draftExerciseId ? fn(ex) : ex)) }
          : d,
      )
    },
    [],
  )

  const value = useMemo<SessionValue>(() => {
    /**
     * A prescription from a program pre-fills the set table — a beginner should not have
     * to guess what to type. The sets start unticked, so nothing counts until it is done.
     */
    const makeExercise = (item: PlanItem): DraftExercise => {
      const count = Math.max(1, item.sets ?? 1)
      const sets = Array.from({ length: count }, () => ({
        ...emptySet(),
        reps: item.reps ?? null,
        durationSeconds: item.durationSeconds ?? null,
      }))
      return {
        id: newId(),
        exerciseId: item.exerciseId,
        notes: '',
        sets,
        timedOverride: item.durationSeconds != null ? true : undefined,
        prescription: item.note,
      }
    }

    return {
      draft,

      start: ({ name, templateKey, plan }) =>
        setDraft({
          startedAt: new Date().toISOString(),
          name,
          templateKey,
          notes: '',
          exercises: plan.map(makeExercise),
        }),

      discard: () => setDraft(null),

      addExercise: (exerciseId) =>
        setDraft((d) => {
          if (!d) {
            return {
              startedAt: new Date().toISOString(),
              name: 'Workout',
              templateKey: null,
              notes: '',
              exercises: [makeExercise({ exerciseId })],
            }
          }
          if (d.exercises.some((ex) => ex.exerciseId === exerciseId)) return d
          return { ...d, exercises: [...d.exercises, makeExercise({ exerciseId })] }
        }),

      removeExercise: (id) =>
        setDraft((d) => (d ? { ...d, exercises: d.exercises.filter((ex) => ex.id !== id) } : d)),

      moveExercise: (id, direction) =>
        setDraft((d) => {
          if (!d) return d
          const index = d.exercises.findIndex((ex) => ex.id === id)
          const target = index + direction
          if (index < 0 || target < 0 || target >= d.exercises.length) return d
          const next = [...d.exercises]
          ;[next[index], next[target]] = [next[target], next[index]]
          return { ...d, exercises: next }
        }),

      setExerciseNotes: (id, notes) => mutateExercise(id, (ex) => ({ ...ex, notes })),

      toggleTimed: (id) =>
        mutateExercise(id, (ex) => ({
          ...ex,
          timedOverride: !ex.timedOverride,
          // Clear the fields that belong to the mode being left, so a stale number cannot
          // be saved against the wrong column.
          sets: ex.sets.map((s) =>
            ex.timedOverride ? { ...s, durationSeconds: null } : { ...s, reps: null, weightKg: null },
          ),
        })),

      addSet: (id) =>
        mutateExercise(id, (ex) => {
          // A new set inherits the previous one's numbers — you rarely change both.
          const last = ex.sets[ex.sets.length - 1]
          const seed = last
            ? { ...emptySet(), reps: last.reps, weightKg: last.weightKg, durationSeconds: last.durationSeconds }
            : emptySet()
          return { ...ex, sets: [...ex.sets, seed] }
        }),

      updateSet: (id, setId, patch) =>
        mutateExercise(id, (ex) => ({
          ...ex,
          sets: ex.sets.map((s) => (s.id === setId ? { ...s, ...patch } : s)),
        })),

      removeSet: (id, setId) =>
        mutateExercise(id, (ex) => ({ ...ex, sets: ex.sets.filter((s) => s.id !== setId) })),

      setName: (name) => setDraft((d) => (d ? { ...d, name } : d)),
      setNotes: (notes) => setDraft((d) => (d ? { ...d, notes } : d)),

      finish: async () => {
        if (!draft) throw new Error('No workout in progress.')
        if (!user) throw new Error('You need to be signed in to save a workout.')

        const { data: session, error: sessionError } = await supabase
          .from('workout_sessions')
          .insert({
            user_id: user.id,
            started_at: draft.startedAt,
            ended_at: new Date().toISOString(),
            name: draft.name || 'Workout',
            template_key: draft.templateKey,
            notes: draft.notes || null,
          })
          .select('id')
          .single()
        if (sessionError) throw new Error(sessionError.message)

        // Only exercises that actually got a completed set are worth recording.
        const performed = draft.exercises
          .map((ex) => ({ ...ex, sets: ex.sets.filter((s) => s.completed) }))
          .filter((ex) => ex.sets.length > 0)

        if (performed.length > 0) {
          const { data: rows, error: exError } = await supabase
            .from('session_exercises')
            .insert(
              performed.map((ex, i) => ({
                user_id: user.id,
                session_id: session.id,
                exercise_id: ex.exerciseId,
                order_index: i,
                notes: ex.notes || null,
              })),
            )
            .select('id, order_index')
          if (exError) throw new Error(exError.message)

          const byOrder = new Map(rows.map((r) => [r.order_index, r.id]))
          const setRows = performed.flatMap((ex, i) =>
            ex.sets.map((s, n) => ({
              user_id: user.id,
              session_exercise_id: byOrder.get(i)!,
              set_number: n + 1,
              reps: s.reps,
              weight_kg: s.weightKg,
              duration_seconds: s.durationSeconds,
              rpe: s.rpe,
              completed: true,
            })),
          )
          if (setRows.length > 0) {
            const { error: setError } = await supabase.from('sets').insert(setRows)
            if (setError) throw new Error(setError.message)
          }
        }

        setDraft(null)
        return session.id as string
      },
    }
  }, [draft, user, mutateExercise])

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession(): SessionValue {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession must be used inside SessionProvider')
  return ctx
}
