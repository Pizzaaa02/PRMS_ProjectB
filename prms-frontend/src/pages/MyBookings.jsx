import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getImageUrl } from '../config/imageHelper';
import { bookingApi } from '../api/booking';
import { Heart } from 'lucide-react';

const ALL_TABS = ['active', 'upcoming', 'past', 'cancelled'];

export default function MyBookings() {
  const navigate = useNavigate();
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
    } catch (e) { setError(e.message || 'Failed to load bookings'); console.error(e); }
    finally { setLoading(false); }
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="page-shell">
      <div className="page-header">
        <h1 className="page-title">My Bookings</h1>
        <Link to="/properties" className="btn btn-primary">+ Book New Property</Link>
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
        {loading ? <p>Loading...</p> : (
          <div className="property-grid">
            {bookings.map(b => (
              <div key={b._id || b.id} className="property-card" onClick={() => setSelected(b)} style={{ cursor: 'pointer' }}>
                <div className="property-card-header">
                  <img className="property-card-img" src={getImageUrl(b.property?.images?.[0]?.url) || '/placeholder.png'} alt="" />
                  <span className={`status-badge status-${b.status.toLowerCase()}`}>{b.status}</span>
                </div>
                <h3>{b.property?.title || 'Property'}</h3>
                <p>{b.checkIn} → {b.checkOut}</p>
                <p className="price">$ {b.totalAmount ?? b.monthlyRate}</p>
                <div className="card-footer">
                  <span className="btn-text" onClick={e => { e.stopPropagation(); setSelected(b); }}>View Details</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}