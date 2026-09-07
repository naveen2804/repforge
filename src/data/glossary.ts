/**
 * Plain-English definitions for the jargon the UI can't avoid. Anything referenced by an
 * <InfoTip term="…" /> lives here, and the Glossary screen renders the whole list.
 */
export interface GlossaryEntry {
  term: string
  /** Fits in brackets after a label, e.g. "RPE (how hard the set felt, 1–10)". */
  short: string
  long: string
  example?: string
}

export const GLOSSARY = {
  rpe: {
    term: 'RPE',
    short: 'how hard the set felt, 1–10',
    long: 'Rate of Perceived Exertion — your own read on how hard a set was, on a scale of 1 to 10. A 10 means you could not have done another rep; an 8 means you had about two left in the tank. It is optional, but logging it makes it obvious later whether a weight was actually heavy or you just had a bad day.',
    example: '10 reps that left you with 2 more in reserve ≈ RPE 8.',
  },
  volume: {
    term: 'Volume',
    short: 'sets × reps × weight',
    long: 'Total weight moved: every completed set multiplied out and added up. It is the simplest single number for "how much work did I do", and it is what the weekly chart tracks. Bodyweight sets do not add to it, since there is no weight to count.',
    example: '3 sets of 10 reps at 60 kg = 1,800 kg of volume.',
  },
  oneRepMax: {
    term: 'Estimated 1RM',
    short: 'the heaviest single rep you could probably manage',
    long: 'One-rep max — the most weight you could lift once. RepForge estimates it from your sets rather than asking you to actually attempt a max, using the Epley formula. It is useful as a progress line because it lets a heavy set of 3 and a lighter set of 10 be compared on the same scale.',
    example: '80 kg × 5 reps ≈ 93 kg estimated 1RM.',
  },
  set: {
    term: 'Set',
    short: 'one group of reps done back to back',
    long: 'A set is a run of repetitions performed without stopping. You then rest and do another. "3 × 10" means three sets of ten reps.',
  },
  rep: {
    term: 'Rep',
    short: 'one complete movement',
    long: 'Short for repetition — one full cycle of the exercise, such as lowering the bar to your chest and pressing it back up.',
  },
  compound: {
    term: 'Compound',
    short: 'moves several joints and muscle groups at once',
    long: 'A compound exercise works multiple joints and muscle groups together — squats, bench press, rows, pull-ups. They give the most return per minute, which is why most sessions start with them while you are fresh.',
  },
  isolation: {
    term: 'Isolation',
    short: 'targets one muscle at a single joint',
    long: 'An isolation exercise works one muscle across one joint — bicep curls, lateral raises, leg extensions. They are useful for adding volume to a specific muscle, usually after the compound work is done.',
  },
  streak: {
    term: 'Day streak',
    short: 'consecutive days you have trained',
    long: 'How many days in a row you have logged a workout. Yesterday still counts as keeping it alive, so the number does not appear to collapse just because you have not trained yet today.',
  },
  bodyweight: {
    term: 'Bodyweight (BW)',
    short: 'no added weight — just you',
    long: 'Leave the weight field empty for exercises where you are not adding load, such as push-ups or planks. The set still counts; it just does not add to your volume total, since there is no weight to multiply.',
  },
  pr: {
    term: 'Personal record (PR)',
    short: 'your best ever for that exercise',
    long: 'Your heaviest single set for an exercise, and the estimated 1RM that goes with it. RepForge works these out from your logged sets, so they update themselves as you train.',
  },
  split: {
    term: 'Split',
    short: 'which muscles you train on which day',
    long: 'A way of dividing the body across your training days so each muscle gets worked and then recovers. Push/Pull/Legs is the classic three-day version; Upper/Lower is a two-day one. Full Body hits everything each session and suits people training two or three times a week.',
  },
  restTimer: {
    term: 'Rest',
    short: 'the pause between sets',
    long: 'How long you wait before the next set. Roughly: 2–3 minutes after heavy compound lifts, 60–90 seconds for isolation work. Resting too little is the most common reason a session feels harder than it should.',
  },
  progressiveOverload: {
    term: 'Progressive overload',
    short: 'gradually asking your body for a bit more',
    long: 'The core idea behind getting stronger: over time, add a little weight, a rep, or a set. It does not have to be every session — the weekly volume chart and per-exercise progress lines exist to show you whether the trend is going the right way over months.',
  },
  warmup: {
    term: 'Warm-up set',
    short: 'light sets before your working sets',
    long: 'One or two easy sets at a lighter weight to prepare the joints and groove the movement. Log them or not, as you prefer — many people leave them unticked so they do not inflate the volume number.',
  },
  tempo: {
    term: 'Tempo',
    short: 'how fast you move through the rep',
    long: 'Controlling speed, particularly on the lowering phase. Slowing the lowering to two or three seconds makes a lighter weight considerably harder, which is handy when equipment is limited.',
  },
} satisfies Record<string, GlossaryEntry>

export type GlossaryKey = keyof typeof GLOSSARY

export const GLOSSARY_LIST: (GlossaryEntry & { key: GlossaryKey })[] = (
  Object.entries(GLOSSARY) as [GlossaryKey, GlossaryEntry][]
).map(([key, entry]) => ({ key, ...entry }))
