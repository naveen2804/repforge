import { useEffect, useRef, useState } from 'react'
import { formatClock } from '../lib/format'
import { CloseIcon } from './Icons'

const PRESETS = [60, 90, 120, 180]

/**
 * Counts down between sets. It works off a wall-clock deadline rather than a tick count,
 * so backgrounding the app on a phone does not make the timer drift.
 */
export function RestTimer() {
  const [deadline, setDeadline] = useState<number | null>(null)
  const [remaining, setRemaining] = useState(0)
  const dinged = useRef(false)

  useEffect(() => {
    if (deadline === null) return
    const tick = () => {
      const left = Math.max(0, Math.round((deadline - Date.now()) / 1000))
      setRemaining(left)
      if (left === 0 && !dinged.current) {
        dinged.current = true
        if ('vibrate' in navigator) navigator.vibrate([180, 90, 180])
      }
    }
    tick()
    const handle = window.setInterval(tick, 250)
    return () => window.clearInterval(handle)
  }, [deadline])

  if (deadline === null) {
    return (
      <div className="row wrap" style={{ gap: 7 }}>
        <span className="small muted">Rest timer</span>
        {PRESETS.map((s) => (
          <button
            key={s}
            type="button"
            className="chip"
            onClick={() => {
              dinged.current = false
              setDeadline(Date.now() + s * 1000)
            }}
          >
            {s < 60 ? `${s}s` : `${s / 60}m`}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="timer">
      <span>{remaining === 0 ? 'Rest over — go!' : `Rest ${formatClock(remaining)}`}</span>
      <button
        type="button"
        className="icon-btn"
        style={{ color: 'inherit', marginLeft: 'auto' }}
        onClick={() => setDeadline(null)}
        aria-label="Cancel rest timer"
      >
        <CloseIcon />
      </button>
    </div>
  )
}
