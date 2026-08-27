import { useEffect, useState } from 'react'
import {
  Building2,
  CalendarDays,
  CircleHelp,
  FileText,
  MessageCircle,
  Search,
  ShieldCheck,
  Users,
  WalletCards,
  Wrench,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { userApi } from '../api/user'
import { propertyApi } from '../api/property'
import { bookingApi } from '../api/booking'
import { paymentApi } from '../api/payment'
import { maintenanceApi } from '../api/maintenance'
import { adminApi } from '../api/admin'
import './AdminSimplePage.css'

const subPages = {
  users: {
    title: 'User Management',
    subtitle: 'Manage tenants, landlords, admins, account status, and KYC verification.',
    icon: Users,
    primaryBtn: 'Add User',
    cardLabels: ['Total Users', 'Tenants', 'Landlords', 'Active'],
    columns: ['User', 'Role', 'KYC Status', 'Account Status', 'Action'],
    renderRow: (u) => [
      u.full_name || u.email || '—',
      u.role || '—',
      u.is_kyc_verified != null ? (u.is_kyc_verified ? 'Verified' : 'Pending') : '—',
      u.is_active != null ? (u.is_active ? 'Active' : 'Suspended') : 'Active',
      'View',
    ],
  },
  properties: {
    title: 'Property Management',
    subtitle: 'Review listings, approve properties, monitor flagged units, and manage visibility.',
    icon: Building2,
    primaryBtn: 'Review All',
    cardLabels: ['Total Properties', 'Active Listings', 'Pending Approval', 'Flagged'],
    columns: ['Property', 'Owner', 'Location', 'Rent', 'Action'],
    renderRow: (p) => [
      p.title || '—',
      p.landlordId ? 'Landlord' : '—',
      p.city || '—',
      typeof p.monthly_rent === 'number' ? 'RM ' + p.monthly_rent.toLocaleString() : (p.rent || '—'),
      p.status === 'Pending' ? 'Approve' : 'View',
    ],
  },
  bookings: {
    title: 'Booking Management',
    subtitle: 'Monitor rental bookings, approvals, cancellations, and disputes.',
    icon: CalendarDays,
    primaryBtn: 'Review',
    cardLabels: ['Total Bookings', 'Pending', 'Approved', 'Disputed'],
    columns: ['Tenant', 'Property', 'Landlord', 'Status', 'Action'],
    renderRow: (b) => [
      b.tenantId ? 'Tenant' : '—',
      b.propertyTitle || b.propertyId ? 'Property' : '—',
      b.landlordId ? 'Landlord' : '—',
      b.status,
      b.status === 'Pending' ? 'Review' : 'View',
    ],
  },
  finance: {
    title: 'Finance Console',
    subtitle: 'Track platform revenue, payment activity, refunds, and failed transactions.',
    icon: WalletCards,
    primaryBtn: 'Export Report',
    cardLabels: ['Transaction Volume', 'Platform Revenue', 'Pending Payments', 'Failed Payments'],
    columns: ['Transaction ID', 'User', 'Amount', 'Status', 'Action'],
    renderRow: (p) => [
      p.id ? 'TXN-' + p.id.slice(-4) : (p.reference || '—'),
      p.tenantId ? 'Tenant' : '—',
      typeof p.amount === 'number' ? 'RM ' + p.amount.toLocaleString() : p.amount || '—',
      p.status,
      p.status === 'Pending' ? 'Review' : 'View',
    ],
  },
  maintenance: {
    title: 'Maintenance Center',
    subtitle: 'Track maintenance tickets, priorities, progress, and assigned staff.',
    icon: Wrench,
    primaryBtn: 'Assign',
    cardLabels: ['Open Tickets', 'High Priority', 'In Progress', 'Completed'],
    columns: ['Ticket', 'Property', 'Issue', 'Priority', 'Action'],
    renderRow: (m) => [
      m.id ? 'TCK-' + m.id.slice(-4) : '—',
      m.propertyTitle || m.propertyId ? m.propertyTitle || 'Property' : '—',
      m.issue || m.description || '—',
      m.priority || 'MEDIUM',
      m.status === 'OPEN' ? 'Assign' : 'View',
    ],
  },
  messages: {
    title: 'Admin Messages',
    subtitle: 'Monitor support messages, disputes, reports, and system announcements.',
    icon: MessageCircle,
    primaryBtn: 'Reply',
    cardLabels: ['Unread Messages', 'Open Disputes', 'Support Threads', 'Total'],
    columns: ['Conversation', 'Participants', 'Category', 'Status', 'Action'],
    renderRow: (n) => [
      n.title || 'Notification',
      'Admin',
      n.type || 'General',
      n.isRead ? 'Read' : 'Open',
      n.isRead ? 'View' : 'Review',
    ],
  },
  reports: {
    title: 'Reports & Audit',
    subtitle: 'Review security logs, user activity, transaction reports, and audit events.',
    icon: FileText,
    primaryBtn: 'Export',
    cardLabels: ['Audit Events', 'Security Alerts', 'High Risk', 'Total Events'],
    columns: ['Time', 'Event', 'User', 'Risk Level', 'Action'],
    renderRow: (log) => {
      const time = log.created_at ? new Date(log.created_at).toLocaleTimeString() : '—'
      const eventName = log.action || log.type || '—'
      const userName = log.user?.full_name || log.user?.email || (log.userId ? 'User' : 'System')
      const risk = log.entity === 'auth' || log.action?.includes('FAILURE') ? 'High' : 'Low'
      return [time, eventName, userName, risk, 'View']
    },
  },
  settings: {
    title: 'Admin Settings',
    subtitle: 'Manage admin account preferences, notifications, security, and system preferences.',
    icon: ShieldCheck,
    primaryBtn: 'Update',
    cardLabels: ['Security Level', 'Notifications', 'Theme', 'Sessions'],
    columns: ['Setting', 'Category', 'Status', 'Last Updated', 'Action'],
    renderRow: null,
  },
  help: {
    title: 'Admin Help Center',
    subtitle: 'Find support resources, guides, escalation contacts, and troubleshooting steps.',
    icon: CircleHelp,
    primaryBtn: 'Submit',
    cardLabels: ['Open Support Cases', 'Guides', 'Response SLA', 'System Status'],
    columns: ['Topic', 'Category', 'Priority', 'Status', 'Action'],
    renderRow: null,
  },
}

export default function AdminSimplePage({ type = 'users' }) {
  const cfg = subPages[type] || subPages.users
  const Icon = cfg.icon
  const { user, updateProfile } = useAuth()

  const [cards, setCards] = useState(cfg.cardLabels.map((l) => ({ label: l, value: '...' })))
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        if (type === 'users') {
          const { data: resp } = await userApi.list({ limit: 100 })
          let items = resp?.data || resp || []
          // Flatten backend structure: UserRole[0].role.name -> role
          items = items.map((u) => {
            const roleName = u.UserRole?.[0]?.role?.name || u.role || null
            const hasKycDoc = u.kyc_document_url || u.kyc_verified || null
            return { ...u, role: roleName, is_kyc_verified: hasKycDoc }
          })
          setRows(items)
          setCards([
            { label: 'Total Users', value: items.length },
            { label: 'Tenants', value: items.filter((u) => u.role === 'Tenant').length },
            { label: 'Landlords', value: items.filter((u) => u.role === 'Landlord').length },
            { label: 'Active', value: items.filter((u) => u.is_active != null ? u.is_active : true).length },
          ])
        } else if (type === 'properties') {
          const { data } = await propertyApi.list()
          const items = data?.data || data || []
          setRows(items)
          setCards([
            { label: 'Total Properties', value: items.length },
            { label: 'Active Listings', value: items.filter((p) => p.status === 'Active' || p.status === 'Occupied').length },
            { label: 'Pending Approval', value: items.filter((p) => p.status === 'Pending').length },
            { label: 'Flagged', value: items.filter((p) => p.is_flagged).length },
          ])
        } else if (type === 'bookings') {
          const { data } = await bookingApi.list()
          const items = data?.data || data || []
          setRows(items)
          setCards([
            { label: 'Total Bookings', value: items.length },
            { label: 'Pending', value: items.filter((b) => b.status === 'Pending').length },
            { label: 'Approved', value: items.filter((b) => b.status === 'Approved').length },
            { label: 'Disputed', value: items.filter((b) => b.status === 'Disputed' || b.status === 'Flagged').length },
          ])
        } else if (type === 'finance') {
          const { data } = await paymentApi.list()
          const items = data?.data || data || []
          setRows(items)
          const total = items.reduce((s, p) => s + (p.amount || 0), 0)
          setCards([
            { label: 'Transaction Volume', value: 'RM ' + total.toLocaleString() },
            { label: 'Platform Revenue', value: '—' },
            { label: 'Pending Payments', value: items.filter((p) => p.status === 'Pending').length },
            { label: 'Failed Payments', value: items.filter((p) => p.status === 'Failed').length },
          ])
        } else if (type === 'maintenance') {
          const { data } = await maintenanceApi.list()
          const items = data?.data || data || []
          setRows(items)
          setCards([
            { label: 'Open Tickets', value: items.filter((m) => m.status === 'OPEN').length },
            { label: 'High Priority', value: items.filter((m) => m.priority === 'HIGH' || m.priority === 'URGENT').length },
            { label: 'In Progress', value: items.filter((m) => m.status === 'IN_PROGRESS').length },
            { label: 'Completed', value: items.filter((m) => m.status === 'RESOLVED' || m.status === 'CLOSED').length },
          ])
        } else if (type === 'messages') {
          const { data } = await adminApi.getNotifications()
          const items = data?.data || data || []
          setRows(items)
          const unread = items.filter((n) => !n.isRead).length
          setCards([
            { label: 'Unread Messages', value: unread },
            { label: 'Open Disputes', value: items.filter((n) => n.type === 'dispute').length },
            { label: 'Support Threads', value: items.filter((n) => n.type === 'support').length },
            { label: 'Total', value: items.length },
          ])
        } else if (type === 'reports') {
          const { data } = await adminApi.getAuditLogs()
          const items = data?.data || data || []
          setRows(items)
          const highRisk = items.filter((l) => l.action?.includes('FAILURE') || l.entity === 'auth').length
          setCards([
            { label: 'Audit Events', value: items.length },
            { label: 'Security Alerts', value: highRisk },
            { label: 'High Risk', value: highRisk },
            { label: 'Total Events', value: items.length },
          ])
        } else if (type === 'settings') {
          let sysSettings = []
          try {
            const { data } = await adminApi.getSettings()
            sysSettings = data?.data || data || []
          } catch { /* best effort */ }
          setCards([
            { label: 'Security Level', value: 'Secure' },
            { label: 'Notifications', value: 'Enabled' },
            { label: 'Theme', value: 'Default' },
            { label: 'Sessions', value: '3' },
          ])
          const settingsRows = sysSettings.length
            ? sysSettings.map((s) => [s.key, s.category || 'General', 'Active', '—', 'Edit'])
            : [
                ['Account Profile', 'Account', 'Active', new Date().toLocaleDateString(), 'Manage'],
                ['Login Verification', 'Security', 'Enabled', 'Today', 'Manage'],
                ['System Theme', 'Preference', 'Default', 'Today', 'Manage'],
              ]
          setRows(settingsRows)
        } else if (type === 'help') {
          setCards([
            { label: 'Open Support Cases', value: '0' },
            { label: 'Guides', value: '18' },
            { label: 'Response SLA', value: '2h' },
            { label: 'System Status', value: 'Online' },
          ])
          setRows([
            ['User verification issue', 'KYC', 'Medium', 'Open', 'View'],
            ['Payment dispute flow', 'Finance', 'High', 'Open', 'Review'],
            ['Property approval guide', 'Properties', 'Low', 'Available', 'Open'],
          ])
        }
      } catch (e) {
        setError(e.message || 'Failed to load data')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [type, user])

  const handlePrimaryBtn = async () => {
    if (type === 'settings') {
      const name = prompt('Full name:', user?.full_name)
      const phone = prompt('Phone:', user?.phone)
      if (name || phone) {
        try {
          await updateProfile({ full_name: name, phone })
        } catch (e) {
          alert('Failed: ' + e.message)
        }
      }
    }
  }

  return (
    <>
      <section className="admin-simple-hero">
        <div>
          <h1>{cfg.title}</h1>
          <p>{cfg.subtitle}</p>
        </div>
        {type === 'settings' && (
          <button type="button" className="admin-simple-primary-btn" onClick={handlePrimaryBtn}>
            {cfg.primaryBtn}
          </button>
        )}
      </section>

      <section className="admin-simple-cards">
        {cards.map((card) => (
          <article className="admin-simple-card" key={card.label}>
            <div className="admin-simple-icon">
              <Icon size={26} />
            </div>
            <p>{card.label}</p>
            <h3>{card.value}</h3>
          </article>
        ))}
      </section>

      <section className="admin-simple-table-card">
        <div className="admin-simple-table-header">
          <h2>{cfg.title}</h2>
          <div className="admin-simple-search">
            <Search size={17} />
            <input type="text" placeholder="Search records..." />
          </div>
        </div>

        {error && <p style={{ color: 'red', padding: 12 }}>{error}</p>}

        {loading ? (
          <div className="admin-simple-table">
            <div className="admin-simple-table-head">Loading...</div>
          </div>
        ) : (
          <div className="admin-simple-table">
            <div
              className="admin-simple-table-head"
              style={{ gridTemplateColumns: `repeat(${cfg.columns.length}, 1fr)` }}
            >
              {cfg.columns.map((col) => (
                <p key={col}>{col}</p>
              ))}
            </div>

            {rows.length === 0 && (
              <div className="admin-simple-table-row">
                <div style={{ gridColumn: `1 / ${cfg.columns.length + 1}`, textAlign: 'center', padding: 20 }}>
                  No records found
                </div>
              </div>
            )}

            {rows.map((row, i) => {
              const cells = cfg.renderRow ? cfg.renderRow(row, i) : row
              if (!cells) return null
              return (
                <div
                  className="admin-simple-table-row"
                  style={{ gridTemplateColumns: `repeat(${cfg.columns.length}, 1fr)` }}
                  key={row.id || i}
                >
                  {cells.map((cell, ci) => (
                    <div key={`${ci}-${row.id || i}`}>
                      {ci === cells.length - 1 ? (
                        <button type="button" disabled title="Not yet available">{cell}</button>
                      ) : (
                        <span>{cell}</span>
                      )}
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        )}
      </section>
    </>
  )
}
