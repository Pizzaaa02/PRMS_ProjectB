import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../config/routes'
import { Heart, Home, WalletCards, Wrench } from 'lucide-react'
import './TenantDashboard.css'

function TenantDashboard() {
  const navigate = useNavigate()

  useEffect(() => {
    localStorage.setItem('prmsDashboardPath', '/tenant')
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

  return (
    <>
      <section className="tenant-welcome">
        <h1>Welcome back, Alex!</h1>
        <p>Here&apos;s what&apos;s happening with your rentals today.</p>
      </section>

      <section className="tenant-overview-grid">
        <div className="payment-due-card">
          <div className="payment-card-icon">
            <WalletCards size={76} />
          </div>

          <p>Next Payment Due</p>

          <div className="payment-amount-row">
            <h3>RM 2500</h3>
            <span>In 3 Days</span>
          </div>

          <p className="due-date">Due Date: October 1st, 2023</p>

          <div className="payment-line"></div>

          <button type="button" onClick={() => navigate(ROUTES.tenant.payments)}>
            View Breakdown
          </button>

          <div className="payment-progress">
            <span></span>
          </div>
        </div>

        <div className="active-rentals-card">
          <div className="home-badge">
            <Home size={38} />
          </div>

          <p>Active Rentals</p>
          <h3>02</h3>

          <div className="rental-list">
            {rentals.map((rental) => (
              <div className="rental-item" key={rental.name}>
                <div>
                  <span></span>
                  <strong>{rental.name}</strong>
                </div>

                <p>{rental.location}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="saved-panel">
        <div className="saved-header">
          <h3>Saved Properties</h3>
          <button type="button" onClick={() => navigate(ROUTES.tenant.properties)}>
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

      <section className="tenant-bottom-grid">
        <div className="payment-history-panel">
          <div className="panel-title-row">
            <h3>Payment Activity</h3>
            <button type="button" onClick={() => navigate(ROUTES.tenant.payments)}>
              See All
            </button>
          </div>

          <div className="payment-list">
            {payments.map((payment) => (
              <div className="payment-item" key={payment.title}>
                <div className="payment-icon-small">
                  <WalletCards size={22} />
                </div>

                <div>
                  <h4>{payment.title}</h4>
                  <p>{payment.date}</p>
                </div>

                <div className="payment-right">
                  <strong>{payment.amount}</strong>
                  <span className={payment.status === 'Paid' ? 'paid' : 'due'}>
                    {payment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="maintenance-panel">
          <div className="panel-title-row">
            <h3>Maintenance Updates</h3>
            <button type="button" onClick={() => navigate(ROUTES.tenant.maintenance)}>
              New Request
            </button>
          </div>

          <div className="maintenance-card">
            <div className="maintenance-icon">
              <Wrench size={28} />
            </div>

            <div>
              <h4>Air-conditioning Service</h4>
              <p>Technician scheduled for tomorrow at 10:00 AM.</p>
              <span>In Progress</span>
            </div>
          </div>

          <div className="maintenance-card">
            <div className="maintenance-icon soft">
              <Wrench size={28} />
            </div>

            <div>
              <h4>Water Pressure Issue</h4>
              <p>Landlord has approved inspection request.</p>
              <span>Approved</span>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default TenantDashboard