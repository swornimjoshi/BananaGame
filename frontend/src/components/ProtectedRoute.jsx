import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="page-loader">
        <motion.div
          className="loader-banana"
          animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1.2 }}
        >
          🍌
        </motion.div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname, message: 'Please sign in to play the Banana Math Game! 🍌' }}
        replace
      />
    );
  }

  return children;
};

export default ProtectedRoute;
