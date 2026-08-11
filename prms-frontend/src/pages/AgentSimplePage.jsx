import AgentSidebar from '../components/AgentSidebar';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

const AgentSimplePage = ({ label }) => {
  const navigate = useNavigate();

  const agentPages = [
    { name: 'Dashboard', path: '/agent/dashboard' },
    { name: 'Assigned Properties', path: '/agent/properties' },
    { name: 'Bookings', path: '/agent/bookings' },
    { name: 'Maintenance', path: '/agent/maintenance' },
    { name: 'My Categories', path: '/agent/categories' },
  ];

  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="page-container">
      <AgentSidebar />
      <main className="content-wrapper" data-customize-id="global.content">
        <div className="topbar">
          <h2>{label}</h2>
          <div className="topbar-right">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="user-avatar">AG</div>
          </div>
        </div>

        <div className="page-content">
          <div className="info-box">
            <p>Loading {label}...</p>
            <p className="muted">
              Connect this page to the backend API to display live data.
            </p>
          </div>

          <div className="quick-links">
            <h3>Quick Navigation</h3>
            <div className="quick-links-grid">
              {agentPages.map((page) => (
                <button
                  key={page.path}
                  className="quick-link-btn"
                  onClick={() => navigate(page.path)}
                >
                  {page.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

AgentSimplePage.propTypes = {
  label: PropTypes.string.isRequired,
};

export default AgentSimplePage;
