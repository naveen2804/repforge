import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CloseIcon } from './Icons'

const SEEN_KEY = 'repforge-tour-done'

export function hasSeenTour(): boolean {
  try {
    return localStorage.getItem(SEEN_KEY) === '1'
  } catch {
    return true
  }
}

interface Step {
  title: string
  body: string
  /** The tour navigates as it explains, so you are looking at the real screen behind it. */
  route: string
}

const STEPS: Step[] = [
  {
    title: 'Welcome to RepForge',
    body: 'A gym notebook that does the arithmetic. Plan a session, tick off sets as you do them, and watch the numbers move over the months. This tour takes about a minute — you can skip it and come back to it from Settings.',
    route: '/',
  },
  {
    title: 'Home is where you start',
    body: 'Your stats sit at the top, then ready-made plans for whatever kind of day you are having, the classic splits, and a grid of body parts. Tap any of them to begin. If you just want to lift and figure it out as you go, "Start an empty workout" does exactly that.',
    route: '/',
  },
  {
    title: 'Plans for real situations',
    body: 'Never trained before? Coming back after months off? Twenty minutes and a hotel room? Feeling rough? Each plan explains who it is for and how to run it, and pre-fills the sets and reps so you are not left guessing.',
    route: '/programs',
  },
  {
    title: '876 exercises, searchable',
    body: 'Filter by body part, equipment, or whether a movement is compound or isolation. Every exercise has photos, written instructions, the muscles it works, and a link to a video. Star the ones you use often.',
    route: '/library',
  },
  {
    title: 'Logging a workout',
    body: 'Type the weight and reps, then tap the tick when the set is done — only ticked sets are saved. There is a rest timer at the top, and you can add or reorder exercises mid-session. Anything you do not understand has a small ⓘ next to it.',
    route: '/log',
  },
  {
    title: 'Watch it add up',
    body: 'History keeps every session. Progress turns them into weekly volume, your streak, which body parts you have been favouring, and a personal record for each lift. All of it appears on its own as you train.',
    route: '/history',
  },
  {
    title: 'One last thing',
    body: 'Add RepForge to your home screen — the browser menu has "Add to Home Screen" — and it opens full screen like a normal app, works without signal, and keeps your session even if the phone locks mid-set.',
    route: '/settings',
  },
]

/**
 * A guided walkthrough that actually walks: each step moves the app to the screen it is
 * describing, so the sheet explains something the user can see behind it.
 */
export function Onboarding({ onDone }: { onDone: () => void }) {
  const [index, setIndex] = useState(0)
  const navigate = useNavigate()
  const step = STEPS[index]

  useEffect(() => {
    navigate(step.route)
  }, [step.route, navigate])

  const finish = useCallback(() => {
    try {
      localStorage.setItem(SEEN_KEY, '1')
    } catch {
      // A private window that refuses storage just means the tour offers itself again.
    }
    navigate('/')
    onDone()
  }, [navigate, onDone])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') finish()
      if (e.key === 'ArrowRight') setIndex((i) => Math.min(i + 1, STEPS.length - 1))
      if (e.key === 'ArrowLeft') setIndex((i) => Math.max(i - 1, 0))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [finish])

  const last = index === STEPS.length - 1

  return (
    <div className="tour-backdrop" role="dialog" aria-modal="true" aria-label="Guided tour">
      <div className="tour-card">
        <div className="row between" style={{ marginBottom: 10 }}>
          <div className="tour-dots" aria-hidden="true">
            {STEPS.map((s, i) => (
              <span key={s.title} className={i === index ? 'on' : i < index ? 'past' : ''} />
            ))}
          </div>
          <button type="button" className="icon-btn" onClick={finish} aria-label="Skip the tour">
            <CloseIcon />
          </button>
        </div>

        <h2>{step.title}</h2>
        <p style={{ marginTop: 8, color: 'var(--text-dim)' }}>{step.body}</p>

        <div className="row" style={{ marginTop: 18, gap: 9 }}>
          {index > 0 && (
            <button type="button" className="btn sm" onClick={() => setIndex((i) => i - 1)}>
              Back
            </button>
          )}
          <span className="small muted">
            {index + 1} of {STEPS.length}
          </span>
          <button
            type="button"
            className="btn primary"
            style={{ marginLeft: 'auto' }}
            onClick={() => (last ? finish() : setIndex((i) => i + 1))}
          >
            {last ? 'Start lifting' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}
