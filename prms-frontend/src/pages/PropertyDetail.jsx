import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  CalendarDays,
  ChevronDown,
  Globe2,
  Heart,
  Home,
  Loader2,
  MapPin,
  Menu,
  ShieldCheck,
  Sparkles,
  Star,
  UserCircle,
  Users,
  Building2,
  Wifi,
  Droplets,
  Utensils,
  Dumbbell,
  Car,
  ParkingCircle,
  Tv,
  Fan,
  CheckCircle2,
  X,
  Check,
  Clock,
} from 'lucide-react';
import { propertyApi } from '../api';
import { useAuth } from '../contexts/AuthContext';
import AvailabilityCalendar from '../components/AvailabilityCalendar';
import TenantBookingModal from '../components/TenantBookingModal';
import './PropertyDetail.css';

function amenityIcon(name) {
  const lower = (name || '').toLowerCase();
  if (lower.includes('wifi') || lower.includes('internet')) return <Wifi size={16} />;
  if (lower.includes('water') || lower.includes('utilities')) return <Droplets size={16} />;
  if (lower.includes('kitchen') || lower.includes('cooking')) return <Utensils size={16} />;
  if (lower.includes('gym') || lower.includes('fitness') || lower.includes('workout')) return <Dumbbell size={16} />;
  if (lower.includes('parking') || lower.includes('car')) return <ParkingCircle size={16} />;
  if (lower.includes('tv') || lower.includes('streaming')) return <Tv size={16} />;
  if (lower.includes('cooling') || lower.includes('ac') || lower.includes('aircond')) return <Fan size={16} />;
  return <CheckCircle2 size={16} />;
}

/**
 * Booking status badge with status-specific icon and colour
 */
function BookingStatusBadge({ status }) {
  const config = {
    PENDING:    { text: 'Pending',    icon: Clock,  color: '#f59e0b' },
    CONFIRMED:  { text: 'Confirmed',  icon: Check,  color: '#22c55e' },
    CHECKED_IN: { text: 'Checked In', icon: Check,  color: '#3b82f6' },
    CHECKED_OUT:{ text: 'Checked Out',icon: Check,  color: '#6b7280' },
    CANCELLED:  { text: 'Cancelled',  icon: X,      color: '#ef4444' },
  };
  const { text, icon: Ic, color } = config[status] || config.PENDING;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color, fontWeight: 600 }}>
      <Ic size={16} />
      {text}
    </span>
  );
}

function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liked, setLiked] = useState(false);

  /* Booking modal state */
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchProperty() {
      try {
        const res = await propertyApi.getById(id);
        if (!cancelled && res?.data) {
          setProperty(res.data.data);
        }
        setLoading(false);
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.error?.message || 'Failed to load property');
          setLoading(false);
        }
      }
    }
    fetchProperty();
    return () => { cancelled = true; };
  }, [id]);

  /* ---- Booking button handler ---- */
  function handleBookClick() {
    if (property.status === 'OCCUPIED' || property.status === 'MAINTENANCE') return;
    if (!isAuthenticated) {
      navigate('/login', { state: { fromProperty: id } });
      return;
    }
    setShowBookingModal(true);
  }

  /* Compute minimum start_date as today */
  const todayStr = new Date().toISOString().slice(0, 10);

  /* Placeholder booked dates */
  const placeholderBookedDates = [
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-03`,
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-07`,
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-12`,
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-14`,
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-15`,
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-20`,
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-21`,
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-22`,
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-28`,
  ];

  if (loading) {
    return (
      <main className="property-detail-page">
        <div className="property-detail-loading">
          <Loader2 size={32} className="spin" />
          <p>Loading property details...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="property-detail-page">
        <div className="property-detail-error">
          <p>{error}</p>
          <button onClick={() => navigate(-1)}>Go Back</button>
        </div>
      </main>
    );
  }

  if (!property) {
    return (
      <main className="property-detail-page">
        <div className="property-detail-error">
          <p>Property not found</p>
          <button onClick={() => navigate(-1)}>Go Back</button>
        </div>
      </main>
    );
  }

  const firstImage = property.images?.[0]?.url || '';
  /* Format rent as currency */
  const rentFormatted = new Intl.NumberFormat('ms-MY', {
    style: 'currency',
    currency: 'MYR',
    minimumFractionDigits: 0,
  }).format(property.rent);

  /* Format status for display */
  const statusBadges = {
    AVAILABLE: { text: 'Available now', color: '#3C9B4D' },
    OCCUPIED: { text: 'Currently occupied', color: '#F29F05' },
    MAINTENANCE: { text: 'Under maintenance', color: '#D8554F' },
  };
  const badge = statusBadges[property.status] || statusBadges.AVAILABLE;

  return (
    <main className="property-detail-page">
      <header className="guest-properties-navbar">
        <Link to="/" className="guest-properties-logo">
          <ArrowLeft size={18} />
          PRMS
        </Link>

        <nav className="guest-properties-tabs">
          <Link to="/properties" className="active">
            <Home size={22} />
            Homes
          </Link>
          <button type="button">
            <Sparkles size={22} />
            Experiences
          </button>
          <button type="button">
            <Building2 size={22} />
            Services
          </button>
        </nav>

        <div className="guest-properties-actions">
          <Link to="/register">Become a host</Link>
          <button type="button" className="circle-btn">
            <Globe2 size={21} />
          </button>
          <div className="guest-user-menu">
            <button type="button" className="menu-btn">
              <Menu size={22} />
              <UserCircle size={28} />
            </button>
            <div className="guest-menu-dropdown">
              <Link to="/register">Join now</Link>
              <Link to="/login">Log in</Link>
              <span></span>
              <a href="#">Help Center</a>
            </div>
          </div>
        </div>
      </header>

      <motion.div
        className="property-detail-content"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Hero image */}
        <div className="property-hero">
          {firstImage ? (
            <img src={firstImage} alt={property.title} />
          ) : (
            <div className="property-hero-placeholder">
              <Building2 size={56} />
            </div>
          )}
          <button
            type="button"
            className="property-heart-btn"
            onClick={() => setLiked(!liked)}
          >
            <Heart size={20} fill={liked ? '#D82A2A' : 'none'} stroke="#D82A2A" />
          </button>
        </div>

        {/* Property info */}
        <div className="property-info">
          <div className="property-info-main">
            <div>
              <h1>{property.title}</h1>
              <p className="property-location">
                <MapPin size={16} />
                {property.city && <span>{property.city}, {property.state}</span>}
                {!property.city && <span>{property.address}</span>}
              </p>
              <div className="property-status" style={{ color: badge.color }}>
                <ShieldCheck size={14} />
                {badge.text}
              </div>
            </div>
            <div className="property-price">
              <span className="price-amount">{rentFormatted} / month</span>
            </div>
          </div>

          {/* Details card */}
          <div className="property-details-card">
            <div className="property-detail-row">
              <Users size={18} />
              <span>{property.property_type || 'Apartment'}</span>
            </div>
            <p className="property-address-detail">{property.address}</p>

            {/* Amenities */}
            {property.amenities?.length > 0 && (
              <div className="property-amenities-section">
                <h3>Amenities</h3>
                <div className="property-amenities-grid">
                  {property.amenities.map((a) => (
                    <div key={a.id} className="property-amenity-item">
                      {amenityIcon(a.name)}
                      <span>{a.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional images gallery */}
            {property.images?.length > 1 && (
              <div className="property-images-section">
                <h3>More photos</h3>
                <div className="property-images-grid">
                  {property.images.slice(1).map((img) => (
                    <img key={img.id} src={img.url} alt="" />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action button */}
          <AvailabilityCalendar
            bookedDates={placeholderBookedDates}
            month={new Date()}
          />
          <div className="property-action-bar">
            <motion.button
              type="button"
              className="book-now-btn"
              onClick={handleBookClick}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              disabled={property.status === 'OCCUPIED' || property.status === 'MAINTENANCE'}
            >
              <CalendarDays size={20} />
              {property.status === 'AVAILABLE' || property.status === 'available'
                ? 'Check availability'
                : badge.text}
            </motion.button>
            <p className="property-action-hint">
              Not sure yet? <Link to="/properties">Browse all properties</Link>
            </p>
          </div>
        </div>
      </motion.div>

      {/* ========== BOOKING MODAL ========== */}
      <TenantBookingModal
        property={property}
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
      />
    </main>
  );
}

export default PropertyDetail;
