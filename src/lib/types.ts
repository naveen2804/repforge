export type BodyPart =
  | 'chest' | 'back' | 'shoulders' | 'biceps' | 'triceps' | 'forearms'
  | 'core' | 'quads' | 'hamstrings' | 'glutes' | 'calves'

export type Equipment =
  | 'bodyweight' | 'barbell' | 'dumbbell' | 'machine' | 'cable' | 'kettlebell'
  | 'bands' | 'medicine ball' | 'exercise ball' | 'foam roll' | 'other'

export interface Exercise {
  id: string
  name: string
  bodyParts: BodyPart[]
  primaryMuscles: string[]
  secondaryMuscles: string[]
  equipment: Equipment
  category: string
  mechanic: 'compound' | 'isolation' | null
  force: string | null
  level: 'beginner' | 'intermediate' | 'expert'
  instructions: string[]
  images: number[]
}

export type Unit = 'kg' | 'lb'
export type ThemeChoice = 'light' | 'dark' | 'system'

/** A set as it is being edited in the active session (weights always in kg). */
export interface DraftSet {
  id: string
  reps: number | null
  weightKg: number | null
  durationSeconds: number | null
  rpe: number | null
  completed: boolean
}

export interface DraftExercise {
  id: string
  exerciseId: string
  notes: string
  sets: DraftSet[]
  /** Forces the reps/weight or duration entry mode, overriding what the catalogue implies. */
  timedOverride?: boolean
  /** Free-text coaching note carried over from a program, e.g. "per side". */
  prescription?: string
}

/** One line of a template or program: what to do, and optionally how much of it. */
export interface PlanItem {
  exerciseId: string
  sets?: number
  reps?: number
  durationSeconds?: number
  note?: string
}

export interface DraftSession {
  startedAt: string
  name: string
  templateKey: string | null
  notes: string
  exercises: DraftExercise[]
}

/** Workout records as stored (one Firestore document per session, exercises and sets nested). */
export interface SessionRow {
  id: string
  started_at: string
  ended_at: string | null
  name: string | null
  template_key: string | null
  notes: string | null
}

export interface SetRow {
  id: string
  session_exercise_id: string
  set_number: number
  reps: number | null
  weight_kg: number | null
  duration_seconds: number | null
  rpe: number | null
  completed: boolean
}

export interface SessionExerciseRow {
  id: string
  session_id: string
  exercise_id: string
  order_index: number
  notes: string | null
  sets: SetRow[]
}

export interface FullSession extends SessionRow {
  session_exercises: SessionExerciseRow[]
}
