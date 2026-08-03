import { useEffect, useState } from 'react'
import { useSettings } from '../contexts/SettingsContext'
import {
  Activity,
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Database,
  Download,
  Loader,
  Minus,
  Search,
  Server,
  ShieldCheck,
  SlidersHorizontal,
  Users,
  WalletCards,
} from 'lucide-react'
import './AdminDashboard.css'

function AdminDashboard() {
  const { settings } = useSettings()
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    localStorage.setItem('prmsDashboardPath', '/admin')
  // Simulate a brief load for skeleton
  const t = setTimeout(() => setLoading(false), 600)
  return () => clearTimeout(t)
  }, [])

  const users = [
    {
      initials: 'JD',
      name: 'Julianna DeWitt',
      email: 'julianna.d@prms.com',
      role: 'Landlord',
      status: 'Verified',
      activity: '2 mins ago',
    },
    {
      initials: 'MC',
      name: 'Marcus Chen',
      email: 'm.chen@outlook.com',
      role: 'Tenant',
      status: 'Pending KYC',
      activity: '1 hour ago',
    },
    {
      initials: 'SA',
      name: 'Sarah Al-Zaid',
      email: 'admin.sarah@prms.sys',
      role: 'Admin',
      status: 'Verified',
      activity: 'Now',
    },
  ]

  const auditLogs = [
    {
      time: '14:22:01',
      title: 'USER_LOGIN_SUCCESS',
      detail: 'UID: 4421-XB | IP: 192.168.1.104',
      type: 'success',
    },
    {
      time: '14:21:45',
      title: 'AUTH_FAILURE_RESTRICTED',
      detail: 'Unauthorized API attempt on financials',
      type: 'danger',
    },
    {
      time: '14:20:12',
      title: 'TRANSACTION_CLEARED',
      detail: 'Ref: RM-8892 | RM 12,500.00',
      type: 'success',
    },
  ]

  /* ---- KPI Card helper ---- */
  function KpiCard({ icon: Icon, iconBg, label, value, sublabel, trend, trendDir }) {
    const TrendIcon =
      trendDir === 'up' ? (
        <ArrowUp size={14} className="text-status-success" />
      ) : trendDir === 'down' ? (
        <ArrowDown size={14} className="text-status-error" />
      ) : (
        <Minus size={14} className="text-text-secondary" />
      )

    return (
      <div className="kpi-card">
        <div className="kpi-card-top">
          <div className={`kpi-icon-wrap ${iconBg}`}>
            <Icon size={20} />
          </div>
          {trend && (
            <span className={`trend-pill ${trendDir === 'up' ? 'positive' : trendDir === 'down' ? 'negative' : 'neutral'}`}>
              {TrendIcon}
              {trend}
            </span>
          )}
        </div>
        <div className="kpi-card-body">
          <span className="kpi-label">{label}</span>
          <div className="kpi-value">{value}</div>
          {sublabel && <span className="kpi-sublabel">{sublabel}</span>}
        </div>
      </div>
    )
  }

  return (
    <div className="admin-dashboard-page">
      {/* ---- Hero ---- */}
      <div className="landlord-page-title-row">
        <div>
          <h1>
            <span className="material-symbols-outlined brand-icon">settings_applications</span>
            System Health Console
          </h1>
          <p>Infrastructure monitoring and global operations audit overview.</p>
        </div>

        <div className="landlord-page-actions">
          <button type="button" className="btn-outline">
            <SlidersHorizontal size={18} />
            Filter
          </button>
          <button type="button" className="btn-primary-solid">
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      {/* ---- KPI Metrics ---- */}
      <section className="kpi-card-grid">
        {loading ? (
          <>
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="kpi-card kpi-skeleton">
                <div className="skeleton-line skeleton-sm" />
                <div className="skeleton-line skeleton-lg" />
                <div className="skeleton-line skeleton-xs" />
              </div>
            ))}
          </>
        ) : (
          <>
            {/* Uptime */}
            <KpiCard
              icon={Activity}
              iconBg="icon-emerald"
              label="Uptime"
              value="99.98%"
              sublabel="Last 30 days"
              trend="+0.02%"
              trendDir="up"
            />

            {/* Transactions */}
            <KpiCard
              icon={WalletCards}
              iconBg="icon-purple"
              label="Transactions"
              value="RM 4.2M"
              sublabel="This month"
              trend="+12%"
              trendDir="up"
            />

            {/* Active Users */}
            <KpiCard
              icon={Users}
              iconBg="icon-blue"
              label="Active Users"
              value="12,482"
              sublabel="Across 12 clusters"
              trend="+340"
              trendDir="up"
            />

            {/* Integrity */}
            <KpiCard
              icon={ShieldCheck}
              iconBg="icon-rose"
              label="System Integrity"
              value="Secure"
              sublabel="2 alerts pending"
              trend="2 alerts"
              trendDir="down"
            />
          </>
        )}
      </section>

      {/* ---- User Directory + Right Panel ---- */}
      <section className="dashboard-main-grid">
        {/* User directory */}
        <div className="panel-card admin-directory">
          <div className="panel-title">
            <div>
              <h3 className="panel-title-text">User Directory</h3>
              <p className="panel-subtitle">Recent authenticated sessions</p>
            </div>
            <div className="admin-search">
              <Search size={16} />
              <input type="text" placeholder="Search users..." />
            </div>
          </div>

          <div className="admin-table-warp">
            <div className="admin-table-head">
              <span>User</span>
              <span>Role</span>
              <span>Status</span>
              <span>Last Seen</span>
            </div>

            {users.map((user) => (
              <div className="admin-table-row" key={user.email}>
                <div className="admin-user-cell">
                  <div className="admin-user-avatar">{user.initials}</div>
                  <div className="admin-user-info">
                    <h4>{user.name}</h4>
                    <p>{user.email}</p>
                  </div>
                </div>

                <span className="user-role user-role--landlord">{user.role}</span>
                <span className={`user-status ${user.status === 'Pending KYC' ? 'user-status--pending' : 'user-status--active'}`}>
                  <span className="status-dot" />
                  {user.status}
                </span>
                <p className="admin-activity">{user.activity}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel: Audit Log + Clusters */}
        <div className="admin-right-col">
          {/* Audit log */}
          <div className="panel-card admin-audit dark-panel">
            <div className="audit-header">
              <h3 className="panel-title-text">Global Audit Log</h3>
              <span className="audit-live">
                <span className="live-dot" />
                LIVE
              </span>
            </div>

            <div className="audit-list custom-scrollbar">
              {auditLogs.map((log) => (
                <div key={`${log.time}-${log.title}`} className={`audit-item audit-${log.type}`}>
                  <span className="audit-time">{log.time}</span>
                  <div className="audit-body">
                    <h4>{log.title}</h4>
                    <p>{log.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Operational notes */}
          <div className="panel-card admin-notes">
            <div className="notes-header">
              <h3 className="panel-title-text">Operational Notes</h3>
            </div>

            <p className="notes-text">12 clusters online across Southeast Asia.</p>

            <div className="clusters-grid">
              <div className="cluster-tile">
                <span>KL</span>
                <strong>8.2k</strong>
              </div>
              <div className="cluster-tile">
                <span>SG</span>
                <strong>4.1k</strong>
              </div>
              <div className="cluster-tile">
                <span>MY</span>
                <strong>2.4k</strong>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AdminDashboard