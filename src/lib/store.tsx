import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useAuth } from './auth'
import {
  fetchCustomTemplates,
  fetchFavorites,
  fetchSessions,
  toggleFavorite as toggleFavoriteRow,
  type CustomTemplate,
} from './db'
import { loadExercises } from '../data/catalog'
import type { Exercise, FullSession } from './types'

/**
 * One shared load of everything the screens read: the static catalogue plus this
 * user's history, favourites and saved templates. Sessions are small enough (a set row
 * is a handful of numbers) that keeping them all in memory makes every chart, streak and
 * personal record a pure client-side computation with no extra round trips.
 */
interface StoreValue {
  loading: boolean
  error: string | null
  exercises: Exercise[]
  byId: Map<string, Exercise>
  sessions: FullSession[]
  favorites: Set<string>
  customTemplates: CustomTemplate[]
  refresh: () => Promise<void>
  toggleFavorite: (exerciseId: string) => Promise<void>
}

const StoreContext = createContext<StoreValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [sessions, setSessions] = useState<FullSession[]>([])
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([])

  const refresh = useCallback(async () => {
    if (!user) return
    const [sessionResult, favResult, templateResult] = await Promise.allSettled([
      fetchSessions(),
      fetchFavorites(),
      fetchCustomTemplates(),
    ])
    if (sessionResult.status === 'fulfilled') setSessions(sessionResult.value)
    if (favResult.status === 'fulfilled') setFavorites(new Set(favResult.value))
    if (templateResult.status === 'fulfilled') setCustomTemplates(templateResult.value)

    const failure = [sessionResult, favResult, templateResult].find((r) => r.status === 'rejected')
    setError(failure ? (failure as PromiseRejectedResult).reason?.message ?? 'Could not reach Supabase.' : null)
  }, [user])

  useEffect(() => {
    let active = true
    setLoading(true)

    loadExercises()
      .then((list) => active && setExercises(list))
      .catch((e: Error) => active && setError(e.message))
      .then(() => refresh())
      .finally(() => active && setLoading(false))

    return () => {
      active = false
    }
  }, [refresh])

  const byId = useMemo(() => new Map(exercises.map((e) => [e.id, e])), [exercises])

  const toggleFavorite = useCallback(
    async (exerciseId: string) => {
      if (!user) return
      const on = !favorites.has(exerciseId)
      setFavorites((prev) => {
        const next = new Set(prev)
        if (on) next.add(exerciseId)
        else next.delete(exerciseId)
        return next
      })
      try {
        await toggleFavoriteRow(user.id, exerciseId, on)
      } catch {
        // Put it back the way it was if the write did not land.
        setFavorites((prev) => {
          const next = new Set(prev)
          if (on) next.delete(exerciseId)
          else next.add(exerciseId)
          return next
        })
      }
    },
    [user, favorites],
  )

  const value = useMemo<StoreValue>(
    () => ({ loading, error, exercises, byId, sessions, favorites, customTemplates, refresh, toggleFavorite }),
    [loading, error, exercises, byId, sessions, favorites, customTemplates, refresh, toggleFavorite],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside StoreProvider')
  return ctx
}
