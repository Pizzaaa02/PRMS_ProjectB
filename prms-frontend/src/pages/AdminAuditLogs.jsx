import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../api/ApiClient';

const LEVELS = ['info', 'warning', 'error', 'critical'];
const SORT_OPTIONS = [{ value: 'desc', label: 'Newest first' }, { value: 'asc', label: 'Oldest first' }];

export default function AdminAuditLogs() {
  const [tab, setTab] = useState('all');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('desc');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    const params = {};
    params.page = page;
    params.limit = 50;
    params.sort = sort;
    if (tab !== 'all') params.action = tab;
    if (search) params.search = search;
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/audit-logs', { params });
      setLogs(res.data?.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [tab, sort, page, search]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="page-shell">
      <div className="page-header">
        <h1 className="page-title">Audit Logs</h1>
      </div>

      <div className="card-table">
        <div className="filters">
          <input className="input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search logs…" />
          <select className="input" value={sort} onChange={e => setSort(e.target.value)}>
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        <div className="status-filter mt-2">
          <button className={tab === 'all' ? 'active' : ''} onClick={() => setTab('all')}>All</button>
          {LEVELS.map(l => <button key={l} className={tab === l ? 'active' : ''} onClick={() => setTab(l)}>{l.toUpperCase()}</button>)}
        </div>

        {loading ? <p>Loading…</p> : (
          <table className="table mt-2">
            <thead>
              <tr><th>Date</th><th>User</th><th>Action</th><th>Level</th><th>Details</th></tr>
            </thead>
            <tbody>
              {logs.map(l => (
                <tr key={l._id || l.id}>
                  <td>{new Date(l.createdAt || l.created_at).toLocaleString()}</td>
                  <td>{l.user?.full_name ?? l.user?.email ?? '—'}</td>
                  <td>{l.action}</td>
                  <td>{l.level}</td>
                  <td>{l.details}</td>
                </tr>
              ))}
              {!logs.length && <tr><td colSpan={5}>No audit logs.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}