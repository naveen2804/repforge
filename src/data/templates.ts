import type { BodyPart } from '../lib/types'

export interface SplitTemplate {
  key: string
  name: string
  blurb: string
  focus: BodyPart[]
  /** Exercise ids from the static catalogue, in the order they should be performed. */
  exerciseIds: string[]
}

/**
 * The built-in splits. Each one is a starting point: the exercise list is copied into a
 * draft session at start time and can be edited freely before or during the workout.
 */
export const TEMPLATES: SplitTemplate[] = [
  {
    key: 'push',
    name: 'Push',
    blurb: 'Chest, shoulders and triceps',
    focus: ['chest', 'shoulders', 'triceps'],
    exerciseIds: [
      'Barbell_Bench_Press_-_Medium_Grip',
      'Incline_Dumbbell_Press',
      'Dumbbell_Shoulder_Press',
      'Side_Lateral_Raise',
      'Triceps_Pushdown',
      'Dips_-_Triceps_Version',
    ],
  },
  {
    key: 'pull',
    name: 'Pull',
    blurb: 'Back and biceps',
    focus: ['back', 'biceps'],
    exerciseIds: [
      'Pullups',
      'Bent_Over_Barbell_Row',
      'Wide-Grip_Lat_Pulldown',
      'Seated_Cable_Rows',
      'Face_Pull',
      'Barbell_Curl',
      'Hammer_Curls',
    ],
  },
  {
    key: 'legs',
    name: 'Legs',
    blurb: 'Quads, hamstrings, glutes and calves',
    focus: ['quads', 'hamstrings', 'glutes', 'calves'],
    exerciseIds: [
      'Barbell_Squat',
      'Romanian_Deadlift',
      'Leg_Press',
      'Lying_Leg_Curls',
      'Leg_Extensions',
      'Standing_Calf_Raises',
    ],
  },
  {
    key: 'upper',
    name: 'Upper Body',
    blurb: 'Chest, back, shoulders and arms',
    focus: ['chest', 'back', 'shoulders', 'biceps', 'triceps'],
    exerciseIds: [
      'Barbell_Bench_Press_-_Medium_Grip',
      'Bent_Over_Barbell_Row',
      'Standing_Military_Press',
      'Wide-Grip_Lat_Pulldown',
      'Barbell_Curl',
      'Triceps_Pushdown',
    ],
  },
  {
    key: 'lower',
    name: 'Lower Body',
    blurb: 'Everything below the belt',
    focus: ['quads', 'hamstrings', 'glutes', 'calves'],
    exerciseIds: [
      'Barbell_Deadlift',
      'Front_Barbell_Squat',
      'Split_Squat_with_Dumbbells',
      'Lying_Leg_Curls',
      'Barbell_Hip_Thrust',
      'Standing_Calf_Raises',
    ],
  },
  {
    key: 'fullbody',
    name: 'Full Body',
    blurb: 'One compound lift per major group',
    focus: ['chest', 'back', 'quads', 'shoulders', 'core'],
    exerciseIds: [
      'Barbell_Squat',
      'Barbell_Bench_Press_-_Medium_Grip',
      'Bent_Over_Barbell_Row',
      'Standing_Military_Press',
      'Romanian_Deadlift',
      'Plank',
    ],
  },
  {
    key: 'core',
    name: 'Core',
    blurb: 'Abs and obliques',
    focus: ['core'],
    exerciseIds: [
      'Plank',
      'Hanging_Leg_Raise',
      'Crunches',
      'Russian_Twist',
      'Cable_Crunch',
      'Side_Bridge',
    ],
  },
  {
    key: 'arms',
    name: 'Arms',
    blurb: 'Biceps, triceps and forearms',
    focus: ['biceps', 'triceps', 'forearms'],
    exerciseIds: [
      'Barbell_Curl',
      'Hammer_Curls',
      'Preacher_Curl',
      'Triceps_Pushdown',
      'Standing_Dumbbell_Triceps_Extension',
      'Palms-Down_Wrist_Curl_Over_A_Bench',
    ],
  },
  {
    key: 'cardio',
    name: 'Cardio',
    blurb: 'Conditioning and machines',
    focus: [],
    exerciseIds: ['Running_Treadmill', 'Rowing_Stationary', 'Bicycling_Stationary', 'Elliptical_Trainer'],
  },
]

export const TEMPLATE_BY_KEY: Record<string, SplitTemplate> = Object.fromEntries(
  TEMPLATES.map((t) => [t.key, t]),
)
