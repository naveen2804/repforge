import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import {
  EmailAuthProvider,
  createUserWithEmailAndPassword,
  linkWithCredential,
  onAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import type { User } from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore/lite'
import { auth, firestore } from './firebase'
import type { Unit } from './types'

/**
 * Firebase Auth is an e-mail/password system, but RepForge signs people in with a
 * plain username. Usernames are mapped onto a synthetic address in a domain reserved
 * by RFC 2606 (`.invalid`), which can never route to a real inbox — so nobody ever
 * receives mail, and no address can collide with somebody's actual e-mail. Because the
 * address is lower-cased, Firebase's own "one account per e-mail" rule is also what keeps
 * usernames unique and case-insensitive.
 *
 * Guests sign in anonymously. Their data lives under the same users/{uid} rules as
 * everyone else's, but the account exists only in this browser until they save it.
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
  /** Null for a guest who has not saved their account yet. */
  username: string | null
  unit: Unit
}

interface AuthValue {
  loading: boolean
  user: User | null
  isGuest: boolean
  profile: Profile | null
  signIn: (username: string, password: string) => Promise<void>
  signUp: (username: string, password: string) => Promise<void>
  continueAsGuest: () => Promise<void>
  /** Turns the current guest into a normal account, keeping the uid and all its data. */
  saveGuestAccount: (username: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (patch: Partial<Pick<Profile, 'unit'>>) => Promise<void>
}

const AuthContext = createContext<AuthValue | null>(null)

/** Turns Firebase's error codes into something a human can act on. */
function humanizeAuthError(err: unknown): string {
  const code = (err as { code?: string }).code ?? ''
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'That username and password do not match an account.'
    case 'auth/email-already-in-use':
    case 'auth/credential-already-in-use':
      return 'That username is already taken.'
    case 'auth/invalid-email':
      return 'The server rejected that username. Try letters and numbers only.'
    case 'auth/weak-password':
      return 'Use at least 8 characters.'
    case 'auth/too-many-requests':
      return 'Too many attempts just now — wait a minute and try again.'
    case 'auth/network-request-failed':
      return 'Could not reach the server. Check your connection and try again.'
    case 'auth/operation-not-allowed':
    case 'auth/admin-restricted-operation':
      return 'This sign-in method is switched off in the Firebase console.'
    default:
      return (err as Error).message ?? 'Something went wrong.'
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [isGuest, setIsGuest] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)

  // The username as typed at sign-up ("Naveen", not "naveen"). The auth-state listener
  // creates the profile document and runs before signUp() regains control, so the casing
  // is handed over through this ref rather than written afterwards.
  const pendingUsername = useRef<string | null>(null)

  const loadProfile = useCallback(async (current: User | null) => {
    if (!current) {
      setProfile(null)
      return
    }
    const ref = doc(firestore, 'users', current.uid)
    const snap = await getDoc(ref)
    if (snap.exists()) {
      const data = snap.data()
      setProfile({ id: current.uid, username: data.username ?? null, unit: data.unit ?? 'kg' })
      return
    }

    const username = current.isAnonymous
      ? null
      : (pendingUsername.current ?? current.email?.split('@')[0] ?? 'lifter')
    pendingUsername.current = null
    await setDoc(ref, { username, unit: 'kg', favorites: [], created_at: new Date().toISOString() })
    setProfile({ id: current.uid, username, unit: 'kg' })
  }, [])

  useEffect(() => {
    // Fires once on load with the persisted user (or null), then on every sign-in/out.
    return onAuthStateChanged(auth, (current) => {
      setUser(current)
      setIsGuest(current?.isAnonymous ?? false)
      void loadProfile(current)
        .catch(() => current && setProfile({ id: current.uid, username: null, unit: 'kg' }))
        .finally(() => setLoading(false))
    })
  }, [loadProfile])

  const signIn = useCallback(async (username: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, usernameToEmail(username), password)
    } catch (err) {
      throw new Error(humanizeAuthError(err))
    }
  }, [])

  const signUp = useCallback(async (username: string, password: string) => {
    pendingUsername.current = username.trim()
    try {
      await createUserWithEmailAndPassword(auth, usernameToEmail(username), password)
    } catch (err) {
      pendingUsername.current = null
      throw new Error(humanizeAuthError(err))
    }
  }, [])

  const continueAsGuest = useCallback(async () => {
    try {
      await signInAnonymously(auth)
    } catch (err) {
      throw new Error(humanizeAuthError(err))
    }
  }, [])

  const saveGuestAccount = useCallback(async (username: string, password: string) => {
    const current = auth.currentUser
    if (!current?.isAnonymous) throw new Error('Only a guest account can be saved.')
    const clean = username.trim()
    try {
      // Linking upgrades the same user in place, so the uid — and every document under
      // users/{uid} — carries straight over. No auth-state event fires for it.
      await linkWithCredential(current, EmailAuthProvider.credential(usernameToEmail(clean), password))
    } catch (err) {
      throw new Error(humanizeAuthError(err))
    }
    await updateDoc(doc(firestore, 'users', current.uid), { username: clean })
    setIsGuest(false)
    setProfile((p) => (p ? { ...p, username: clean } : p))
  }, [])

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth)
    setProfile(null)
  }, [])

  const updateProfile = useCallback(
    async (patch: Partial<Pick<Profile, 'unit'>>) => {
      if (!user) return
      setProfile((p) => (p ? { ...p, ...patch } : p))
      await updateDoc(doc(firestore, 'users', user.uid), patch)
    },
    [user],
  )

  const value = useMemo<AuthValue>(
    () => ({
      loading,
      user,
      isGuest,
      profile,
      signIn,
      signUp,
      continueAsGuest,
      saveGuestAccount,
      signOut,
      updateProfile,
    }),
    [loading, user, isGuest, profile, signIn, signUp, continueAsGuest, saveGuestAccount, signOut, updateProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
