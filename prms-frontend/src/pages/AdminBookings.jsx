import { useState, useEffect, useCallback } from 'react';
import { bookingApi } from '../api/booking';

const ALL_TABS = ['pending', 'confirmed', 'active', 'completed', 'cancelled'];

export default function AdminBookings() {
  const [tab, setTab] = useState('pending');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await bookingApi.list({ status: tab, limit: 100 });
      setBookings(res.data?.data || []);
    } catch (e) { setError(e.message || 'Failed to load bookings'); console.error(e); }
    finally { setLoading(false); }
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  const cancel = async (id) => {
    if (!confirm('Cancel this booking?')) return;
    try { await bookingApi.cancel(id); load(); } catch (e) { alert('Failed to cancel'); }
  };

  const exportCsv = () => {
    const header = 'ID,Tenant,Property,Check-in,Check-out,Status,Amount';
    const rows = bookings.map(b =>
      `"${b._id||''}","${b.tenant?.full_name||b.tenant?.email||''}","${b.property?.title||''}","${b.checkIn||''}","${b.checkOut||''}","${b.status||''}","${b.totalAmount||''}"`
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'bookings.csv'; a.click();
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <h1 className="page-title">Admin – Bookings</h1>
        <button className="btn btn-primary" onClick={exportCsv}>Export CSV</button>
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
          <table className="table">
            <thead>
              <tr><th>ID</th><th>Tenant</th><th>Property</th><th>Dates</th><th>Status</th><th>Amount</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b._id || b.id}>
                  <td>{(b._id||'').slice(-6)}</td>
                  <td>{b.tenant?.full_name ?? b.tenant?.email}</td>
                  <td>{b.property?.title}</td>
                  <td>{b.checkIn} → {b.checkOut}</td>
                  <td><span className={`status-badge status-${(b.status||'').toLowerCase()}`}>{b.status}</span></td>
                  <td>$ {b.totalAmount ?? '-'}</td>
                  <td><button className="btn btn-sm btn-danger" onClick={() => cancel(b._id || b.id)}>Cancel</button></td>
                </tr>
              ))}
              {!bookings.length && <tr><td colSpan={7}>No bookings.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}