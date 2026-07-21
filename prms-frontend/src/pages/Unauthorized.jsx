import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { roleToPath, ROUTES } from '../config/routes';

function Unauthorized() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGoHome = () => {
    if (user?.role) {
      navigate(roleToPath(user.role));
    } else {
      navigate(ROUTES.public.login);
    }
  };

  return (
    <motion.main
      className="error-page"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#faf9f7',
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      <ShieldAlert size={64} style={{ color: '#7c5cfc', marginBottom: '1rem' }} />
      <h1 style={{ fontSize: '4rem', fontWeight: 800, color: '#1e1b2e', margin: 0 }}>403</h1>
      <h2 style={{ fontSize: '1.5rem', color: '#1e1b2e', margin: '1rem 0 0.5rem' }}>
        Unauthorized
      </h2>
      <p style={{ color: '#7e7a8b', margin: '0 0 2rem', maxWidth: 400 }}>
        You do not have permission to access this page.
      </p>
      <button
        onClick={handleGoHome}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '0.75rem 1.5rem',
          backgroundColor: '#7c5cfc',
          color: '#fff',
          borderRadius: 12,
          textDecoration: 'none',
          fontWeight: 600,
          border: 'none',
          cursor: 'pointer',
          fontSize: '1rem',
        }}
      >
        <ArrowLeft size={20} />
        {user ? 'Go to Dashboard' : 'Go to Login'}
      </button>
    </motion.main>
  );
}

export default Unauthorized;