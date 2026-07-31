import { useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/auth';
import { paymentApi } from '../api/payment';
import { bookingApi } from '../api/booking';
import { BarChart, PieChart } from '../components/Charts';

export default function AdminReports() {
  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [report, setReport] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await paymentApi.getPaymentSummary();
      setReport(res.data?.data || {});
    } catch (e) {
      setError(e.message || 'Failed to load reports');
      console.error(e);
    }
    finally { setLoading(false); }
  }, [period]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="page-shell">
      <div className="page-header">
        <h1 className="page-title">Reports</h1>
        <button className="btn btn-primary" onClick={() => window.print()}>Print Report</button>
      </div>

      <div className="card-table">
        {error && <div className="alert alert-danger mt-2">{error} <button className="btn btn-sm" onClick={load}>Retry</button></div>}
        <p>{loading ? 'Generating report…' : 'Report ready.'}</p>
        {report && (
          <div className="report-content">
            <div className="stats-grid">
              <div className="stat-card">
                <h4>Revenue</h4>
                <span className="stat-value">${(report.total || 0).toFixed(2)}</span>
              </div>
              <div className="stat-card"><h4>Pending</h4><span className="stat-value">{report.pending || 0}</span></div>
              <div className="stat-card"><h4>Collected</h4><span className="stat-value">{report.collected || 0}</span></div>
              <div className="stat-card"><h4>Overdue</h4><span className="stat-value">{report.overdue || 0}</span></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}