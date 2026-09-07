import { useEffect, useState } from 'react'
import { HashRouter, Navigate, Route, Routes, useSearchParams } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/auth'
import { SettingsProvider } from './lib/settings'
import { SessionProvider } from './lib/session'
import { StoreProvider } from './lib/store'
import { Layout } from './components/Layout'
import { Spinner } from './components/Common'
import { Onboarding, hasSeenTour } from './components/Onboarding'
import { Login } from './routes/Login'
import { Home } from './routes/Home'
import { Library } from './routes/Library'
import { ExerciseDetail } from './routes/ExerciseDetail'
import { TemplatePreview } from './routes/TemplatePreview'
import { Programs } from './routes/Programs'
import { ProgramDetail } from './routes/ProgramDetail'
import { Log } from './routes/Log'
import { History } from './routes/History'
import { SessionDetail } from './routes/SessionDetail'
import { Progress } from './routes/Progress'
import { Settings } from './routes/Settings'
import { About } from './routes/About'
import { Glossary } from './routes/Glossary'

/**
 * Routing uses a hash router on purpose: GitHub Pages serves static files only and
 * would 404 on a deep link like /repforge/history with a history router.
 */
function Shell() {
  const { loading, user } = useAuth()

  if (loading) return <Spinner />
  if (!user) return <Login />

  return (
    <StoreProvider>
      <SessionProvider>
        <TourHost />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/glossary" element={<Glossary />} />
            <Route path="/library" element={<Library />} />
            <Route path="/exercise/:id" element={<ExerciseDetail />} />
            <Route path="/programs" element={<Programs />} />
            <Route path="/program/:key" element={<ProgramDetail />} />
            <Route path="/template/:key" element={<TemplatePreview />} />
            <Route path="/log" element={<Log />} />
            <Route path="/history" element={<History />} />
            <Route path="/session/:id" element={<SessionDetail />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </SessionProvider>
    </StoreProvider>
  )
}

/** Runs the walkthrough on a first visit, or whenever something links to `?tour=1`. */
function TourHost() {
  const [params] = useSearchParams()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (params.get('tour') === '1' || !hasSeenTour()) setOpen(true)
  }, [params])

  return open ? <Onboarding onDone={() => setOpen(false)} /> : null
}

export function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <SettingsProvider>
          <Shell />
        </SettingsProvider>
      </AuthProvider>
    </HashRouter>
  )
}
