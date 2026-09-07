import { supabase } from './supabase'
import { estimate1RM, startOfDay } from './format'
import type { FullSession, SessionRow, SetRow } from './types'

const SESSION_SELECT = `
  id, started_at, ended_at, name, template_key, notes,
  session_exercises ( id, session_id, exercise_id, order_index, notes,
    sets ( id, session_exercise_id, set_number, reps, weight_kg, duration_seconds, rpe, completed )
  )
`

export async function fetchSessions(limit = 200): Promise<FullSession[]> {
  const { data, error } = await supabase
    .from('workout_sessions')
    .select(SESSION_SELECT)
    .order('started_at', { ascending: false })
    .limit(limit)
  if (error) throw new Error(error.message)
  return normalise((data ?? []) as unknown as FullSession[])
}

export async function fetchSession(id: string): Promise<FullSession | null> {
  const { data, error } = await supabase
    .from('workout_sessions')
    .select(SESSION_SELECT)
    .eq('id', id)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return data ? normalise([data as unknown as FullSession])[0] : null
}

export async function deleteSession(id: string): Promise<void> {
  const { error } = await supabase.from('workout_sessions').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

/** Supabase returns nested rows unordered; sort them so the UI can trust the order. */
function normalise(sessions: FullSession[]): FullSession[] {
  for (const s of sessions) {
    s.session_exercises = (s.session_exercises ?? []).sort((a, b) => a.order_index - b.order_index)
    for (const ex of s.session_exercises) {
      ex.sets = (ex.sets ?? []).sort((a, b) => a.set_number - b.set_number)
    }
  }
  return sessions
}

// ---------------------------------------------------------------------------
// Derived stats — everything below is computed client-side from the rows above.
// ---------------------------------------------------------------------------

/** Volume in kg: reps × weight, summed over completed sets. */
export function sessionVolume(session: FullSession): number {
  let total = 0
  for (const ex of session.session_exercises ?? []) {
    for (const set of ex.sets ?? []) {
      if (set.completed && set.reps && set.weight_kg) total += set.reps * set.weight_kg
    }
  }
  return total
}

export function sessionSetCount(session: FullSession): number {
  return (session.session_exercises ?? []).reduce(
    (n, ex) => n + (ex.sets ?? []).filter((s) => s.completed).length,
    0,
  )
}

export function sessionDurationSeconds(session: SessionRow): number | null {
  if (!session.ended_at) return null
  return Math.max(0, Math.round((Date.parse(session.ended_at) - Date.parse(session.started_at)) / 1000))
}

/**
 * Consecutive days ending today or yesterday. Yesterday still counts so the streak does
 * not appear to break just because you have not trained yet today.
 */
export function currentStreak(sessions: FullSession[]): number {
  if (sessions.length === 0) return 0
  const days = new Set(sessions.map((s) => startOfDay(new Date(s.started_at)).getTime()))
  const today = startOfDay(new Date()).getTime()
  const DAY = 86_400_000

  let cursor = days.has(today) ? today : today - DAY
  if (!days.has(cursor)) return 0

  let streak = 0
  while (days.has(cursor)) {
    streak += 1
    cursor -= DAY
  }
  return streak
}

export function sessionsThisWeek(sessions: FullSession[]): number {
  const now = new Date()
  const monday = startOfDay(now)
  monday.setDate(monday.getDate() - ((now.getDay() + 6) % 7))
  return sessions.filter((s) => Date.parse(s.started_at) >= monday.getTime()).length
}

export interface PersonalRecord {
  exerciseId: string
  bestWeightKg: number
  bestWeightReps: number
  bestEstimated1RM: number
  bestSessionVolume: number
  bestDurationSeconds: number
  lastPerformed: string
  totalSets: number
}

export function personalRecords(sessions: FullSession[]): Map<string, PersonalRecord> {
  const records = new Map<string, PersonalRecord>()

  for (const session of sessions) {
    for (const ex of session.session_exercises ?? []) {
      const completed = (ex.sets ?? []).filter((s) => s.completed)
      if (completed.length === 0) continue

      const record =
        records.get(ex.exercise_id) ??
        ({
          exerciseId: ex.exercise_id,
          bestWeightKg: 0,
          bestWeightReps: 0,
          bestEstimated1RM: 0,
          bestSessionVolume: 0,
          bestDurationSeconds: 0,
          lastPerformed: session.started_at,
          totalSets: 0,
        } satisfies PersonalRecord)

      let volume = 0
      for (const set of completed) {
        if (set.weight_kg && set.weight_kg > record.bestWeightKg) {
          record.bestWeightKg = set.weight_kg
          record.bestWeightReps = set.reps ?? 0
        }
        if (set.weight_kg && set.reps) {
          volume += set.weight_kg * set.reps
          record.bestEstimated1RM = Math.max(record.bestEstimated1RM, estimate1RM(set.weight_kg, set.reps))
        }
        if (set.duration_seconds) {
          record.bestDurationSeconds = Math.max(record.bestDurationSeconds, set.duration_seconds)
        }
      }

      record.bestSessionVolume = Math.max(record.bestSessionVolume, volume)
      record.totalSets += completed.length
      if (Date.parse(session.started_at) > Date.parse(record.lastPerformed)) {
        record.lastPerformed = session.started_at
      }
      records.set(ex.exercise_id, record)
    }
  }

  return records
}

export interface ExercisePoint {
  date: string
  topSetKg: number
  estimated1RM: number
  volume: number
  reps: number
}

/** Per-session best set for one exercise, oldest first — the shape the charts want. */
export function exerciseHistory(sessions: FullSession[], exerciseId: string): ExercisePoint[] {
  const points: ExercisePoint[] = []

  for (const session of sessions) {
    for (const ex of session.session_exercises ?? []) {
      if (ex.exercise_id !== exerciseId) continue
      const completed = (ex.sets ?? []).filter((s) => s.completed)
      if (completed.length === 0) continue

      let topSetKg = 0
      let best1RM = 0
      let volume = 0
      let repsAtTop = 0
      for (const set of completed) {
        if (set.weight_kg && set.reps) {
          volume += set.weight_kg * set.reps
          const e = estimate1RM(set.weight_kg, set.reps)
          if (e > best1RM) best1RM = e
          if (set.weight_kg > topSetKg) {
            topSetKg = set.weight_kg
            repsAtTop = set.reps
          }
        }
      }
      points.push({
        date: session.started_at,
        topSetKg,
        estimated1RM: Math.round(best1RM * 10) / 10,
        volume: Math.round(volume),
        reps: repsAtTop,
      })
    }
  }

  return points.sort((a, b) => Date.parse(a.date) - Date.parse(b.date))
}

/** The last few sets logged for an exercise, newest first — shown on the detail screen. */
export function recentSetsFor(
  sessions: FullSession[],
  exerciseId: string,
  limit = 3,
): { date: string; sets: SetRow[] }[] {
  const out: { date: string; sets: SetRow[] }[] = []
  for (const session of sessions) {
    for (const ex of session.session_exercises ?? []) {
      if (ex.exercise_id !== exerciseId) continue
      const completed = (ex.sets ?? []).filter((s) => s.completed)
      if (completed.length > 0) out.push({ date: session.started_at, sets: completed })
    }
    if (out.length >= limit) break
  }
  return out.slice(0, limit)
}

export function volumeByWeek(sessions: FullSession[], weeks = 12): { week: string; volume: number; workouts: number }[] {
  const buckets = new Map<string, { volume: number; workouts: number }>()
  const now = new Date()

  for (let i = weeks - 1; i >= 0; i--) {
    const d = startOfDay(new Date(now))
    d.setDate(d.getDate() - ((now.getDay() + 6) % 7) - i * 7)
    buckets.set(d.toISOString().slice(0, 10), { volume: 0, workouts: 0 })
  }

  for (const session of sessions) {
    const d = startOfDay(new Date(session.started_at))
    d.setDate(d.getDate() - ((new Date(session.started_at).getDay() + 6) % 7))
    const key = d.toISOString().slice(0, 10)
    const bucket = buckets.get(key)
    if (!bucket) continue
    bucket.volume += sessionVolume(session)
    bucket.workouts += 1
  }

  return [...buckets.entries()].map(([week, v]) => ({ week, ...v }))
}

export function bodyPartSplit(
  sessions: FullSession[],
  bodyPartOf: (exerciseId: string) => string[],
  sinceDays = 30,
): { name: string; sets: number }[] {
  const cutoff = Date.now() - sinceDays * 86_400_000
  const counts = new Map<string, number>()

  for (const session of sessions) {
    if (Date.parse(session.started_at) < cutoff) continue
    for (const ex of session.session_exercises ?? []) {
      const done = (ex.sets ?? []).filter((s) => s.completed).length
      if (done === 0) continue
      for (const part of bodyPartOf(ex.exercise_id)) {
        counts.set(part, (counts.get(part) ?? 0) + done)
      }
    }
  }

  return [...counts.entries()]
    .map(([name, sets]) => ({ name, sets }))
    .sort((a, b) => b.sets - a.sets)
}

// ---------------------------------------------------------------------------
// Favourites and custom templates
// ---------------------------------------------------------------------------

export async function fetchFavorites(): Promise<string[]> {
  const { data, error } = await supabase.from('favorites').select('exercise_id')
  if (error) throw new Error(error.message)
  return (data ?? []).map((r) => r.exercise_id as string)
}

export async function toggleFavorite(userId: string, exerciseId: string, on: boolean): Promise<void> {
  const { error } = on
    ? await supabase.from('favorites').insert({ user_id: userId, exercise_id: exerciseId })
    : await supabase.from('favorites').delete().eq('exercise_id', exerciseId)
  if (error) throw new Error(error.message)
}

export interface CustomTemplate {
  id: string
  name: string
  exercise_ids: string[]
  created_at: string
}

export async function fetchCustomTemplates(): Promise<CustomTemplate[]> {
  const { data, error } = await supabase
    .from('custom_templates')
    .select('id, name, exercise_ids, created_at')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []) as CustomTemplate[]
}

export async function saveCustomTemplate(
  userId: string,
  name: string,
  exerciseIds: string[],
): Promise<void> {
  const { error } = await supabase
    .from('custom_templates')
    .insert({ user_id: userId, name, exercise_ids: exerciseIds })
  if (error) throw new Error(error.message)
}

export async function deleteCustomTemplate(id: string): Promise<void> {
  const { error } = await supabase.from('custom_templates').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
