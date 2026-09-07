import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useSession } from '../lib/session'
import { DumbbellIcon, HistoryIcon, HomeIcon, LibraryIcon, SettingsIcon } from './Icons'

export function Layout() {
  const { draft } = useSession()
  const { pathname } = useLocation()

  const navClass = ({ isActive }: { isActive: boolean }) => (isActive ? 'active' : '')

  return (
    <div className="app">
      <nav className="nav">
        <NavLink to="/" className="brand">
          <img src={`${import.meta.env.BASE_URL}icons/icon-192.png`} alt="" />
          RepForge
        </NavLink>
        <NavLink to="/" end className={navClass}>
          <HomeIcon />
          Home
        </NavLink>
        <NavLink to="/library" className={() => (pathname.startsWith('/library') || pathname.startsWith('/exercise') ? 'active' : '')}>
          <LibraryIcon />
          Library
        </NavLink>
        <NavLink to="/log" className={navClass}>
          <DumbbellIcon />
          Log
          {draft && <span className="dot" aria-label="workout in progress" />}
        </NavLink>
        <NavLink to="/history" className={() => (pathname.startsWith('/history') || pathname.startsWith('/progress') || pathname.startsWith('/session') ? 'active' : '')}>
          <HistoryIcon />
          History
        </NavLink>
        <NavLink to="/settings" className={navClass}>
          <SettingsIcon />
          Settings
        </NavLink>
      </nav>
      <Outlet />
    </div>
  )
}
