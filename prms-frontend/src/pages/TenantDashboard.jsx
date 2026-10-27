import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../config/routes'
import { bookingApi } from '../api/booking'
import { favoritesApi } from '../api/favorites'
import { maintenanceApi } from '../api/maintenance'
import { paymentApi } from '../api/payment'
import { getImageUrl } from '../config/imageHelper'
import {
  ArrowUp,
  CheckCircle2,
  Clock,
  Heart,
  Home,
  Minus,
  WalletCards,
  Wrench,
} from 'lucide-react'
import './TenantDashboard.css'

function formatAmount(amount) {
  const value = Number(amount)
  if (Number.isNaN(value)) return 'N/A'
  return new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR', minimumFractionDigits: 0 }).format(value)
}

function isActiveBooking(b) {
  const status = (b.status || '').toUpperCase()
  if (status === 'CHECKED_IN') return true
  if (status !== 'CONFIRMED') return false
  const now = new Date()
  const start = new Date(b.start_date)
  const end = new Date(b.end_date)
  return !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && start <= now && now <= end
}

/* ---- KPI Card helper ---- */
function KpiCard({ icon: Icon, iconBg, label, value, sublabel, trend, trendDir }) {
  const TrendIcon =
    trendDir === 'up' ? (
      <ArrowUp size={14} className="text-status-success" />
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
          <span className={`trend-pill ${trendDir === 'up' ? 'positive' : 'neutral'}`}>
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

function TenantDashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [rentals, setRentals] = useState([])
  const [savedProperties, setSavedProperties] = useState([])
  const [maintenance, setMaintenance] = useState([])
  const [recentPayments, setRecentPayments] = useState([])
  const [nextPayment, setNextPayment] = useState(null)
  const [dataError, setDataError] = useState('')

  useEffect(() => {
    localStorage.setItem('prmsDashboardPath', '/tenant')

    let cancelled = false

    async function loadDashboardData() {
      try {
        const [bookingsRes, favoritesRes, ticketsRes, paymentsRes] = await Promise.all([
          bookingApi.myBookings(),
          favoritesApi.getMyFavorites(),
          maintenanceApi.myTickets({ limit: 5 }),
          paymentApi.myPayments({ limit: 10 }),
        ])
        if (cancelled) return

        const payments = paymentsRes.data?.data || []
        setRecentPayments(payments.slice(0, 4))
        const nextDue = payments.find((p) =>
          ['PENDING', 'UNPAID'].includes(String(p.status || '').toUpperCase())
        )
        setNextPayment(nextDue || null)

        const bookings = bookingsRes.data?.data || []
        setRentals(
          bookings.filter(isActiveBooking).map((b) => ({
            name: b.property?.title || 'Property',
            location: [b.property?.city, b.property?.state].filter(Boolean).join(', ') || b.property?.address || '',
          }))
        )

        const favorites = favoritesRes.data?.data || []
        setSavedProperties(
          favorites.slice(0, 4).map((f) => ({
            name: f.property?.title || 'Property',
            location: [f.property?.city, f.property?.state].filter(Boolean).join(', ') || f.property?.address || '',
            price: f.property?.rent ? `${formatAmount(f.property.rent)} / month` : '',
            image: getImageUrl(f.property?.images?.[0]?.url) || null,
          }))
        )

        const tickets = ticketsRes.data?.data || []
        setMaintenance(
          tickets.slice(0, 4).map((t) => ({
            title: t.title,
            desc: t.description,
            status: (t.status || '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
            urgent: (t.priority || '').toUpperCase() === 'URGENT' || (t.priority || '').toUpperCase() === 'HIGH',
          }))
        )
      } catch (e) {
        if (!cancelled) {
          console.error('Failed to load dashboard data:', e)
          setDataError('Some dashboard data could not be loaded.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadDashboardData()
    return () => { cancelled = true }
  }, [])

  return (
    <div className="tenant-dashboard-page" data-customize-id="global.content">
      {/* ---- Hero ---- */}
      <div className="landlord-page-title-row">
        <div>
          <h1>
            <span className="material-symbols-outlined brand-icon">apartment</span>
            My Tenancy Hub
          </h1>
          <p>Here&apos;s what&apos;s happening with your rentals today.</p>
        </div>

        <div className="landlord-page-actions">
          <button type="button" className="btn-outline" onClick={() => navigate(ROUTES.tenant.maintenance)}>
            <Wrench size={18} />
            Requests
          </button>
          <button type="button" className="btn-primary-solid" onClick={() => navigate(ROUTES.tenant.payments)}>
            <WalletCards size={18} />
            Pay Now
          </button>
        </div>
      </div>

      {/* ---- KPI Cards ---- */}
      <section className="kpi-card-grid">
        {loading ? (
          <>
            {[1, 2, 3].map((n) => (
              <div key={n} className="kpi-card kpi-skeleton">
                <div className="skeleton-line skeleton-sm" />
                <div className="skeleton-line skeleton-lg" />
                <div className="skeleton-line skeleton-xs" />
              </div>
            ))}
          </>
        ) : (
          <>
            {/* Next Payment Due KPI */}
            <KpiCard
              icon={WalletCards}
              iconBg="icon-purple"
              label="Next Payment Due"
              value={nextPayment ? `RM ${Number(nextPayment.amount).toFixed(2)}` : '—'}
              sublabel={
                nextPayment
                  ? `Due ${new Date(nextPayment.due_date).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}`
                  : 'No outstanding payments'
              }
              trend={nextPayment ? 'Due soon' : null}
              trendDir="neutral"
            />

            {/* Active Rentals */}
            <KpiCard
              icon={Home}
              iconBg="icon-blue"
              label="Active Rentals"
              value={String(rentals.length)}
              sublabel={rentals.length ? `Across ${new Set(rentals.map((r) => r.location)).size} location${new Set(rentals.map((r) => r.location)).size === 1 ? '' : 's'}` : 'No active rentals'}
              trend={rentals.length ? 'Active' : null}
              trendDir="up"
            />

            {/* Maintenance */}
            <KpiCard
              icon={Wrench}
              iconBg="icon-rose"
              label="Maintenance"
              value={`${maintenance.length} Open`}
              sublabel={maintenance.some((m) => m.urgent) ? 'Urgent request open' : maintenance.length ? 'All routine' : 'No open requests'}
              trend={maintenance.length ? 'In progress' : null}
              trendDir="neutral"
            />
          </>
        )}
      </section>

      {dataError && (
        <div className="alert alert-danger mt-2">{dataError}</div>
      )}

      {/* ---- Active Rentals panel ---- */}
      <section className="panel-card">
        <div className="panel-title">
          <div>
            <h3 className="panel-title-text">Active Rentals</h3>
            <p className="panel-subtitle">Your current lease agreements</p>
          </div>
          <button
            type="button"
            className="btn-outline-sm"
            onClick={() => navigate(ROUTES.tenant.bookings)}
          >
            View All
          </button>
        </div>

        <div className="tenant-rental-list">
          {rentals.length ? rentals.map((rental, i) => (
            <div className="tenant-rental-item" key={`${rental.name}-${i}`}>
              <div className="tenant-rental-dot" />
              <div>
                <strong>{rental.name}</strong>
                <p>{rental.location}</p>
              </div>
              <span className="status-badge active">Active</span>
            </div>
          )) : (
            <p className="panel-subtitle">No active rentals right now.</p>
          )}
        </div>
      </section>

      {/* ---- Saved Properties ---- */}
      <section className="saved-panel">
        <div className="saved-header">
          <div>
            <h3 className="panel-title-text">Saved Properties</h3>
            <p className="panel-subtitle">Properties you have on your watchlist</p>
          </div>
          <button
            type="button"
            className="btn-outline-sm"
            onClick={() => navigate(ROUTES.tenant.properties)}
          >
            View All
          </button>
        </div>

        <div className="saved-grid">
          {savedProperties.length ? savedProperties.map((property, i) => (
            <article className="saved-card" key={`${property.name}-${i}`}>
              {property.image && <img src={property.image} alt={property.name} />}

              <button type="button" className="heart-btn">
                <Heart size={24} fill="currentColor" />
              </button>

              <div className="saved-overlay">
                <h4>{property.name}</h4>
                <p>{property.location}</p>
                <span>{property.price}</span>
              </div>
            </article>
          )) : (
            <p className="panel-subtitle">No saved properties yet.</p>
          )}
        </div>
      </section>

      {/* ---- Bottom grid: Payments + Maintenance ---- */}
      <section className="dashboard-main-grid">
        {/* Payment history */}
        <div className="panel-card">
          <div className="panel-title">
            <div>
              <h3 className="panel-title-text">Payment Activity</h3>
              <p className="panel-subtitle">Recent transactions and upcoming dues</p>
            </div>
            <button
              type="button"
              className="btn-outline-sm"
              onClick={() => navigate(ROUTES.tenant.payments)}
            >
              See All
            </button>
          </div>

          <div className="payment-list">
            {recentPayments.length > 0 ? (
              recentPayments.map((p) => {
                const isPaid = String(p.status || '').toUpperCase() === 'PAID'
                const title = p.booking?.property?.title || p.booking?.property?.address || 'Property Payment'
                return (
                  <div
                    className="payment-item"
                    key={p.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/tenant/payments/${p.id}`)}
                    title="Click to view payment receipt and details"
                  >
                    <div className="payment-icon-sm">
                      <WalletCards size={20} />
                    </div>
                    <div className="payment-info">
                      <h4>{title}</h4>
                      <p>
                        {isPaid && p.paid_at
                          ? `Paid on ${new Date(p.paid_at).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}`
                          : `Due on ${new Date(p.due_date).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                      </p>
                    </div>
                    <div className="payment-right">
                      <strong>RM {Number(p.amount).toFixed(2)}</strong>
                      <span className={`status-badge ${isPaid ? 'active' : 'pending'}`}>
                        {isPaid ? 'Paid' : 'Due'}
                      </span>
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="panel-subtitle">No payments found yet. Visit Payments for full transaction history.</p>
            )}
          </div>
        </div>

        {/* Maintenance */}
        <div className="panel-card">
          <div className="panel-title">
            <div>
              <h3 className="panel-title-text">Maintenance Updates</h3>
              <p className="panel-subtitle">Open work orders and repair status</p>
            </div>
            <button
              type="button"
              className="btn-primary-sm"
              onClick={() => navigate(ROUTES.tenant.maintenance)}
            >
              <Wrench size={16} />
              New Request
            </button>
          </div>

          <div className="maintenance-list">
            {maintenance.length ? maintenance.map((req, i) => (
              <div className="maintenance-item" key={`${req.title}-${i}`}>
                <div className={`maintenance-icon ${req.urgent ? 'urgent' : 'soft'}`}>
                  <Wrench size={22} />
                </div>

                <div className="maintenance-info">
                  <h4>{req.title}</h4>
                  <p>{req.desc}</p>
                  <span className={`status-badge ${req.urgent ? 'pending' : 'active'}`}>
                    {req.urgent ? (
                      <Clock size={12} />
                    ) : (
                      <CheckCircle2 size={12} />
                    )}
                    {req.status}
                  </span>
                </div>
              </div>
            )) : (
              <p className="panel-subtitle">No maintenance requests open.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

export default TenantDashboard
