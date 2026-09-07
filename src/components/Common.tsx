import { useEffect, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, CloseIcon } from './Icons'

export function Spinner() {
  return (
    <div className="center-pad">
      <div className="spin" role="status" aria-label="Loading" />
    </div>
  )
}

export function Empty({ emoji, title, children }: { emoji: string; title: string; children?: ReactNode }) {
  return (
    <div className="empty">
      <div className="emoji">{emoji}</div>
      <h3>{title}</h3>
      {children && <p>{children}</p>}
    </div>
  )
}

export function ErrorNote({ message }: { message: string | null }) {
  if (!message) return null
  return <div className="notice error">{message}</div>
}

export function BackButton({ label = 'Back', to }: { label?: string; to?: string }) {
  const navigate = useNavigate()
  return (
    <button
      type="button"
      className="btn ghost sm"
      onClick={() => (to ? navigate(to) : navigate(-1))}
      style={{ marginLeft: -8 }}
    >
      <ChevronLeft />
      {label}
    </button>
  )
}

export function Sheet({
  title,
  onClose,
  children,
  footer,
}: {
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}) {
  // A sheet takes over the screen, so stop the page underneath from scrolling with it.
  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return (
    <div className="sheet-backdrop" onClick={onClose} role="presentation">
      <div className="sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={title}>
        <header>
          <h2>{title}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            <CloseIcon />
          </button>
        </header>
        <div className="body">{children}</div>
        {footer && (
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
