import React, { useState, useEffect } from 'react';
import { useAgent } from '../contexts/agentContext';
import { useNavigate } from 'react-router-dom';
import './AgentDashboard.css';

const AgentDashboard = () => {
  const { agent, loading } = useAgent();
  const navigate = useNavigate();
  const [assignedProperties, setAssignedProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);

  useEffect(() => {
    if (!agent) {
      navigate('/login');
      return;
    }

    // Simulate fetching agent data
    const fetchData = async () => {
      // This would be replaced with actual API calls
      setAssignedProperties([
        {
          id: '1',
          title: 'Modern Apartment',
          address: '123 Main St, City',
          rent: 1200,
          status: 'AVAILABLE'
        },
        {
          id: '2',
          title: 'Luxury Condo',
          address: '456 Park Ave, City',
          rent: 2500,
          status: 'RENTED'
        }
      ]);

      setBookings([
        {
          id: '1',
          propertyTitle: 'Modern Apartment',
          tenant: 'John Doe',
          startDate: '2023-06-01',
          endDate: '2023-08-31',
          status: 'CONFIRMED'
        }
      ]);

      setMaintenanceRequests([
        {
          id: '1',
          propertyTitle: 'Modern Apartment',
          title: 'Kitchen Faucet Repair',
          priority: 'HIGH',
          status: 'OPEN',
          createdDate: '2023-06-10'
        }
      ]);
    };

    fetchData();
  }, [agent, navigate]);

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (!agent) {
    return <div className="error">Please log in to view dashboard</div>;
  }

  return (
    <div className="agent-dashboard">
      <header className="dashboard-header">
        <h1>Agent Dashboard</h1>
        <p>Welcome back, {agent.fullName}</p>
      </header>

      <div className="dashboard-content">
        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>Assigned Properties</h3>
            <p>{assignedProperties.length}</p>
          </div>
          <div className="stat-card">
            <h3>Pending Bookings</h3>
            <p>{bookings.filter(b => b.status === 'CONFIRMED').length}</p>
          </div>
          <div className="stat-card">
            <h3>Pending Maintenance</h3>
            <p>{maintenanceRequests.filter(m => m.status === 'OPEN').length}</p>
          </div>
        </div>

        <div className="dashboard-section">
          <h2>Assigned Properties</h2>
          <div className="properties-grid">
            {assignedProperties.map(property => (
              <div key={property.id} className="property-card">
                <h3>{property.title}</h3>
                <p>{property.address}</p>
                <p>Rent: ${property.rent}/month</p>
                <p>Status: <span className={`status ${property.status.toLowerCase()}`}>{property.status}</span></p>
                <button onClick={() => navigate(`/properties/${property.id}`)}>
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-section">
          <h2>Pending Bookings</h2>
          <div className="bookings-list">
            {bookings.map(booking => (
              <div key={booking.id} className="booking-item">
                <h4>{booking.propertyTitle}</h4>
                <p>Tenant: {booking.tenant}</p>
                <p>Period: {booking.startDate} to {booking.endDate}</p>
                <p>Status: <span className={`status ${booking.status.toLowerCase()}`}>{booking.status}</span></p>
                <button onClick={() => navigate(`/bookings/${booking.id}`)}>
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-section">
          <h2>Maintenance Requests</h2>
          <div className="maintenance-list">
            {maintenanceRequests.map(request => (
              <div key={request.id} className="maintenance-item">
                <h4>{request.title}</h4>
                <p>Property: {request.propertyTitle}</p>
                <p>Priority: <span className={`priority ${request.priority.toLowerCase()}`}>{request.priority}</span></p>
                <p>Status: <span className={`status ${request.status.toLowerCase()}`}>{request.status}</span></p>
                <button onClick={() => navigate(`/maintenance/${request.id}`)}>
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;