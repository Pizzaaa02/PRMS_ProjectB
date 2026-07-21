import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../config/routes'
import {
  Bell,
  Download,
  Plus,
  Users,
  WalletCards,
  Wrench,
  Loader,
} from 'lucide-react'
import { bookingApi } from '../api/booking'
import { maintenanceApi } from '../api/maintenance'
import { propertyApi } from '../api/property'
import { adminApi } from '../api/admin'
import './LandlordDashboard.css'

function LandlordDashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState(0)
  const [stats, setStats] = useState({
    totalRevenue: 0,
    occupancyRate: 0,
    totalProperties: 0,
    activeProperties: 0,
    pendingBookings: 0,
    approvedBookings: 0,
    rejectedBookings: 0,
    cancelledBookings: 0,
    openTickets: 0,
    urgentTickets: 0,
  })
  const [approvals, setApprovals] = useState([])
  const [propertiesList, setPropertiesList] = useState([])
  const [revenueBars, setRevenueBars] = useState([])

  async function loadDashboard() {
    setLoading(true)
    let errCount = 0

    try {
      /* ---- Booking stats (pending / confirmed / cancelled counts) ---- */
      try {
        const res = await bookingApi.list({ limit: 100 })
        const bookings = res?.data?.data?.items ?? res?.data ?? []
        const pending = bookings.filter((b) => b.status === 'PENDING').length
        const confirmed = bookings.filter((b) => b.status === 'CONFIRMED').length
        const cancelled = bookings.filter((b) => b.status === 'CANCELLED').length
        setStats((s) => ({ ...s, pendingBookings: pending, approvedBookings: confirmed, rejectedBookings: 0, cancelledBookings: cancelled }))

        /* Pending bookings become the approval queue */
        const pendingArr = bookings.filter((b) => b.status === 'PENDING').slice(0, 4)
        setApprovals(
          pendingArr.map((b) => ({
            id: b.id,
            name: b.user?.full_name ?? b.user?.email ?? 'Tenant',
            unit: b.property?.title ?? 'Property',
            time: timeAgo(b.created_at),
            initials: initialsOf(b.user),
            approving: false,
            approvalMsg: '',
            approvalMsgClass: '',
          }))
        )
      } catch {
        errCount++
      }

      /* ---- Property stats (occupancy, total/active) ---- */
      try {
        const propsRes = await propertyApi.list({ limit: 100 })
        const props = propsRes?.data?.data?.items ?? propsRes?.data ?? []
        const total = props.length
        const active = props.filter((p) => p.status === 'Active' || p.status === 'AVAILABLE').length
        const rate = total > 0 ? Math.round((active / total) * 100) : 0
        setStats((s) => ({ ...s, totalProperties: total, activeProperties: active, occupancyRate: rate }))

        /* Property summary — top 3 by revenue */
        const top3 = props.filter((p) => p.status === 'Active' || p.status === 'AVAILABLE').slice(0, 3)
        setPropertiesList(top3)
      } catch {
        errCount++
      }

      /* ---- Maintenance stats (open tickets, urgent) ---- */
      try {
        const maintRes = await maintenanceApi.list({ limit: 100 })
        const tickets = maintRes?.data?.data?.items ?? maintRes?.data ?? []
        const open = tickets.filter((m) => m.status === 'OPEN' || m.status === 'IN_PROGRESS').length
        const urgent = tickets.filter((m) => m.priority === 'HIGH').length
        setStats((s) => ({ ...s, openTickets: open, urgentTickets: urgent }))
      } catch {
        errCount++
      }

      /* ---- Revenue stats (dashboard endpoint) ---- */
      try {
        const dashRes = await adminApi.getDashboardStats()
        const dashboardData = dashRes?.data?.data ?? dashRes?.data
        if (dashboardData) {
          setStats((s) => ({ ...s, totalRevenue: dashboardData.totalRevenue ?? 0 }))

          /* Revenue bars from reporting endpoint */
          const revRes = await adminApi.getRevenueReport()
          const revData = revRes?.data?.data ?? revRes?.data
          if (revData && revData.payments) {
            const byMonth = computeRevenueByMonth(revData.payments)
            setRevenueBars(byMonth.slice(0, 9))
          }
        }
      } catch {
        errCount++
      }
    } finally {
      setErrors(errCount)
      setLoading(false)
    }
  }

  async function handleApprove(bookingId, status) {
    /* Mark this approval in-flight */
    setApprovals((prev) =>
      prev.map((a) => (a.id === bookingId ? { ...a, approving: true, approvalMsg: '' } : a))
    );
    try {
      await bookingApi.updateStatus(bookingId, status);
      setApprovals((prev) =>
        prev.map((a) =>
          a.id === bookingId
            ? {
                ...a,
                approving: false,
                approvalMsg: status === 'CONFIRMED' ? '✓ Booking confirmed' : '✗ Booking declined',
                approvalMsgClass: status === 'CONFIRMED' ? 'text-green-600' : 'text-red-600',
              }
            : a
        )
      );
      /* Remove after a short delay */
      setTimeout(() => {
        setApprovals((prev) => prev.filter((a) => a.id !== bookingId));
        setStats((s) => ({
          ...s,
          pendingBookings: Math.max(0, s.pendingBookings - 1),
          approvedBookings: status === 'CONFIRMED' ? s.approvedBookings + 1 : s.approvedBookings,
          rejectedBookings: status === 'CANCELLED' ? s.rejectedBookings + 1 : s.rejectedBookings,
        }));
      }, 1500);
    } catch {
      setApprovals((prev) =>
        prev.map((a) => (a.id === bookingId ? { ...a, approving: false, approvalMsg: 'Failed — try again' } : a))
      );
    }
  }

  return (
    <>
      {/* Page title row */}
      <div className="landlord-page-title-row">
        <div>
          <h1>Portfolio Overview</h1>
          <p>Welcome back. Here is what is happening with your properties today.</p>
        </div>

        <div className="landlord-page-actions">
          <button type="button" className="landlord-export-btn">
            <Download size={20} />
            Export Report
          </button>

          <button
            type="button"
            className="landlord-new-listing-btn"
            onClick={() => navigate(ROUTES.landlord.properties)}
          >
            <Plus size={22} />
            New Listing
          </button>
        </div>
      </div>

      {/* ---- Stats cards ---- */}
      <section className="landlord-stats">
        {loading ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 0' }}>
            <Loader size={32} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
            <p>Loading dashboard...</p>
          </div>
        ) : (
          <>
            {/* Revenue */}
            <div className="landlord-stat-card">
              <div className="landlord-stat-icon purple-soft">
                <WalletCards size={28} />
              </div>
              <span className="growth-pill">↗ real-time</span>
              <p>Total Revenue</p>
              <h3>RM {stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
              <div className="stat-line"><span style={{ width: `${stats.urgentTickets ? 100 : 70}%` }}></span></div>
            </div>

            {/* Occupancy */}
            <div className="landlord-stat-card">
              <div className="landlord-stat-icon blue-soft">
                <Users size={28} />
              </div>
              <span className="growth-pill">{stats.activeProperties}/{stats.totalProperties}</span>
              <p>Occupancy Rate</p>
              <h3>{stats.occupancyRate}%</h3>
              <small>{stats.activeProperties} of {stats.totalProperties} units active</small>
            </div>

            {/* Pending bookings */}
            <div className="landlord-stat-card">
              <div className="landlord-stat-icon blue-soft">
                <Bell size={28} />
              </div>
              <span className="action-pill">{stats.pendingBookings > 0 ? 'Action Required' : 'All Clear'}</span>
              <p>Pending Bookings</p>
              <h3>{stats.pendingBookings + stats.approvedBookings}</h3>
              <small>Waitlist: {stats.pendingBookings} tenants</small>
            </div>

            {/* Tickets */}
            <div className="landlord-stat-card">
              <div className="landlord-stat-icon red-soft">
                <Wrench size={28} />
              </div>
              <span className="priority-pill">{stats.urgentTickets > 0 ? 'High Priority' : 'Normal'}</span>
              <p>Open Tickets</p>
              <h3>{stats.openTickets}</h3>
              <small>{stats.urgentTickets} urgent maintenance</small>
            </div>
          </>
        )}
      </section>

      {/* ---- Revenue chart + Approval queue ---- */}
      <section className="landlord-grid">
        {/* Revenue bar chart */}
        <div className="revenue-panel">
          <div className="panel-title">
            <div>
              <h3>Revenue Growth</h3>
              <p>Comparison of monthly and weekly performance</p>
            </div>
            <button type="button">Last 6 Months</button>
          </div>
          <div className="bar-chart">
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div className="bar-item" key={i}>
                    <div className="bar" style={{ height: '20%', opacity: 0.3 }}></div>
                    <span>...</span>
                  </div>
                ))
              : revenueBars.map((bar) => (
                  <div className="bar-item" key={bar.label}>
                    <div
                      className={bar.active ? 'bar active' : 'bar'}
                      style={{ height: `${bar.height}%` }}
                    ></div>
                    <span>{bar.label}</span>
                  </div>
                ))}
          </div>
        </div>

        {/* Pending approvals from real data */}
        <div className="approval-panel">
          <div className="approval-header">
            <h3>Pending Approvals</h3>
            <span>{approvals.length} New</span>
          </div>
          <div className="approval-list">
            {loading ? (
              <p style={{ color: '#64748b', textAlign: 'center', padding: '24px' }}>Loading...</p>
            ) : !approvals.length ? (
              <p style={{ color: '#64748b', textAlign: 'center', padding: '24px' }}>No pending approvals</p>
            ) : (
              approvals.map((a) => (
                <div className="approval-card" key={a.id}>
                  <div className="approval-avatar">{a.initials}</div>
                  <div className="approval-info">
                    <div>
                      <h4>{a.name}</h4>
                      <span>{a.time}</span>
                    </div>
                    <p>{a.unit}</p>
                    <div className="approval-actions">
                      <button
                        type="button"
                        className="approve-btn"
                        onClick={() => handleApprove(a.id, 'CONFIRMED')}
                        disabled={a.approving !== undefined && a.approving}
                      >
                        {a.approving ? '...' : 'Approve'}
                      </button>
                      <button
                        type="button"
                        className="decline-btn"
                        onClick={() => handleApprove(a.id, 'CANCELLED')}
                        disabled={a.approving !== undefined && a.approving}
                      >
                        {a.approving ? '...' : 'Decline'}
                      </button>
                    </div>
                    <p className={a.approvalMsgClass} style={{ fontSize: '12px', marginTop: 4 }}>
                      {a.approvalMsg}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ---- Property summary from real data ---- */}
      {propertiesList.length > 0 && (
        <section className="property-summary">
          {propertiesList.map((p) => (
            <div className="summary-card" key={p.id}>
              <div className={`summary-image image-one`}></div>
              <div>
                <h3>{p.title}</h3>
                <p>{p.city || p.address || '—'} · {p.status}</p>
              </div>
              <span>RM {(p.rent || 0).toLocaleString()}</span>
            </div>
          ))}
        </section>
      )}

      {/* Error indicator */}
      {errors > 1 && (
        <div style={{ textAlign: 'center', padding: '12px', color: '#f59e0b', fontSize: '13px' }}>
          ⚠ Some dashboard data may be incomplete ({errors}/4 endpoints failed)
        </div>
      )}
    </>
  )
}

/* ---- Helpers ---- */
function initialsOf(user) {
  if (!user) return '??'
  const name = user.full_name ?? user.email ?? ''
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function timeAgo(dateStr) {
  if (!dateStr) return '—'
  const now = new Date()
  const then = new Date(dateStr)
  const diff = (now - then) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function computeRevenueByMonth(payments) {
  if (!payments || !payments.length) return []
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const map = {}
  payments.forEach((p) => {
    const d = new Date(p.paid_at || p.created_at || Date.now())
    const key = months[d.getMonth()]
    map[key] = (map[key] || 0) + (p.amount || 0)
  })
  const max = Math.max(...Object.values(map), 1)
  return Object.entries(map).map(([label, value]) => ({
    label,
    height: Math.max(10, Math.round((value / max) * 100)),
    active: false,
  }))
}

export default LandlordDashboard
