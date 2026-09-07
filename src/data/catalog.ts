import type { BodyPart, Equipment, Exercise } from '../lib/types'

/**
 * The catalogue is a ~820 KB static file, precached by the service worker, so it is
 * fetched once and then available offline. Everything downstream reads it from here.
 */
let cache: Exercise[] | null = null
let inflight: Promise<Exercise[]> | null = null

export function loadExercises(): Promise<Exercise[]> {
  if (cache) return Promise.resolve(cache)
  if (!inflight) {
    inflight = fetch(`${import.meta.env.BASE_URL}exercises.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`Could not load the exercise catalogue (${r.status})`)
        return r.json() as Promise<Exercise[]>
      })
      .then((list) => {
        cache = list
        return list
      })
  }
  return inflight
}

export function cachedExercises(): Exercise[] | null {
  return cache
}

export function imageUrl(exerciseId: string, index: number): string {
  return `${import.meta.env.BASE_URL}ex/${exerciseId}/${index}.webp`
}

export const BODY_PARTS: { key: BodyPart; label: string }[] = [
  { key: 'chest', label: 'Chest' },
  { key: 'back', label: 'Back' },
  { key: 'shoulders', label: 'Shoulders' },
  { key: 'biceps', label: 'Biceps' },
  { key: 'triceps', label: 'Triceps' },
  { key: 'forearms', label: 'Forearms' },
  { key: 'core', label: 'Abs / Core' },
  { key: 'quads', label: 'Quads' },
  { key: 'hamstrings', label: 'Hamstrings' },
  { key: 'glutes', label: 'Glutes' },
  { key: 'calves', label: 'Calves' },
]

export const BODY_PART_LABEL: Record<BodyPart, string> = Object.fromEntries(
  BODY_PARTS.map((b) => [b.key, b.label]),
) as Record<BodyPart, string>

export const EQUIPMENT: { key: Equipment; label: string }[] = [
  { key: 'barbell', label: 'Barbell' },
  { key: 'dumbbell', label: 'Dumbbell' },
  { key: 'machine', label: 'Machine' },
  { key: 'cable', label: 'Cable' },
  { key: 'bodyweight', label: 'Bodyweight' },
  { key: 'kettlebell', label: 'Kettlebell' },
  { key: 'bands', label: 'Bands' },
  { key: 'medicine ball', label: 'Medicine ball' },
  { key: 'exercise ball', label: 'Exercise ball' },
  { key: 'foam roll', label: 'Foam roller' },
  { key: 'other', label: 'Other' },
]

export const EQUIPMENT_LABEL: Record<string, string> = Object.fromEntries(
  EQUIPMENT.map((e) => [e.key, e.label]),
)

/**
 * Timed work logs a duration rather than reps × weight. Cardio and stretches are timed by
 * category; isometric holds like the plank sit under "strength" in the dataset but are
 * tagged `force: 'static'`, which is what actually distinguishes a hold from a rep.
 */
export function isTimedExercise(exercise: Exercise): boolean {
  return exercise.category === 'cardio' || exercise.category === 'stretching' || exercise.force === 'static'
}

export interface Filters {
  query: string
  bodyPart: BodyPart | null
  equipment: Equipment | null
  mechanic: 'compound' | 'isolation' | null
  favoritesOnly: boolean
}

export const EMPTY_FILTERS: Filters = {
  query: '',
  bodyPart: null,
  equipment: null,
  mechanic: null,
  favoritesOnly: false,
}

export function filterExercises(
  exercises: Exercise[],
  filters: Filters,
  favorites: Set<string>,
): Exercise[] {
  const needle = filters.query.trim().toLowerCase()
  const terms = needle ? needle.split(/\s+/) : []

  return exercises.filter((ex) => {
    if (filters.bodyPart && !ex.bodyParts.includes(filters.bodyPart)) return false
    if (filters.equipment && ex.equipment !== filters.equipment) return false
    if (filters.mechanic && ex.mechanic !== filters.mechanic) return false
    if (filters.favoritesOnly && !favorites.has(ex.id)) return false
    if (terms.length === 0) return true

    const haystack = `${ex.name} ${ex.primaryMuscles.join(' ')} ${ex.equipment}`.toLowerCase()
    return terms.every((t) => haystack.includes(t))
  })
}

export function youtubeUrl(exercise: Exercise): string {
  const curated = CURATED_VIDEOS[exercise.id]
  if (curated) return `https://www.youtube.com/watch?v=${curated}`
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(`${exercise.name} tutorial form`)}`
}

/**
 * Hand-picked tutorials for the lifts people look up most. Anything not listed here
 * falls back to a YouTube search deep link, so this map is purely additive.
 */
export const CURATED_VIDEOS: Record<string, string> = {
  'Barbell_Bench_Press_-_Medium_Grip': 'rT7DgCr-3pg',
  Barbell_Squat: 'ultWZbUMPL8',
  Barbell_Deadlift: 'op9kVnSso6Q',
  Barbell_Full_Squat: 'ultWZbUMPL8',
  Front_Barbell_Squat: 'm4ytaCJZpl0',
  Romanian_Deadlift: 'JCXUYuzwNrM',
  Barbell_Curl: 'kwG2ipFRgfo',
  Standing_Military_Press: '2yjwXTZQDDI',
  Dumbbell_Bench_Press: 'VmB1G1K7v94',
  Incline_Dumbbell_Press: '8iPEnn-ltC8',
  Pullups: 'eGo4IYlbE5g',
  'Chin-Up': 'brhRXlOhsAM',
  'Wide-Grip_Lat_Pulldown': 'CAwf7n6Luuc',
  Bent_Over_Barbell_Row: 'FWJR5Ve8bnQ',
  Seated_Cable_Rows: 'GZbfZ033f74',
  'Dips_-_Triceps_Version': '2z8JmcrW-As',
  'Dips_-_Chest_Version': 'wjUmnZH528Y',
  Leg_Press: 'IZxyjW7MPJQ',
  Leg_Extensions: 'YyvSfVjQeL0',
  Lying_Leg_Curls: '1Tq3QdYUuHs',
  Standing_Calf_Raises: '-M4-G8p8fmc',
  Barbell_Hip_Thrust: 'LM8XHLYJoYs',
  Plank: 'ASdvN_XEl_c',
  Hanging_Leg_Raise: 'Pr1ieGZ5atk',
  Crunches: 'Xyd_fa5zoEU',
  Russian_Twist: 'wkD8rjkodUI',
  Pushups: 'IODxDxX7oi4',
  Face_Pull: 'rep-qVOkqgk',
  Triceps_Pushdown: '2-LAMcpzODU',
  Dumbbell_Bicep_Curl: 'ykJmrZ5v0Oo',
  Hammer_Curls: 'zC3nLlEvin4',
  Side_Lateral_Raise: '3VcKaXpzqRo',
  Dumbbell_Shoulder_Press: 'qEwKCR5JCog',
  Upright_Barbell_Row: 'amCU-ziHITM',
  Dumbbell_Lunges: 'D7KaRcUTQeE',
  Barbell_Lunge: 'D7KaRcUTQeE',
  Split_Squat_with_Dumbbells: '2C-uNgKwPLE',
  Good_Morning: 'vKPGe8zb2S0',
  Power_Clean: 'KDWWk3ffQ_Y',
  Clean_and_Jerk: '9HyWjAk7fhY',
  'One-Arm_Kettlebell_Swings': 'YSxHifyI6s8',
  Farmers_Walk: 'Fkzk_RqlYig',
}
