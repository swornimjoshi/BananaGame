import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { Gamepad2, Trophy, User, LogOut, LogIn, Menu, X, Sun, Moon } from 'lucide-react';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Theme toggle state: 'dark' | 'light'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('banana_theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('banana_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out!');
      navigate('/');
    } catch {
      toast.error('Logout failed');
    }
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = user
    ? [
        { to: '/game', label: 'Play', icon: <Gamepad2 size={16} /> },
        { to: '/leaderboard', label: 'Leaderboard', icon: <Trophy size={16} /> },
        { to: '/profile', label: user.displayName || user.username, icon: <span className="nav-avatar">{user.avatar}</span> },
      ]
    : [
        { to: '/game', label: 'Play', icon: <Gamepad2 size={16} /> },
        { to: '/leaderboard', label: 'Leaderboard', icon: <Trophy size={16} /> },
        { to: '/login', label: 'Login', icon: <LogIn size={16} /> },
      ];

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo" onClick={() => setMenuOpen(false)}>
          <motion.span
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            style={{ display: 'inline-block' }}
          >
            🍌
          </motion.span>
          <span className="logo-text">BananaMath</span>
        </Link>

        {/* Desktop nav */}
        <div className="navbar-links desktop-nav">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`nav-link ${isActive(link.to) ? 'active' : ''}`}
            >
              {link.icon}
              <span>{link.label}</span>
              {isActive(link.to) && (
                <motion.div
                  layoutId="nav-indicator"
                  className="nav-indicator"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </Link>
          ))}

          {/* Unified Dark / Light Theme Toggle Button */}
          <motion.button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {theme === 'dark' ? <Sun size={17} className="banana-text" /> : <Moon size={17} />}
          </motion.button>

          {user && (
            <button className="nav-logout-btn" onClick={handleLogout} title="Logout">
              <LogOut size={16} />
            </button>
          )}
          {!user && (
            <Link to="/register" className="btn btn-primary btn-sm">
              Sign Up Free
            </Link>
          )}
        </div>

        {/* Mobile controls: Single theme toggle + hamburger */}
        <div className="mobile-controls">
          <button
            className="theme-toggle-btn mobile-only-toggle"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun size={17} className="banana-text" /> : <Moon size={17} />}
          </button>
          <button className="menu-toggle" onClick={() => setMenuOpen((o) => !o)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`mobile-nav-link ${isActive(link.to) ? 'active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                {link.icon} {link.label}
              </Link>
            ))}
            {user ? (
              <button className="mobile-nav-link logout-mobile" onClick={handleLogout}>
                <LogOut size={16} /> Logout
              </button>
            ) : (
              <Link to="/register" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>
                Sign Up Free
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
