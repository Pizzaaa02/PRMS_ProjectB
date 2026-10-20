import { useEffect, useState, useMemo } from 'react';
import { bookingApi } from '../api';
import { propertyApi } from '../api';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import './LandlordHeatmap.css';

function LandlordHeatmap() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setError('');
    try {
      // Fetch properties: try landlord's own properties first, or fall back to propertyApi.list
      let propList = [];
      try {
        const pRes = await propertyApi.myProperties();
        const pData = pRes.data?.data;
        propList = Array.isArray(pData) ? pData : (pData?.properties ?? []);
      } catch (_) {}

      // If landlord has no own properties yet, load market properties
      if (!propList || propList.length === 0) {
        try {
          const pRes = await propertyApi.list({ limit: 100 });
          const pData = pRes.data?.data;
          propList = Array.isArray(pData) ? pData : (pData?.properties ?? []);
        } catch (_) {}
      }

      // Fetch bookings: try landlordBookings first, then list, then myBookings
      let bookingList = [];
      try {
        const bRes = await bookingApi.landlordBookings({ limit: 100 });
        const bData = bRes.data?.data;
        bookingList = Array.isArray(bData) ? bData : [];
      } catch (_) {
        try {
          const bRes = await bookingApi.list({ limit: 100 });
          const bData = bRes.data?.data;
          bookingList = Array.isArray(bData) ? bData : [];
        } catch (_) {
          try {
            const bRes = await bookingApi.myBookings();
            const bData = bRes.data?.data;
            bookingList = Array.isArray(bData) ? bData : [];
          } catch (_) {}
        }
      }

      // If no landlord bookings found, also load bookings from bookingApi.list so market properties have occupancy data
      if (bookingList.length === 0) {
        try {
          const bRes = await bookingApi.list({ limit: 100 });
          const bData = bRes.data?.data;
          if (Array.isArray(bData) && bData.length > 0) {
            bookingList = bData;
          }
        } catch (_) {}
      }

      setProperties(propList || []);
      setBookings(bookingList || []);
    } catch (e) {
      setError(e.message || 'Failed to load heatmap data');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function prevMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  }

  function nextMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  }

  const monthDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  }, [currentDate]);

  const monthLabel = useMemo(() => {
    return currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  }, [currentDate]);

  function isBooked(propId, day) {
    const targetY = day.getFullYear();
    const targetM = day.getMonth();
    const targetD = day.getDate();
    const targetTime = new Date(targetY, targetM, targetD).getTime();

    return bookings.some((b) => {
      const pId = b.propertyId || b.property?.id;
      if (pId !== propId) return false;
      const sRaw = b.start_date || b.startDate;
      const eRaw = b.end_date || b.endDate;
      if (!sRaw || !eRaw) return false;

      const s = new Date(sRaw);
      const e = new Date(eRaw);
      const sTime = new Date(s.getFullYear(), s.getMonth(), s.getDate()).getTime();
      const eTime = new Date(e.getFullYear(), e.getMonth(), e.getDate()).getTime();
      return targetTime >= sTime && targetTime <= eTime && b.status !== 'CANCELLED';
    });
  }

  const displayProps = properties.slice(0, 10);

  if (loading) return <div className="heatmap-loading">Loading heatmap...</div>;

  return (
    <div className="booking-heatmap">
      {error && <div className="alert alert-danger">{error} <button className="btn btn-sm" onClick={load}>Retry</button></div>}
      <div className="heatmap-header">
        <div className="heatmap-title-row">
          <CalendarDays size={20} />
          <h2>Booking Heatmap</h2>
        </div>
        <div className="heatmap-nav">
          <button onClick={prevMonth}><ChevronLeft size={16} /></button>
          <span className="heatmap-month">{monthLabel}</span>
          <button onClick={nextMonth}><ChevronRight size={16} /></button>
        </div>
      </div>

      <div className="heatmap-legend">
        <div className="legend-item">
          <span className="legend-dot legend-available" /> Available
        </div>
        <div className="legend-item">
          <span className="legend-dot legend-booked" /> Booked
        </div>
      </div>

      <div className="heatmap-grid">
        <div className="heatmap-grid-row">
          <div className="heatmap-cell heatmap-label-cell heatmap-corner" />
          {monthDays.map((day) => (
            <div key={day.toISOString()} className="heatmap-cell heatmap-date-cell">
              {day.getDate()}
            </div>
          ))}
        </div>

        {displayProps.map((prop) => (
          <div key={prop.id} className="heatmap-grid-row">
            <div className="heatmap-cell heatmap-label-cell">
              <span className="prop-name" title={prop.title}>{prop.title}</span>
            </div>
            {monthDays.map((day) => (
              <div
                key={day.toISOString()}
                className={`heatmap-cell heatmap-data-cell ${isBooked(prop.id, day) ? 'booked' : 'available'}`}
                title={isBooked(prop.id, day) ? 'Booked' : 'Available'}
              />
            ))}
          </div>
        ))}

        {properties.length === 0 && (
          <div className="heatmap-empty">
            <p>No properties found. Add a property to see booking trends.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default LandlordHeatmap;
