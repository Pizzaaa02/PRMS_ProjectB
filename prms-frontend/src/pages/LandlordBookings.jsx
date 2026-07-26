import { useState, useEffect, useCallback } from 'react';
import { bookingApi } from '../api/booking';

const ALL_TABS = ['pending', 'confirmed', 'active', 'completed', 'cancelled'];

export default function LandlordBookings() {
  const [tab, setTab] = useState('pending');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await bookingApi.myBookings({ status: tab });
      setBookings(res.data?.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  const approve = async (id) => {
    try { await bookingApi.update(id, { status: 'confirmed' }); load(); } catch (e) { alert(e.response?.data?.message || 'Failed'); }
  };

  const reject = async (id) => {
    try { await bookingApi.update(id, { status: 'cancelled' }); load(); } catch (e) { alert(e.response?.data?.message || 'Failed'); }
  };

  const handleStatusChange = async (id, val) => {
    try { await bookingApi.update(id, { status: val }); load(); } catch (e) { alert(e.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <h1 className="page-title">Bookings</h1>
        <p>Manage tenant requests for your properties.</p>
      </div>

      <div className="card-table">
        <div className="status-filter">
          {ALL_TABS.map(t => (
            <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {loading ? <p>Loading...</p> : (
          <table className="table">
            <thead>
              <tr>
                <th>Tenant</th>
                <th>Property</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b._id || b.id}>
                  <td>{b.tenant?.full_name ?? b.tenant?.email}</td>
                  <td>{b.property?.title}</td>
                  <td>{b.checkIn}</td>
                  <td>{b.checkOut}</td>
                  <td>
                    <span className={`status-badge status-${(b.status||'').toLowerCase()}`}>{b.status}</span>
                  </td>
                  <td>$ {b.totalAmount ?? b.monthlyRate}</td>
                  <td>
                    {b.status === 'pending' && (
                      <>
                        <button className="btn btn-sm btn-primary" onClick={() => approve(b._id || b.id)}>Approve</button>{' '}
                        <button className="btn btn-sm btn-danger" onClick={() => reject(b._id || b.id)}>Reject</button>
                      </>
                    )}
                    {b.status !== 'pending' && b.status !== 'cancelled' && (
                      <select value={(b.status || '')} onChange={e => handleStatusChange(b._id || b.id, e.target.value)} className="badge badge-warning">
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                      </select>
                    )}
                  </td>
                </tr>
              ))}
              {!bookings.length && <tr><td colSpan={7}>No bookings found.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}