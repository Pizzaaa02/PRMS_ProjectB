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
import './TenantLayout.css'

function TenantLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

  const role = user?.role || 'Tenant'
  const navItems = buildNavItems(role)
  const activePage = resolveActivePage(location.pathname, role)

  function safeNavigate(path) {
    if (location.pathname !== path) navigate(path)
  }

  function handleLogout() {
    logout(navigate)
  }

  return (
    <main className="tenant-layout-shell">
      <aside className="tenant-layout-sidebar">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activePage === item.key
          return (
            <motion.button
              type="button"
              key={item.key}
              className={`tenant-layout-side-btn ${isActive ? 'active' : ''}`}
              onClick={() => safeNavigate(item.path)}
              title={item.label}
              whileTap={{ scale: 0.96 }}
            >
              <Icon size={25} />
              <span>{item.label}</span>
            </motion.button>
          )
        })}

        <div className="tenant-layout-side-spacer"></div>

        <motion.button
          type="button"
          className={`tenant-layout-side-btn ${activePage === 'help' ? 'active' : ''}`}
          onClick={() => safeNavigate(`${location.pathname.split('/')[0]}/help`)}
          title="Help"
          whileTap={{ scale: 0.96 }}
        >
          <CircleHelp size={24} />
          <span>Help</span>
        </motion.button>

        <motion.button
          type="button"
          className="tenant-layout-side-btn logout"
          onClick={handleLogout}
          title="Logout"
          whileTap={{ scale: 0.96 }}
        >
          <LogOut size={24} />
          <span>Logout</span>
        </motion.button>
      </aside>

      <section className="tenant-layout-main">
        <header className="tenant-layout-topbar">
          <div className="tenant-layout-brand" onClick={() => safeNavigate('/tenant')}>
            <h2>PRMS</h2>
            <span></span>
            <p>{role} Portal</p>
          </div>

          <div className="tenant-layout-search">
            <Search size={22} />
            <input type="text" placeholder="Search..." />
          </div>

          <div className="tenant-layout-actions">
            <NotificationDropdown />
            <ThemeSwitcher />
            <ProfileDropdown prefix="/tenant" />
          </div>
        </header>

        <div className="tenant-layout-content">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </div>
      </section>
    </main>
  )
}

export default TenantLayout
