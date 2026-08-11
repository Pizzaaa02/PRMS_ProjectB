import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../config/routes'
import {
  ArrowUp,
  CalendarDays,
  CheckCircle2,
  Clock,
  Download,
  Heart,
  Home,
  Loader,
  Minus,
  Search,
  SlidersHorizontal,
  WalletCards,
  Wrench,
} from 'lucide-react'
import './TenantDashboard.css'

function TenantDashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    localStorage.setItem('prmsDashboardPath', '/tenant')
    const t = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(t)
  }, [])

  const rentals = [
    {
      name: 'Skyline Tower, Unit 402',
      location: 'Kuala Lumpur',
    },
    {
      name: 'Green Valley Villas, No. 12',
      location: 'Johor Bahru',
    },
  ]

  const savedProperties = [
    {
      name: 'The Grand Atrium',
      location: 'Bukit Bintang, Kuala Lumpur',
      price: 'RM 4,800 / month',
      image:
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop',
    },
    {
      name: 'Azure Heights',
      location: 'Mont Kiara, Kuala Lumpur',
      price: 'RM 3,600 / month',
      image:
        'https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1200&auto=format&fit=crop',
    },
  ]

  const payments = [
    {
      title: 'Rental Payment',
      date: 'October 1st, 2023',
      amount: 'RM 2,500',
      status: 'Due Soon',
    },
    {
      title: 'Maintenance Deposit',
      date: 'September 15th, 2023',
      amount: 'RM 350',
      status: 'Paid',
    },
  ]

  const maintenance = [
    {
      title: 'Air-conditioning Service',
      desc: 'Technician scheduled for tomorrow at 10:00 AM.',
      status: 'In Progress',
      urgent: true,
    },
    {
      title: 'Water Pressure Issue',
      desc: 'Landlord has approved inspection request.',
      status: 'Approved',
      urgent: false,
    },
  ]

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
          <button type="button" className="btn-outline">
            <Wrench size={18} />
            Requests
          </button>
          <button type="button" className="btn-primary-solid">
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
            {/* Next Payment */}
            <KpiCard
              icon={WalletCards}
              iconBg="icon-purple"
              label="Next Payment Due"
              value="RM 2,500"
              sublabel="In 3 Days · October 1st, 2023"
              trend="Due soon"
              trendDir="neutral"
            />

            {/* Active Rentals */}
            <KpiCard
              icon={Home}
              iconBg="icon-blue"
              label="Active Rentals"
              value="2"
              sublabel="Across 2 locations"
              trend="Both active"
              trendDir="up"
            />

            {/* Maintenance */}
            <KpiCard
              icon={Wrench}
              iconBg="icon-rose"
              label="Maintenance"
              value="2 Open"
              sublabel="1 scheduled tomorrow"
              trend="In progress"
              trendDir="neutral"
            />
          </>
        )}
      </section>

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
            onClick={() => navigate(ROUTES.tenant.properties)}
          >
            View All
          </button>
        </div>

        <div className="tenant-rental-list">
          {rentals.map((rental) => (
            <div className="tenant-rental-item" key={rental.name}>
              <div className="tenant-rental-dot" />
              <div>
                <strong>{rental.name}</strong>
                <p>{rental.location}</p>
              </div>
              <span className="status-badge active">Active</span>
            </div>
          ))}
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
          {savedProperties.map((property) => (
            <article className="saved-card" key={property.name}>
              <img src={property.image} alt={property.name} />

              <button type="button" className="heart-btn">
                <Heart size={24} fill="currentColor" />
              </button>

              <div className="saved-overlay">
                <h4>{property.name}</h4>
                <p>{property.location}</p>
                <span>{property.price}</span>
              </div>
            </article>
          ))}
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
            {payments.map((payment) => (
              <div className="payment-item" key={payment.title}>
                <div className="payment-icon-sm">
                  <WalletCards size={22} />
                </div>

                <div className="payment-info">
                  <h4>{payment.title}</h4>
                  <p>
                    <CalendarDays size={12} className="payment-cal-icon" />
                    {payment.date}
                  </p>
                </div>

                <div className="payment-right">
                  <strong>{payment.amount}</strong>
                  <span
                    className={
                      payment.status === 'Paid'
                        ? 'status-badge paid'
                        : 'status-badge pending'
                    }
                  >
                    {payment.status === 'Paid' ? (
                      <CheckCircle2 size={12} />
                    ) : (
                      <Clock size={12} />
                    )}
                    {payment.status}
                  </span>
                </div>
              </div>
            ))}
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
            {maintenance.map((req) => (
              <div className="maintenance-item" key={req.title}>
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
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default TenantDashboard
