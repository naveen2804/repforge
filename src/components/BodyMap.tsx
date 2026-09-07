import type { BodyPart } from '../lib/types'

/**
 * A small figure with the worked muscles highlighted, used wherever a body part or a
 * split needs an icon. Emoji have no honest glyph for "back" or "hamstrings", so the
 * highlight position does the work instead — and the same component doubles as a split
 * preview when several parts are passed in.
 *
 * Shapes are plain polygons stroked in their own fill colour with round joins, which
 * softens every corner without hand-writing bezier curves. Limbs are deliberately kept
 * a few units clear of the torso so the stroke does not weld them into one blob.
 */

const STROKE = { strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const, strokeWidth: 2 }

/** Mirrors an x coordinate across the figure's centre line. */
const mirror = (points: string) =>
  points
    .split(' ')
    .map((pair) => {
      const [x, y] = pair.split(',').map(Number)
      return `${44 - x},${y}`
    })
    .join(' ')

// --- Silhouette ------------------------------------------------------------
const TORSO = '14.2,18.6 29.8,18.6 28.2,40.8 15.8,40.8'
const UPPER_ARM = '6.6,21 10.8,20.5 10.2,34.6 5.4,34.8'
const FOREARM = '5,36.2 9.4,36 8.6,49.6 4.2,49.4'
const HIPS = '15.4,41.6 28.6,41.6 28.2,47.2 15.8,47.2'
const THIGH = '15.6,48.4 20.4,48.4 20.1,61 16.1,61'
const SHIN = '16.2,62.2 20.1,62.2 19.9,72.6 16.6,72.6'

// --- Highlight regions -----------------------------------------------------
const SHOULDER_CAP = '14.2,18.6 19.4,18.6 19.4,24.8 14.5,24.8'
const ARM_TOP = '6.6,21 10.8,20.5 10.5,26.2 6.4,26.4'

const REGIONS: Record<BodyPart, string[]> = {
  shoulders: [SHOULDER_CAP, mirror(SHOULDER_CAP), ARM_TOP, mirror(ARM_TOP)],
  chest: ['14.5,19.4 29.5,19.4 29.1,28.6 14.9,28.6'],
  back: ['14.4,19.2 29.6,19.2 28.8,35.2 15.2,35.2'],
  core: ['16.8,29.6 27.2,29.6 27,40.4 17,40.4'],
  biceps: [UPPER_ARM, mirror(UPPER_ARM)],
  triceps: [UPPER_ARM, mirror(UPPER_ARM)],
  forearms: [FOREARM, mirror(FOREARM)],
  glutes: [HIPS],
  quads: [THIGH, mirror(THIGH)],
  hamstrings: [THIGH, mirror(THIGH)],
  calves: [SHIN, mirror(SHIN)],
}

/**
 * Parts on the rear of the body. When one is highlighted the figure gets a spine line,
 * which reads as "you are looking at their back" — otherwise chest and back, or quads and
 * hamstrings, would be the same picture with a different caption.
 */
const REAR_VIEW = new Set<BodyPart>(['back', 'triceps', 'hamstrings', 'glutes'])

export function BodyMap({
  parts,
  size = 40,
  className,
}: {
  parts: BodyPart[]
  size?: number
  className?: string
}) {
  const height = (size * 76) / 44

  // Cardio, mobility and other whole-body work has nothing to highlight.
  if (parts.length === 0) {
    return (
      <svg width={size} height={height} viewBox="0 0 44 76" className={className} role="img" aria-label="Whole body">
        <path
          d="M5 38h7.5l3.5-9.5L22 47l4-9h13"
          fill="none"
          stroke="var(--brand)"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  const base = 'var(--surface-3)'
  const hot = 'var(--brand)'
  const active = new Set(parts)

  const shape = (points: string, key: string, on: boolean) => (
    <polygon key={key} points={points} fill={on ? hot : base} stroke={on ? hot : base} {...STROKE} />
  )

  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 44 76"
      className={className}
      role="img"
      aria-label={`Muscles worked: ${parts.join(', ')}`}
    >
      <circle cx="22" cy="8" r="5.4" fill={base} />
      <rect x="19.4" y="12.4" width="5.2" height="4" rx="1.6" fill={base} />
      {[TORSO, UPPER_ARM, mirror(UPPER_ARM), FOREARM, mirror(FOREARM), HIPS, THIGH, mirror(THIGH), SHIN, mirror(SHIN)].map(
        (points, i) => shape(points, `base-${i}`, false),
      )}

      {[...active].flatMap((part) =>
        (REGIONS[part] ?? []).map((points, i) => shape(points, `${part}-${i}`, true)),
      )}

      {[...active].some((p) => REAR_VIEW.has(p)) && (
        <line x1="22" y1="21" x2="22" y2="39.5" stroke="var(--surface)" strokeWidth="1.5" strokeLinecap="round" />
      )}
    </svg>
  )
}
