import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, LogIn, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import Mascot from '../components/Mascot';
import Button from '../components/Button';

const Login = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const notice = location.state?.message;

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  if (user) {
    navigate(location.state?.from || '/game', { replace: true });
    return null;
  }

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Please provide your email address';
    if (!form.password) e.password = 'Please enter your password';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back to the Lab! 🍌');
      navigate(location.state?.from || '/game', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed';
      toast.error(msg);
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="auth-page"
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="auth-card glass-card">
        {/* Playful Header with Mascot */}
        <div className="auth-header">
          <Mascot state="cheering" size={90} className="auth-mascot" />
          <h1 className="auth-title">Welcome Back, Scientist!</h1>
          <p className="auth-subtitle">Sign in to save scores & climb global ranks</p>
        </div>

        {notice && (
          <div className="login-notice-banner" role="alert">
            <span>🔒 {notice}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {errors.general && (
            <div className="form-error-banner" role="alert">
              {errors.general}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="login-email" className="form-label">
              Lab Email Address
            </label>
            <input
              id="login-email"
              type="email"
              className={`form-input ${errors.email ? 'input-error' : ''}`}
              placeholder="genius@bananalab.org"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              autoComplete="email"
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="login-password" className="form-label">
              Secret Password
            </label>
            <div className="input-icon-wrap">
              <input
                id="login-password"
                type={showPw ? 'text' : 'password'}
                className={`form-input ${errors.password ? 'input-error' : ''}`}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="input-icon-btn"
                onClick={() => setShowPw((v) => !v)}
                tabIndex={-1}
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <Button
            id="login-submit"
            type="submit"
            variant="primary"
            size="lg"
            disabled={loading}
            icon={<LogIn size={18} />}
            className="btn-full"
            style={{ marginTop: '0.5rem' }}
          >
            {loading ? 'Authenticating...' : 'Sign In to Lab'}
          </Button>
        </form>

        {/* Continue as Guest option */}
        <div className="auth-guest-divider">
          <span>or test before signing up</span>
        </div>

        <Button
          to="/game"
          variant="secondary"
          size="md"
          className="btn-full"
          icon={<ArrowRight size={16} />}
        >
          Continue as Guest
        </Button>

        <p className="auth-switch">
          Don't have a lab account?{' '}
          <Link to="/register" className="auth-link">
            Sign up free
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default Login;
