import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Spinner saat auth masih loading
const Spinner = () => (
  <div style={{
    minHeight: '100vh',
    background: '#000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }}>
    <div style={{
      width: 40,
      height: 40,
      border: '3px solid rgba(30,215,96,0.2)',
      borderTop: '3px solid #1ed760',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

// Hanya bisa diakses kalau sudah login
export const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (user === undefined) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// Kalau sudah login, tidak bisa balik ke /login
export const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  if (user === undefined) return <Spinner />;
  if (user) return <Navigate to="/app" replace />;
  return children;
};
