import { useLocation, useNavigate, Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  CircleHelp,
  LogOut,
} from 'lucide-react'
import PageTransition from './PageTransition'
import { useAuth } from '../contexts/AuthContext'
import { buildNavItems, resolveActivePage } from './NavigationConfig'
import NotificationDropdown from './NotificationDropdown'
import ThemeSwitcher from './ThemeSwitcher'
import './AgentLayout.css'

function getTopbarTitle(activePage) {
  const titles = {
    dashboard: 'Agent Dashboard',
    notifications: 'Notification Center',
    properties: 'Assigned Properties',
    bookings: 'Bookings',
    maintenance: 'Maintenance',
    categories: 'Property Categories',
    profile: 'Profile',
    settings: 'Settings',
    help: 'Help Center',
  }
  return titles[activePage] || 'Agent Dashboard'
}

function AgentLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

  const navItems = buildNavItems(user?.role || 'Agent')
  const activePage = resolveActivePage(location.pathname, user?.role || 'Agent')

  const initials = user
    ? (user.full_name || user.name || 'AG').split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : 'AG'

  function safeNavigate(path) {
    if (location.pathname !== path) navigate(path)
  }

  function handleLogout() {
    logout(navigate)
  }

  return (
    <main className="agent-layout-shell">
      <aside className="agent-layout-sidebar">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activePage === item.key
          return (
            <motion.button
              type="button"
              key={item.key}
              className={`agent-layout-side-btn ${isActive ? 'active' : ''}`}
              onClick={() => safeNavigate(item.path)}
              title={item.label}
              whileTap={{ scale: 0.96 }}
            >
              <Icon size={25} />
              <span>{item.label}</span>
            </motion.button>
          )
        })}

        <div className="agent-layout-side-spacer"></div>

        <motion.button
          type="button"
          className={`agent-layout-side-btn ${activePage === 'help' ? 'active' : ''}`}
          onClick={() => safeNavigate('/agent/help')}
          title="Help"
          whileTap={{ scale: 0.96 }}
        >
          <CircleHelp size={24} />
          <span>Help</span>
        </motion.button>

        <motion.button
          type="button"
          className="agent-layout-side-btn logout"
          onClick={handleLogout}
          title="Logout"
          whileTap={{ scale: 0.96 }}
        >
          <LogOut size={24} />
          <span>Logout</span>
        </motion.button>
      </aside>

      <section className="agent-layout-main">
        <header className="agent-layout-topbar">
          <div className="agent-layout-brand" onClick={() => safeNavigate('/agent')}>
            <h2>PRMS</h2>
            <span></span>
            <p>{getTopbarTitle(activePage)}</p>
          </div>

          <div className="agent-layout-top-actions">
            <NotificationDropdown />
            <ThemeSwitcher />

            <motion.div
              className="agent-layout-avatar"
              whileHover={{ scale: 1.08 }}
              style={{ cursor: 'pointer' }}
              onClick={() => safeNavigate('/agent/profile')}
            >
              {initials}
            </motion.div>
          </div>
        </header>

        <div className="agent-layout-content">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </div>
      </section>
    </main>
  )
}

export default AgentLayout
