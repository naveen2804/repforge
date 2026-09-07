import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from './supabase'
import type { Unit } from './types'

/**
 * Supabase Auth is an e-mail/password system, but RepForge signs people in with a
 * plain username. Usernames are mapped onto a synthetic address in a domain reserved
 * by RFC 2606 (`.invalid`), which can never route to a real inbox — so nobody ever
 * receives mail, and no address can collide with somebody's actual e-mail.
 *
 * For this to work the Supabase project must have "Confirm email" switched OFF
 * (Authentication → Sign In / Providers → Email). See README.md.
 */
const EMAIL_DOMAIN = import.meta.env.VITE_AUTH_EMAIL_DOMAIN ?? 'repforge.invalid'

export const USERNAME_RULES = 'Letters, numbers, dots, dashes and underscores. 3–24 characters.'
const USERNAME_PATTERN = /^[a-zA-Z0-9._-]{3,24}$/

export function validateUsername(username: string): string | null {
  const trimmed = username.trim()
  if (!trimmed) return 'Pick a username.'
  if (!USERNAME_PATTERN.test(trimmed)) return USERNAME_RULES
  return null
}

export function validatePassword(password: string): string | null {
  if (password.length < 8) return 'Use at least 8 characters.'
  return null
}

function usernameToEmail(username: string): string {
  return `${username.trim().toLowerCase()}@${EMAIL_DOMAIN}`
}

export interface Profile {
  id: string
  username: string
  unit: Unit
}

interface AuthValue {
  loading: boolean
  user: User | null
  profile: Profile | null
  signIn: (username: string, password: string) => Promise<void>
  signUp: (username: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (patch: Partial<Pick<Profile, 'unit'>>) => Promise<void>
}

const AuthContext = createContext<AuthValue | null>(null)

/** Turns Supabase's terse auth errors into something a human can act on. */
function humanizeAuthError(message: string): string {
  const m = message.toLowerCase()
  if (m.includes('invalid login credentials')) return 'That username and password do not match an account.'
  if (m.includes('user already registered') || m.includes('already been registered')) {
    return 'That username is already taken.'
  }
  if (m.includes('email address') && m.includes('invalid')) {
    return 'The server rejected that username. Try letters and numbers only.'
  }
  if (m.includes('confirmation') || m.includes('confirm')) {
    return 'This Supabase project still requires e-mail confirmation. Turn "Confirm email" off in the dashboard.'
  }
  if (m.includes('rate limit')) return 'Too many attempts just now — wait a minute and try again.'
  if (m.includes('password')) return message
  return message
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)

  const loadProfile = useCallback(async (current: User | null) => {
    if (!current) {
      setProfile(null)
      return
    }
    const { data } = await supabase
      .from('profiles')
      .select('id, username, unit')
      .eq('id', current.id)
      .maybeSingle()

    if (data) {
      setProfile(data as Profile)
      return
    }

    // The database trigger normally creates this row; fall back to writing it here so a
    // project set up without the trigger still works.
    const fallbackName =
      (current.user_metadata?.username as string | undefined) ?? current.email?.split('@')[0] ?? 'lifter'
    const { data: created } = await supabase
      .from('profiles')
      .upsert({ id: current.id, username: fallbackName }, { onConflict: 'id' })
      .select('id, username, unit')
      .maybeSingle()
    setProfile((created as Profile) ?? { id: current.id, username: fallbackName, unit: 'kg' })
  }, [])

  useEffect(() => {
    let active = true

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      const current = data.session?.user ?? null
      setUser(current)
      void loadProfile(current).finally(() => active && setLoading(false))
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      const current = session?.user ?? null
      setUser(current)
      void loadProfile(current)
    })

    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [loadProfile])

  const signIn = useCallback(async (username: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: usernameToEmail(username),
      password,
    })
    if (error) throw new Error(humanizeAuthError(error.message))
  }, [])

  const signUp = useCallback(async (username: string, password: string) => {
    const clean = username.trim()

    // Usernames are unique across everyone, so check before burning a sign-up attempt.
    const { data: available, error: rpcError } = await supabase.rpc('username_available', {
      candidate: clean,
    })
    if (!rpcError && available === false) throw new Error('That username is already taken.')

    const { data, error } = await supabase.auth.signUp({
      email: usernameToEmail(clean),
      password,
      options: { data: { username: clean } },
    })
    if (error) throw new Error(humanizeAuthError(error.message))
    if (!data.session) {
      throw new Error(
        'The account was created but no session came back — "Confirm email" is still on for this Supabase project.',
      )
    }
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setProfile(null)
  }, [])

  const updateProfile = useCallback(
    async (patch: Partial<Pick<Profile, 'unit'>>) => {
      if (!user) return
      setProfile((p) => (p ? { ...p, ...patch } : p))
      await supabase.from('profiles').update(patch).eq('id', user.id)
    },
    [user],
  )

  const value = useMemo<AuthValue>(
    () => ({ loading, user, profile, signIn, signUp, signOut, updateProfile }),
    [loading, user, profile, signIn, signUp, signOut, updateProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
