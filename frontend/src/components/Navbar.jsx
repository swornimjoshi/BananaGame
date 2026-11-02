import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Gamepad2, Trophy, User, LogOut, LogIn, Sun, Moon } from 'lucide-react';
import toast from 'react-hot-toast';
import Mascot from './Mascot';
import Button from './Button';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Theme toggle state: 'dark' | 'light'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('banana_theme') || 'light';
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
      toast.success('Logged out safely! 🍌');
      navigate('/');
    } catch {
      toast.error('Logout failed');
    }
  };

  const isActive = (path) => location.pathname === path;

  // Primary navigation links
  const navLinks = [
    { to: '/game', label: 'Play', icon: <Gamepad2 size={18} /> },
    { to: '/leaderboard', label: 'Leaderboard', icon: <Trophy size={18} /> },
    {
      to: user ? '/profile' : '/login',
      label: user ? (user.displayName || user.username) : 'Login',
      icon: user ? (
        <span className="nav-avatar" aria-hidden="true">{user.avatar || '🍌'}</span>
      ) : (
        <LogIn size={18} />
      ),
    },
  ];

  return (
    <>
      {/* Top Navbar Header */}
      <header className="navbar">
        <div className="navbar-inner">
          {/* Logo with Mascot Icon */}
          <Link to="/" className="navbar-logo" aria-label="Banana Math Home">
            <Mascot state="cheering" size={36} className="navbar-logo-mascot" />
            <span className="logo-text">
              Banana<span className="logo-highlight">Math</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="navbar-links desktop-nav" aria-label="Desktop Navigation">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`nav-link ${isActive(link.to) ? 'active' : ''}`}
                aria-current={isActive(link.to) ? 'page' : undefined}
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

            {/* Night Lab / Light Theme Toggle Button */}
            <button
              type="button"
              className="theme-toggle-btn"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Day Lab (Light)' : 'Switch to Night Lab (Dark)'}
              aria-label={theme === 'dark' ? 'Switch to Day Lab (Light)' : 'Switch to Night Lab (Dark)'}
            >
              {theme === 'dark' ? <Sun size={18} className="banana-text" /> : <Moon size={18} />}
            </button>

            {/* Authenticated user logout or Guest register button */}
            {user ? (
              <button
                type="button"
                className="nav-logout-btn"
                onClick={handleLogout}
                title="Logout"
                aria-label="Logout"
              >
                <LogOut size={17} />
              </button>
            ) : (
              <Button to="/register" variant="primary" size="sm">
                Sign Up
              </Button>
            )}
          </nav>

          {/* Mobile Top Controls: Theme Toggle & User avatar / login link */}
          <div className="mobile-controls">
            <button
              type="button"
              className="theme-toggle-btn"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Day Lab' : 'Switch to Night Lab'}
              aria-label={theme === 'dark' ? 'Switch to Day Lab' : 'Switch to Night Lab'}
            >
              {theme === 'dark' ? <Sun size={17} className="banana-text" /> : <Moon size={17} />}
            </button>

            {user ? (
              <Link
                to="/profile"
                className="mobile-avatar-pill"
                aria-label="My Profile"
              >
                <span className="nav-avatar">{user.avatar || '🍌'}</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="btn btn-sm btn-primary"
                aria-label="Login"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Tab Bar (Thumb Zone) */}
      <nav className="bottom-tab-bar" aria-label="Mobile Bottom Navigation">
        <Link
          to="/game"
          className={`bottom-tab-link ${isActive('/game') ? 'active' : ''}`}
          aria-label="Play Game"
          aria-current={isActive('/game') ? 'page' : undefined}
        >
          <Gamepad2 size={20} />
          <span>Play</span>
        </Link>
        <Link
          to="/leaderboard"
          className={`bottom-tab-link ${isActive('/leaderboard') ? 'active' : ''}`}
          aria-label="Leaderboard"
          aria-current={isActive('/leaderboard') ? 'page' : undefined}
        >
          <Trophy size={20} />
          <span>Ranks</span>
        </Link>
        <Link
          to={user ? '/profile' : '/login'}
          className={`bottom-tab-link ${isActive(user ? '/profile' : '/login') ? 'active' : ''}`}
          aria-label={user ? 'Profile' : 'Sign in'}
          aria-current={isActive(user ? '/profile' : '/login') ? 'page' : undefined}
        >
          {user ? <User size={20} /> : <LogIn size={20} />}
          <span>{user ? 'Profile' : 'Sign In'}</span>
        </Link>
      </nav>
    </>
  );
};

export default Navbar;
