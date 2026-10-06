import { useState } from 'react'
import { USERNAME_RULES, useAuth, validatePassword, validateUsername } from '../lib/auth'
import { isFirebaseConfigured } from '../lib/firebase'
import { ErrorNote } from '../components/Common'

export function Login() {
  const { signIn, signUp, continueAsGuest } = useAuth()
  const [mode, setMode] = useState<'in' | 'up'>('in')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const usernameError = validateUsername(username)
    if (usernameError) return setError(usernameError)

    if (mode === 'up') {
      const passwordError = validatePassword(password)
      if (passwordError) return setError(passwordError)
      if (password !== confirm) return setError('The two passwords do not match.')
    }

    setBusy(true)
    try {
      if (mode === 'in') await signIn(username, password)
      else await signUp(username, password)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  async function onGuest() {
    setError(null)
    setBusy(true)
    try {
      await continueAsGuest()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={onSubmit}>
        <div className="logo">
          <img src={`${import.meta.env.BASE_URL}icons/icon-192.png`} alt="" />
          <div>
            <h1>RepForge</h1>
            <p>Plan, log and track your lifts.</p>
          </div>
        </div>

        {!isFirebaseConfigured && (
          <div className="notice error">
            Firebase is not configured for this build. Set the VITE_FIREBASE_* variables.
          </div>
        )}

        <div className="seg" style={{ alignSelf: 'flex-start' }}>
          <button type="button" className={mode === 'in' ? 'on' : ''} onClick={() => { setMode('in'); setError(null) }}>
            Sign in
          </button>
          <button type="button" className={mode === 'up' ? 'on' : ''} onClick={() => { setMode('up'); setError(null) }}>
            Create account
          </button>
        </div>

        <div className="field">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            className="input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoCapitalize="none"
            autoCorrect="off"
            autoComplete="username"
            spellCheck={false}
            placeholder="naveen"
          />
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === 'in' ? 'current-password' : 'new-password'}
            placeholder="••••••••"
          />
        </div>

        {mode === 'up' && (
          <div className="field">
            <label htmlFor="confirm">Confirm password</label>
            <input
              id="confirm"
              className="input"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              placeholder="••••••••"
            />
          </div>
        )}

        <ErrorNote message={error} />

        <button className="btn primary lg block" type="submit" disabled={busy || !isFirebaseConfigured}>
          {busy ? 'Working…' : mode === 'in' ? 'Sign in' : 'Create account'}
        </button>

        <p className="small muted">
          {mode === 'up'
            ? `${USERNAME_RULES} There is no e-mail and no password reset — keep the password somewhere safe.`
            : 'Your workouts are private to your account.'}
        </p>

        <div className="divider" style={{ margin: 0 }} />

        <button type="button" className="btn ghost block" onClick={() => void onGuest()} disabled={busy || !isFirebaseConfigured}>
          Continue as guest
        </button>
        <p className="small muted" style={{ marginTop: -8 }}>
          No username needed. Your workouts stay on this device only — you can save them to an
          account later from Settings.
        </p>
      </form>
    </div>
  )
}
