import { useLocation, useNavigate, Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  CircleHelp,
  LogOut,
  Search,
} from 'lucide-react'
import PageTransition from './PageTransition'
import { useAuth } from '../contexts/AuthContext'
import { buildNavItems, resolveActivePage } from './NavigationConfig'
import NotificationDropdown from './NotificationDropdown'
import ProfileDropdown from './ProfileDropdown'
import ThemeSwitcher from './ThemeSwitcher'
import './LandlordLayout.css'

function LandlordLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

  const role = user?.role || 'Landlord'
  const navItems = buildNavItems(role)
  const activePage = resolveActivePage(location.pathname, role)

  function safeNavigate(path) {
    if (location.pathname !== path) navigate(path)
  }

  function handleLogout() {
    logout(navigate)
  }

  return (
    <main className="landlord-layout-shell">
      <aside className="landlord-layout-sidebar">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activePage === item.key
          return (
            <motion.button
              type="button"
              key={item.key}
              className={`landlord-layout-side-btn ${isActive ? 'active' : ''}`}
              onClick={() => safeNavigate(item.path)}
              title={item.label}
              whileTap={{ scale: 0.96 }}
            >
              <Icon size={25} />
              <span>{item.label}</span>
            </motion.button>
          )
        })}

        <div className="landlord-layout-side-spacer"></div>

        <motion.button
          type="button"
          className={`landlord-layout-side-btn ${activePage === 'help' ? 'active' : ''}`}
          onClick={() => safeNavigate('/landlord/help')}
          title="Help"
          whileTap={{ scale: 0.96 }}
        >
          <CircleHelp size={24} />
          <span>Help</span>
        </motion.button>

        <motion.button
          type="button"
          className="landlord-layout-side-btn logout"
          onClick={handleLogout}
          title="Logout"
          whileTap={{ scale: 0.96 }}
        >
          <LogOut size={24} />
          <span>Logout</span>
        </motion.button>
      </aside>

      <section className="landlord-layout-main">
        <header className="landlord-layout-topbar">
          <div className="landlord-layout-brand" onClick={() => safeNavigate('/landlord')}>
            <h2>PRMS</h2>
            <span></span>
            <p>{role} Portal</p>
          </div>

          <div className="landlord-layout-search">
            <Search size={22} />
            <input type="text" placeholder="Search portfolios..." />
          </div>

          <div className="landlord-layout-actions">
            <NotificationDropdown />
            <ThemeSwitcher />
            <ProfileDropdown prefix="/landlord" />
          </div>
        </header>

        <div className="landlord-layout-content">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </div>
      </section>
    </main>
  )
}

export default LandlordLayout
