import { useState, useEffect } from 'react'
import { useNavigate, useOutletContext, Link as RouterLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { motion } from 'framer-motion'
import { buildNavItems } from '../components/NavigationConfig'
import './Properties.css'
import {
  Building2,
  MapPin,
  DollarSign,
  Search,
  Filter,
  Home,
  Store,
  Briefcase,
  Plus,
  RotateCw,
  Grid3x3,
  List,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { propertyApi, getApiError } from '../api'
import { ROUTES, getAddPropertyRoute, getPropertyDetailPath } from '../config/routes'

const PROPERTY_TYPES = [
  { key: 'all', label: 'All Types', icon: Building2 },
  { key: 'Residential', label: 'Residential', icon: Home },
  { key: 'Commercial', label: 'Commercial', icon: Briefcase },
  { key: 'Retail', label: 'Retail', icon: Store },
]

const STATUS_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'available', label: 'Available' },
  { key: 'occupied', label: 'Occupied' },
  { key: 'maintenance', label: 'Maintenance' },
  { key: 'inactive', label: 'Inactive' },
]

function Properties() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [viewMode, setViewMode] = useState('grid')
  const [activeType, setActiveType] = useState('all')
  const [activeStatus, setActiveStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const perPage = 12

  async function fetchProperties() {
    setLoading(true)
    setError(null)
    try {
      const params = { page: currentPage, limit: perPage }
      if (activeType !== 'all') params.type = activeType
      if (searchTerm.trim()) params.search = searchTerm.trim()

      const { data } = await propertyApi.list(params)
      const list = data.properties || data.data || data
      setProperties(Array.isArray(list) ? list : [])

      const total =
        data.totalCount ?? data.total ?? data.pagination?.total ?? list.length
      setTotalCount(total)
    } catch (err) {
      setError(getApiError(err))
      setProperties([])
    } finally {
      setLoading(false)
    }
  }

   
  useEffect(() => {
    fetchProperties()
  }, [currentPage, activeType, fetchProperties])

  /* Debounced search */
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1)
      fetchProperties()
    }, 400)
    return () => clearTimeout(timer)
  }, [searchTerm, fetchProperties])

  function handleSearch(e) {
    if (e) e.preventDefault()
    setCurrentPage(1)
    fetchProperties()
  }

  const totalPages = Math.max(Math.ceil(totalCount / perPage), 1)

  function statusColor(status) {
    const s = (status || '').toLowerCase()
    if (s === 'available') return 'green'
    if (s === 'pending') return 'yellow'
    if (s === 'rented' || s === 'approved' || s === 'active') return 'blue'
    if (s === 'rejected' || s === 'inactive') return 'red'
    return 'gray'
  }

  /* Client-side status filtering */
  const filteredProperties = properties.filter((p) => {
    if (activeStatus === 'all') return true
    const pStatus = (p.status || '').toLowerCase()
    return pStatus === activeStatus.toLowerCase()
  })

  return (
    <div className="properties-page">
      {/* ── Header ── */}
      <div className="properties-header">
        <div className="properties-title-row">
          <h1>Properties</h1>
          <p>Browse and manage all property listings in your portfolio.</p>
        </div>

        {/* Only Landlord and Admin can add properties */}
        {getAddPropertyRoute(user?.role) && (
          <motion.button
            type="button"
            className="btn-primary"
            onClick={() => {
              const addRoute = getAddPropertyRoute(user?.role);
              if (addRoute) navigate(addRoute);
            }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
          >
            <Plus size={18} /> Add Property
          </motion.button>
        )}
      </div>

      {/* ── Filters ── */}
      <div className="properties-toolbar">
        <form className="properties-search" onSubmit={handleSearch}>
          <Search size={18} />
          <input
            type="text"
            placeholder="Search properties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Filter size={18} className="properties-filter-icon" />
        </form>

        <div className="properties-view-controls">
          <div className="properties-type-filters">
            {PROPERTY_TYPES.map((t) => (
              <button
                type="button"
                key={t.key}
                className={`btn-type ${activeType === t.key ? 'active' : ''}`}
                onClick={() => {
                  setActiveType(t.key)
                  setCurrentPage(1)
                }}
              >
                <t.icon size={16} />
                {t.label}
              </button>
            ))}
          </div>

          <div className="properties-status-filters">
            {STATUS_FILTERS.map((s) => (
              <button
                type="button"
                key={s.key}
                className={`btn-status ${activeStatus === s.key ? 'active' : ''}`}
                onClick={() => {
                  setActiveStatus(s.key)
                  setCurrentPage(1)
                }}
              >
                <span className={`status-dot status-${statusColor(s.key)}`} />
                {s.label}
              </button>
            ))}
          </div>

          <div className="properties-view-toggle">
            <button
              type="button"
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <Grid3x3 size={18} />
            </button>
            <button
              type="button"
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <motion.div className="properties-error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {error}
        </motion.div>
      )}

      {/* ── Loading ── */}
      {loading && (
        <div className="properties-loading">
          <div className="spinner" />
          <p>Loading properties...</p>
        </div>
      )}

      {/* ── Grid / List ── */}
      {!loading && !error && (
        <>
          {filteredProperties.length === 0 ? (
            <div className="properties-empty">
              <Building2 size={56} />
              <h2>No properties found</h2>
              <p>Try adjusting your filters or add a new property.</p>
            </div>
          ) : (
            <>
              {/* Count of filtered results when a filter is active */}
              {(activeStatus !== 'all' || activeType !== 'all' || searchTerm) && (
                <div className="properties-filtered-count">
                  Showing {filteredProperties.length} of {properties.length} properties
                </div>
              )}
              <div className={`properties-${viewMode}`} role="list">
                {filteredProperties.map((p, i) => (
                  <motion.div
                    key={p._id || p.id || i}
                    className="property-item"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.025 }}
                    whileHover={{ y: -4, scale: 1.01 }}
                    onClick={() => navigate(getPropertyDetailPath(user?.role, p._id || p.id))}
                    role="listitem"
                    style={{ cursor: 'pointer' }}
                    tabIndex={0}
                    onKeyPress={(e) => e.key === 'Enter' && navigate(getPropertyDetailPath(user?.role, p._id || p.id))}
                  >
                    {/* Image card (grid) */}
                    <div className="property-card">
                      <div className="property-card-image">
                        {p.image || p.thumbnail ? (
                          <img src={p.image} alt={p.name || p.title} />
                        ) : (
                          <Building2 size={40} />
                        )}
                        <span
                          className={`property-status status-${statusColor(
                            p.status || 'available'
                          )}`}
                        >
                          {p.status || 'Available'}
                        </span>
                      </div>

                      <div className="property-card-body">
                        <h3>{p.name || p.title || 'Property'}</h3>
                        <div className="property-location-row">
                          <MapPin size={14} />
                          <span>
                            {p.location || p.address || 'Location not set'}
                          </span>
                        </div>
                        <div className="property-type-row">
                          <span className="property-type-badge">
                            {p.type || 'General'}
                          </span>
                        </div>
                        <div className="property-bottom-row">
                          <div className="property-price">
                            <DollarSign size={14} />
                            <span>
                              {Number(p.price || p.rent || 0).toLocaleString()}{' '}
                              / mo
                            </span>
                          </div>
                          <div className="property-units">
                            {p.unitCount || p.unit_count || 0} units
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* ── Pagination ── */}
              {totalPages > 1 && (
                <div className="properties-pagination">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((c) => Math.max(c - 1, 1))}
                  >
                    <ChevronLeft size={16} /> Prev
                  </button>

                  <span className="page-info">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() =>
                      setCurrentPage((c) => Math.min(c + 1, totalPages))
                    }
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}

export default Properties
