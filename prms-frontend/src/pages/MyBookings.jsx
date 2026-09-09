import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../config/imageHelper';
import { bookingApi } from '../api/booking';
import Modal from '../components/Modal';

const ALL_TABS = ['active', 'upcoming', 'past', 'cancelled'];

function formatDate(date) {
  if (!date) return 'N/A';
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? date : parsed.toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatAmount(amount) {
  const value = Number(amount);
  if (Number.isNaN(value)) return amount ? `RM ${amount}` : 'N/A';
  return new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR', minimumFractionDigits: 2 }).format(value);
}

function formatStatus(status) {
  if (!status) return 'Unknown';
  return String(status).replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export default function MyBookings() {
  const [tab, setTab] = useState('active');
  const [bookings, setBookings] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await bookingApi.list({ status: tab === 'past' ? 'completed' : tab });
      setBookings(res.data?.data || []);
    } catch (e) {
      setError(e.response?.data?.message || e.response?.data?.error?.message || e.message || 'Failed to load bookings');
      console.error(e);
      setBookings([]);
    }
    finally { setLoading(false); }
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="page-shell">
      <div className="page-header">
        <h1 className="page-title">My Bookings</h1>
        <Link to="/tenant/properties" className="btn btn-primary">+ Book New Property</Link>
      </div>

      <div className="card-table">
        <div className="status-filter">
          {ALL_TABS.map(t => (
            <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {error && <div className="alert alert-danger mt-2">{error} <button className="btn btn-sm" onClick={load}>Retry</button></div>}
        {loading ? <p>Loading...</p> : bookings.length > 0 ? (
          <div className="property-grid">
            {bookings.map(b => (
              <div key={b._id || b.id} className="property-card" onClick={() => setSelected(b)} style={{ cursor: 'pointer' }}>
                <div className="property-card-header">
                  <img className="property-card-img" src={getImageUrl(b.property?.images?.[0]?.url) || '/placeholder.png'} alt={b.property?.title || 'Booked property'} />
                  <span className={`status-badge status-${(b.status || 'unknown').toLowerCase()}`}>{formatStatus(b.status)}</span>
                </div>
                <h3>{b.property?.title || b.property?.name || 'Property'}</h3>
                <p>{formatDate(b.checkIn || b.check_in)} → {formatDate(b.checkOut || b.check_out)}</p>
                <p className="price">{formatAmount(b.totalAmount ?? b.monthlyRate)}</p>
                <div className="card-footer">
                  <button type="button" className="btn-text" onClick={e => { e.stopPropagation(); setSelected(b); }}>View Details</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bookings-empty-state">
            <p>No bookings found for this category.</p>
            <Link to="/tenant/properties" className="btn btn-primary">Browse Properties</Link>
          </div>
        )}
      </div>

      {selected && (
        <Modal
          isOpen={!!selected}
          onOpenChange={open => { if (!open) setSelected(null); }}
          title="Booking Details"
          footer={<button type="button" className="btn btn-outline" onClick={() => setSelected(null)}>Close</button>}
        >
          <p><strong>Property:</strong> {selected.property?.title || selected.property?.name || 'N/A'}</p>
          <p><strong>Status:</strong> {formatStatus(selected.status)}</p>
          <p><strong>Check In:</strong> {formatDate(selected.checkIn || selected.check_in)}</p>
          <p><strong>Check Out:</strong> {formatDate(selected.checkOut || selected.check_out)}</p>
          <p><strong>Amount:</strong> {formatAmount(selected.totalAmount ?? selected.monthlyRate)}</p>
        </Modal>
      )}
    </div>
  );
}
