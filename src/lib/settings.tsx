import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useAuth } from './auth'
import type { ThemeChoice, Unit } from './types'

const THEME_KEY = 'repforge-theme'

interface SettingsValue {
  theme: ThemeChoice
  setTheme: (t: ThemeChoice) => void
  resolvedTheme: 'light' | 'dark'
  unit: Unit
  setUnit: (u: Unit) => void
}

const SettingsContext = createContext<SettingsValue | null>(null)

function readStoredTheme(): ThemeChoice {
  const stored = localStorage.getItem(THEME_KEY)
  return stored === 'dark' || stored === 'system' ? stored : 'light'
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { profile, updateProfile } = useAuth()
  const [theme, setThemeState] = useState<ThemeChoice>(readStoredTheme)
  const [systemDark, setSystemDark] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches,
  )
  // The unit lives on the profile, but is mirrored locally so the UI does not flash
  // the wrong unit while the profile is still loading.
  const [localUnit, setLocalUnit] = useState<Unit>(
    () => (localStorage.getItem('repforge-unit') as Unit) ?? 'kg',
  )

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (profile?.unit) {
      setLocalUnit(profile.unit)
      localStorage.setItem('repforge-unit', profile.unit)
    }
  }, [profile?.unit])

  const resolvedTheme: 'light' | 'dark' =
    theme === 'system' ? (systemDark ? 'dark' : 'light') : theme

  useEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme
    const meta = document.querySelector('meta[name="theme-color"]')
    meta?.setAttribute('content', resolvedTheme === 'dark' ? '#101012' : '#f7f7f8')
  }, [resolvedTheme])

  const value = useMemo<SettingsValue>(
    () => ({
      theme,
      resolvedTheme,
      setTheme: (t) => {
        setThemeState(t)
        localStorage.setItem(THEME_KEY, t)
      },
      unit: localUnit,
      setUnit: (u) => {
        setLocalUnit(u)
        localStorage.setItem('repforge-unit', u)
        void updateProfile({ unit: u })
      },
    }),
    [theme, resolvedTheme, localUnit, updateProfile],
  )

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings(): SettingsValue {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider')
  return ctx
}
