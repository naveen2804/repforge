import type { BodyPart } from '../lib/types'

/**
 * Ready-made routines, chosen by where you are rather than by muscle group: new to the
 * gym, coming back after a break, twenty minutes to spare, a hotel room with no kit, a
 * dodgy knee, or a day where you feel rough and just want to move.
 *
 * Each session carries prescriptions (sets, reps, seconds) that pre-fill the logger, so
 * a beginner is not left staring at an empty set table wondering what to type.
 */

export type ProgramLevel = 'new' | 'beginner' | 'intermediate' | 'advanced' | 'any'

export interface ProgramCategory {
  key: string
  label: string
  blurb: string
}

export const PROGRAM_CATEGORIES: ProgramCategory[] = [
  { key: 'start', label: 'Starting out', blurb: 'Never trained, or coming back after a long break' },
  { key: 'build', label: 'Building', blurb: 'You have the basics and want a structured plan' },
  { key: 'limited', label: 'Limited time or kit', blurb: 'Short sessions, home workouts, travel' },
  { key: 'gentle', label: 'Gentle days', blurb: 'Under the weather, sore, stiff or low on sleep' },
]

export interface ProgramExercise {
  exerciseId: string
  sets: number
  /** Reps per set, or seconds for holds and cardio. Exactly one of these is set. */
  reps?: number
  durationSeconds?: number
  note?: string
}

export interface ProgramSession {
  name: string
  focus: BodyPart[]
  exercises: ProgramExercise[]
}

export interface Program {
  key: string
  name: string
  category: string
  level: ProgramLevel
  /** One line on the card. */
  blurb: string
  /** Who this is for, in full. */
  who: string
  /** How to run it week to week. */
  howToRun: string
  minutes: number
  perWeek: string
  tags: string[]
  /** Shown as a highlighted note — safety caveats, form warnings. */
  caution?: string
  sessions: ProgramSession[]
}

export const PROGRAMS: Program[] = [
  // ---------------------------------------------------------------- Starting out
  {
    key: 'first-week',
    name: 'Your First Week',
    category: 'start',
    level: 'new',
    blurb: 'Machines and bodyweight only — learn the room without hurting yourself',
    who: 'You have never trained with weights, or the gym still feels intimidating. Every movement here is on a machine or uses just your bodyweight, so there is no barbell to balance and very little that can go wrong.',
    howToRun:
      'Run this three times in your first week, with a rest day between each. Pick a weight you could lift about fifteen times and stop at ten — the first week is for learning the movements, not testing yourself. Expect to be sore for a couple of days afterwards; that fades after the first fortnight.',
    minutes: 35,
    perWeek: '3 × week',
    tags: ['Machines', 'No barbell', 'Full body'],
    caution:
      'If a movement hurts sharply rather than just feeling hard, stop and skip it. Ask a member of staff to check your seat height on the machines the first time — it makes far more difference than the weight does.',
    sessions: [
      {
        name: 'Full body — machines',
        focus: ['chest', 'back', 'quads', 'core'],
        exercises: [
          { exerciseId: 'Walking_Treadmill', sets: 1, durationSeconds: 300, note: 'Easy pace, just to warm up' },
          { exerciseId: 'Leg_Press', sets: 3, reps: 10 },
          { exerciseId: 'Machine_Bench_Press', sets: 3, reps: 10 },
          { exerciseId: 'Wide-Grip_Lat_Pulldown', sets: 3, reps: 10 },
          { exerciseId: 'Seated_Cable_Rows', sets: 3, reps: 10 },
          { exerciseId: 'Seated_Leg_Curl', sets: 2, reps: 12 },
          { exerciseId: 'Plank', sets: 2, durationSeconds: 20 },
        ],
      },
    ],
  },
  {
    key: 'beginner-full-body',
    name: 'Beginner Full Body A / B',
    category: 'start',
    level: 'beginner',
    blurb: 'Two alternating sessions covering everything, three days a week',
    who: 'You have a few weeks behind you and want a proper plan. Two sessions you alternate — A, B, A one week, then B, A, B the next — so everything gets trained twice most weeks.',
    howToRun:
      'Three days a week with a rest day between. Add 2.5 kg to a lift whenever you complete all your sets at the top of the rep range; if you miss reps two sessions running, drop back 10% and build up again.',
    minutes: 45,
    perWeek: '3 × week',
    tags: ['Full body', 'Dumbbells', 'Progressive'],
    sessions: [
      {
        name: 'Session A',
        focus: ['quads', 'chest', 'back'],
        exercises: [
          { exerciseId: 'Goblet_Squat', sets: 3, reps: 10 },
          { exerciseId: 'Dumbbell_Bench_Press', sets: 3, reps: 10 },
          { exerciseId: 'One-Arm_Dumbbell_Row', sets: 3, reps: 10, note: 'Per side' },
          { exerciseId: 'Dumbbell_Shoulder_Press', sets: 2, reps: 12 },
          { exerciseId: 'Plank', sets: 3, durationSeconds: 30 },
        ],
      },
      {
        name: 'Session B',
        focus: ['hamstrings', 'glutes', 'back', 'biceps'],
        exercises: [
          { exerciseId: 'Stiff-Legged_Dumbbell_Deadlift', sets: 3, reps: 10 },
          { exerciseId: 'Wide-Grip_Lat_Pulldown', sets: 3, reps: 10 },
          { exerciseId: 'Dumbbell_Step_Ups', sets: 3, reps: 10, note: 'Per leg' },
          { exerciseId: 'Incline_Push-Up', sets: 3, reps: 12 },
          { exerciseId: 'Dumbbell_Bicep_Curl', sets: 2, reps: 12 },
          { exerciseId: 'Side_Bridge', sets: 2, durationSeconds: 25 },
        ],
      },
    ],
  },
  {
    key: 'coming-back',
    name: 'Coming Back After a Break',
    category: 'start',
    level: 'any',
    blurb: 'Rebuild the habit at half volume before chasing old numbers',
    who: 'You used to train and have been away for months. You know the movements — the problem is that your connective tissue and your enthusiasm are on different timelines.',
    howToRun:
      'Two weeks of this, at roughly half the weight you finished on. It will feel insultingly easy. That is the point: the soreness from going straight back to old numbers is what ends most comebacks in week two. After a fortnight, move to Beginner Full Body or a split.',
    minutes: 40,
    perWeek: '2–3 × week',
    tags: ['Deload', 'Full body', 'Low volume'],
    caution: 'Stop each set two or three reps short of failure for the whole fortnight.',
    sessions: [
      {
        name: 'Rebuild',
        focus: ['quads', 'chest', 'back', 'core'],
        exercises: [
          { exerciseId: 'Bodyweight_Squat', sets: 2, reps: 15, note: 'Warm-up' },
          { exerciseId: 'Goblet_Squat', sets: 3, reps: 10 },
          { exerciseId: 'Dumbbell_Bench_Press', sets: 3, reps: 10 },
          { exerciseId: 'Seated_Cable_Rows', sets: 3, reps: 12 },
          { exerciseId: 'Romanian_Deadlift', sets: 2, reps: 10, note: 'Light — technique only' },
          { exerciseId: 'Plank', sets: 3, durationSeconds: 30 },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------- Building
  {
    key: 'strength-5x5',
    name: 'Strength — 5 × 5',
    category: 'build',
    level: 'intermediate',
    blurb: 'Heavy compound lifts, low reps, two alternating sessions',
    who: 'You are comfortable under a barbell and want to get measurably stronger rather than chase a pump. Five sets of five on the big lifts is the oldest reliable answer to that.',
    howToRun:
      'Three days a week, alternating A and B. Add 2.5 kg to upper-body lifts and 5 kg to squats and deadlifts each time you complete all five sets. Rest a full three minutes between heavy sets — this is the one plan where cutting rest short genuinely costs you.',
    minutes: 55,
    perWeek: '3 × week',
    tags: ['Barbell', 'Strength', 'Low reps'],
    caution:
      'Deadlifts and squats punish a rounded back more than any other lift here. If your form breaks down on rep four, that was your last rep.',
    sessions: [
      {
        name: 'Session A',
        focus: ['quads', 'chest', 'back'],
        exercises: [
          { exerciseId: 'Barbell_Squat', sets: 5, reps: 5 },
          { exerciseId: 'Barbell_Bench_Press_-_Medium_Grip', sets: 5, reps: 5 },
          { exerciseId: 'Bent_Over_Barbell_Row', sets: 5, reps: 5 },
          { exerciseId: 'Plank', sets: 3, durationSeconds: 45 },
        ],
      },
      {
        name: 'Session B',
        focus: ['quads', 'shoulders', 'back', 'hamstrings'],
        exercises: [
          { exerciseId: 'Barbell_Squat', sets: 5, reps: 5 },
          { exerciseId: 'Standing_Military_Press', sets: 5, reps: 5 },
          { exerciseId: 'Barbell_Deadlift', sets: 1, reps: 5, note: 'One heavy set is plenty' },
          { exerciseId: 'Chin-Up', sets: 3, reps: 8 },
        ],
      },
    ],
  },
  {
    key: 'hypertrophy-upper-lower',
    name: 'Upper / Lower for Size',
    category: 'build',
    level: 'intermediate',
    blurb: 'Four days a week, moderate reps, built around growing muscle',
    who: 'You want to look like you train. Four sessions a week in the 8–12 rep range, split into two upper and two lower days, is the most reliable structure for that.',
    howToRun:
      'Upper, lower, rest, upper, lower. Take most sets to within a rep or two of failure and add weight or reps whenever you hit the top of the range on every set.',
    minutes: 55,
    perWeek: '4 × week',
    tags: ['Hypertrophy', 'Upper/Lower', '8–12 reps'],
    sessions: [
      {
        name: 'Upper',
        focus: ['chest', 'back', 'shoulders', 'biceps', 'triceps'],
        exercises: [
          { exerciseId: 'Barbell_Bench_Press_-_Medium_Grip', sets: 4, reps: 8 },
          { exerciseId: 'Bent_Over_Barbell_Row', sets: 4, reps: 10 },
          { exerciseId: 'Incline_Dumbbell_Press', sets: 3, reps: 10 },
          { exerciseId: 'Wide-Grip_Lat_Pulldown', sets: 3, reps: 12 },
          { exerciseId: 'Side_Lateral_Raise', sets: 3, reps: 15 },
          { exerciseId: 'Barbell_Curl', sets: 3, reps: 12 },
          { exerciseId: 'Triceps_Pushdown', sets: 3, reps: 12 },
        ],
      },
      {
        name: 'Lower',
        focus: ['quads', 'hamstrings', 'glutes', 'calves'],
        exercises: [
          { exerciseId: 'Barbell_Squat', sets: 4, reps: 8 },
          { exerciseId: 'Romanian_Deadlift', sets: 3, reps: 10 },
          { exerciseId: 'Leg_Press', sets: 3, reps: 12 },
          { exerciseId: 'Lying_Leg_Curls', sets: 3, reps: 12 },
          { exerciseId: 'Barbell_Hip_Thrust', sets: 3, reps: 12 },
          { exerciseId: 'Standing_Calf_Raises', sets: 4, reps: 15 },
        ],
      },
    ],
  },
  {
    key: 'advanced-ppl',
    name: 'Advanced Push / Pull / Legs',
    category: 'build',
    level: 'advanced',
    blurb: 'Six days a week, high volume, for people who recover well',
    who: 'You have trained consistently for a year or more, your technique is solid, and you can commit to six sessions a week. This is a lot of volume — it only works if your sleep and eating are in order.',
    howToRun:
      'Push, pull, legs, repeat, one rest day. Run the first rotation of each week heavy in the 5–8 range and the second lighter in the 10–15 range. Deload every sixth week by halving the sets.',
    minutes: 70,
    perWeek: '6 × week',
    tags: ['High volume', 'PPL', 'Advanced'],
    caution: 'Six sessions a week is where niggles turn into injuries. Drop to five if sleep slips.',
    sessions: [
      {
        name: 'Push',
        focus: ['chest', 'shoulders', 'triceps'],
        exercises: [
          { exerciseId: 'Barbell_Bench_Press_-_Medium_Grip', sets: 4, reps: 6 },
          { exerciseId: 'Standing_Military_Press', sets: 4, reps: 8 },
          { exerciseId: 'Incline_Dumbbell_Press', sets: 3, reps: 10 },
          { exerciseId: 'Butterfly', sets: 3, reps: 15 },
          { exerciseId: 'Side_Lateral_Raise', sets: 4, reps: 15 },
          { exerciseId: 'Dips_-_Triceps_Version', sets: 3, reps: 10 },
          { exerciseId: 'Triceps_Pushdown', sets: 3, reps: 15 },
        ],
      },
      {
        name: 'Pull',
        focus: ['back', 'biceps', 'forearms'],
        exercises: [
          { exerciseId: 'Barbell_Deadlift', sets: 3, reps: 5 },
          { exerciseId: 'Pullups', sets: 4, reps: 8 },
          { exerciseId: 'Bent_Over_Barbell_Row', sets: 4, reps: 8 },
          { exerciseId: 'Seated_Cable_Rows', sets: 3, reps: 12 },
          { exerciseId: 'Face_Pull', sets: 3, reps: 15 },
          { exerciseId: 'Barbell_Curl', sets: 3, reps: 10 },
          { exerciseId: 'Hammer_Curls', sets: 3, reps: 12 },
        ],
      },
      {
        name: 'Legs',
        focus: ['quads', 'hamstrings', 'glutes', 'calves'],
        exercises: [
          { exerciseId: 'Barbell_Squat', sets: 4, reps: 6 },
          { exerciseId: 'Romanian_Deadlift', sets: 4, reps: 8 },
          { exerciseId: 'Leg_Press', sets: 3, reps: 12 },
          { exerciseId: 'Split_Squat_with_Dumbbells', sets: 3, reps: 10, note: 'Per leg' },
          { exerciseId: 'Lying_Leg_Curls', sets: 3, reps: 15 },
          { exerciseId: 'Standing_Calf_Raises', sets: 5, reps: 12 },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------- Limited time / kit
  {
    key: 'express-20',
    name: '20-Minute Express',
    category: 'limited',
    level: 'any',
    blurb: 'Four compound lifts, in and out',
    who: 'You have twenty minutes and turning up matters more than optimising. Four movements that between them cover almost everything.',
    howToRun:
      'Move between exercises with minimal fuss, resting about 60 seconds. Two or three of these a week keeps you ticking over during a busy stretch — it is far better than the session you skip because you did not have an hour.',
    minutes: 20,
    perWeek: '2–3 × week',
    tags: ['Short', 'Full body', 'Compound only'],
    sessions: [
      {
        name: 'Express full body',
        focus: ['quads', 'chest', 'back', 'core'],
        exercises: [
          { exerciseId: 'Goblet_Squat', sets: 3, reps: 12 },
          { exerciseId: 'Dumbbell_Bench_Press', sets: 3, reps: 12 },
          { exerciseId: 'One-Arm_Dumbbell_Row', sets: 3, reps: 12, note: 'Per side' },
          { exerciseId: 'Plank', sets: 3, durationSeconds: 40 },
        ],
      },
    ],
  },
  {
    key: 'no-equipment',
    name: 'No Equipment — Hotel Room',
    category: 'limited',
    level: 'any',
    blurb: 'Nothing but the floor and a chair',
    who: 'Travelling, or the gym is shut. Everything here needs a patch of floor and, at most, something to put your hands on.',
    howToRun:
      'Three rounds of the whole list, resting a minute between rounds. When it gets easy, slow the lowering phase to three seconds rather than adding reps — that is how you make bodyweight work harder without equipment.',
    minutes: 25,
    perWeek: 'As needed',
    tags: ['Bodyweight', 'Travel', 'No kit'],
    sessions: [
      {
        name: 'Bodyweight circuit',
        focus: ['chest', 'quads', 'glutes', 'core'],
        exercises: [
          { exerciseId: 'Bodyweight_Squat', sets: 3, reps: 20 },
          { exerciseId: 'Pushups', sets: 3, reps: 12, note: 'Hands on a chair if the floor is too hard' },
          { exerciseId: 'Bodyweight_Walking_Lunge', sets: 3, reps: 12, note: 'Per leg' },
          { exerciseId: 'Butt_Lift_Bridge', sets: 3, reps: 15 },
          { exerciseId: 'Mountain_Climbers', sets: 3, durationSeconds: 30 },
          { exerciseId: 'Plank', sets: 3, durationSeconds: 40 },
        ],
      },
    ],
  },
  {
    key: 'dumbbells-only',
    name: 'Dumbbells Only',
    category: 'limited',
    level: 'beginner',
    blurb: 'A complete session from one pair of dumbbells',
    who: 'A home setup with a pair of adjustable dumbbells and no rack. This covers every major muscle group without a barbell or machine in sight.',
    howToRun: 'Twice a week is enough to maintain, three times to build. Rest 90 seconds between sets.',
    minutes: 40,
    perWeek: '2–3 × week',
    tags: ['Home gym', 'Dumbbells', 'Full body'],
    sessions: [
      {
        name: 'Dumbbell full body',
        focus: ['quads', 'chest', 'back', 'shoulders'],
        exercises: [
          { exerciseId: 'Goblet_Squat', sets: 3, reps: 12 },
          { exerciseId: 'Dumbbell_Bench_Press', sets: 3, reps: 10 },
          { exerciseId: 'Bent_Over_Two-Dumbbell_Row', sets: 3, reps: 10 },
          { exerciseId: 'Stiff-Legged_Dumbbell_Deadlift', sets: 3, reps: 12 },
          { exerciseId: 'Dumbbell_Shoulder_Press', sets: 3, reps: 10 },
          { exerciseId: 'Dumbbell_Bicep_Curl', sets: 2, reps: 12 },
          { exerciseId: 'Standing_Dumbbell_Triceps_Extension', sets: 2, reps: 12 },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------- Gentle days
  {
    key: 'under-the-weather',
    name: 'Under the Weather',
    category: 'gentle',
    level: 'any',
    blurb: 'Very light movement for days you feel rough',
    who: 'A head cold, the tail end of a bug, or one of those days where everything aches. This is deliberately not a workout — it is gentle movement to stop you seizing up, at an intensity you could hold a conversation through.',
    howToRun:
      'Go at maybe a third of your normal effort and stop the moment you feel worse rather than better. Skip it entirely and rest if you have a fever, a chest infection, or symptoms below the neck.',
    minutes: 20,
    perWeek: 'As needed',
    tags: ['Recovery', 'Very light', 'Mobility'],
    caution:
      'This is general fitness guidance, not medical advice. If you have a fever, chest symptoms, or anything that has you genuinely worried, rest and speak to a doctor rather than training.',
    sessions: [
      {
        name: 'Gentle movement',
        focus: [],
        exercises: [
          { exerciseId: 'Walking_Treadmill', sets: 1, durationSeconds: 600, note: 'Slow, flat, conversational' },
          { exerciseId: 'Cat_Stretch', sets: 2, durationSeconds: 45 },
          { exerciseId: 'Childs_Pose', sets: 2, durationSeconds: 45 },
          { exerciseId: 'Spinal_Stretch', sets: 2, durationSeconds: 30 },
          { exerciseId: 'Shoulder_Stretch', sets: 2, durationSeconds: 30 },
        ],
      },
    ],
  },
  {
    key: 'low-energy',
    name: 'Low Energy Day',
    category: 'gentle',
    level: 'any',
    blurb: 'Bad sleep, long day — half a session beats none',
    who: 'You slept badly or work flattened you, and the honest choice is between something small and nothing at all. This keeps the habit and the movement patterns without digging a recovery hole.',
    howToRun:
      'Two sets of everything at a weight you could do for fifteen. Stop well short of failure. Consistency across a bad week is worth more than one heroic session.',
    minutes: 25,
    perWeek: 'As needed',
    tags: ['Low volume', 'Full body', 'Easy'],
    sessions: [
      {
        name: 'Half session',
        focus: ['quads', 'chest', 'back'],
        exercises: [
          { exerciseId: 'Goblet_Squat', sets: 2, reps: 12 },
          { exerciseId: 'Machine_Bench_Press', sets: 2, reps: 12 },
          { exerciseId: 'Seated_Cable_Rows', sets: 2, reps: 12 },
          { exerciseId: 'Plank', sets: 2, durationSeconds: 30 },
        ],
      },
    ],
  },
  {
    key: 'desk-reset',
    name: 'Desk Posture Reset',
    category: 'gentle',
    level: 'any',
    blurb: 'Undo eight hours of sitting',
    who: 'Anyone whose hips, upper back and neck have quietly moulded to an office chair. Ten minutes of this after work, or on rest days.',
    howToRun: 'Hold each stretch for the full time and breathe out into it. Daily is fine — this is not hard enough to need recovery.',
    minutes: 12,
    perWeek: 'Daily',
    tags: ['Mobility', 'Posture', 'Stretching'],
    sessions: [
      {
        name: 'Posture reset',
        focus: [],
        exercises: [
          { exerciseId: 'Cat_Stretch', sets: 2, durationSeconds: 45 },
          { exerciseId: 'Kneeling_Hip_Flexor', sets: 2, durationSeconds: 40, note: 'Per side' },
          { exerciseId: 'Chest_And_Front_Of_Shoulder_Stretch', sets: 2, durationSeconds: 40 },
          { exerciseId: 'Side_Neck_Stretch', sets: 2, durationSeconds: 30, note: 'Per side' },
          { exerciseId: 'Torso_Rotation', sets: 2, durationSeconds: 30 },
          { exerciseId: 'Face_Pull', sets: 3, reps: 15, note: 'Light — for the upper back' },
        ],
      },
    ],
  },
  {
    key: 'back-friendly',
    name: 'Back-Friendly Session',
    category: 'gentle',
    level: 'any',
    blurb: 'Trains hard while keeping load off the spine',
    who: 'A grumbly lower back that is fine day to day but complains about squats and deadlifts. Nothing here loads the spine from above, so you can still train properly while it settles.',
    howToRun:
      'Substitute this for your normal lower-body day while the back is unhappy. Machines and supported positions let you push the muscles without asking the spine to hold everything together.',
    minutes: 40,
    perWeek: '2 × week',
    tags: ['Joint-friendly', 'No spinal load', 'Machines'],
    caution:
      'General guidance, not medical advice — if your back pain is new, severe, or radiates down a leg, get it looked at before training around it.',
    sessions: [
      {
        name: 'Spine-sparing',
        focus: ['quads', 'glutes', 'chest', 'back'],
        exercises: [
          { exerciseId: 'Leg_Press', sets: 3, reps: 12, note: 'Do not let the hips curl off the pad' },
          { exerciseId: 'Leg_Extensions', sets: 3, reps: 15 },
          { exerciseId: 'Lying_Leg_Curls', sets: 3, reps: 12 },
          { exerciseId: 'Butt_Lift_Bridge', sets: 3, reps: 15 },
          { exerciseId: 'Machine_Bench_Press', sets: 3, reps: 12 },
          { exerciseId: 'Wide-Grip_Lat_Pulldown', sets: 3, reps: 12 },
          { exerciseId: 'Side_Bridge', sets: 3, durationSeconds: 25, note: 'Per side' },
        ],
      },
    ],
  },
  {
    key: 'knee-friendly',
    name: 'Knee-Friendly Lower Body',
    category: 'gentle',
    level: 'any',
    blurb: 'Legs without deep bending or impact',
    who: 'Knees that object to squatting deep or anything with jumping. This trains the same muscles through ranges that most cranky knees tolerate.',
    howToRun: 'Keep every rep in a pain-free range, even if that means a short one. Slow and controlled beats heavy here.',
    minutes: 35,
    perWeek: '2 × week',
    tags: ['Joint-friendly', 'Low impact', 'Legs'],
    caution: 'General guidance, not medical advice. Sharp or swelling-inducing pain is a reason to see a physio, not to push through.',
    sessions: [
      {
        name: 'Kind to knees',
        focus: ['hamstrings', 'glutes', 'calves'],
        exercises: [
          { exerciseId: 'Recumbent_Bike', sets: 1, durationSeconds: 480, note: 'Light resistance warm-up' },
          { exerciseId: 'Romanian_Deadlift', sets: 3, reps: 12, note: 'Hip hinge — knees stay soft' },
          { exerciseId: 'Lying_Leg_Curls', sets: 3, reps: 15 },
          { exerciseId: 'Butt_Lift_Bridge', sets: 3, reps: 15 },
          { exerciseId: 'Barbell_Hip_Thrust', sets: 3, reps: 12 },
          { exerciseId: 'Standing_Calf_Raises', sets: 4, reps: 15 },
        ],
      },
    ],
  },
]

export const PROGRAM_BY_KEY: Record<string, Program> = Object.fromEntries(
  PROGRAMS.map((p) => [p.key, p]),
)

export const LEVEL_LABEL: Record<ProgramLevel, string> = {
  new: 'Never trained',
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  any: 'Any level',
}
