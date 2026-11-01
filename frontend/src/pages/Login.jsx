import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';

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
    if (!form.email) e.email = 'Email required';
    if (!form.password) e.password = 'Password required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back! 🍌');
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
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      <div className="auth-card glass-card">
        <div className="auth-header">
          <motion.div
            className="auth-logo"
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
          >
            🍌
          </motion.div>
          <h1 className="auth-title">Welcome Back!</h1>
          <p className="auth-subtitle">Sign in to continue your banana journey</p>
        </div>

        {notice && (
          <motion.div
            className="login-notice-banner"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span>🔒 {notice}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {errors.general && (
            <motion.div
              className="form-error-banner"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              {errors.general}
            </motion.div>
          )}

          <div className="form-group">
            <label htmlFor="login-email" className="form-label">Email</label>
            <input
              id="login-email"
              type="email"
              className={`form-input ${errors.email ? 'input-error' : ''}`}
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              autoComplete="email"
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="login-password" className="form-label">Password</label>
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
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <motion.button
            id="login-submit"
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                🍌
              </motion.span>
            ) : (
              <><LogIn size={18} /> Sign In</>
            )}
          </motion.button>
        </form>

        <p className="auth-switch">
          Don't have an account?{' '}
          <Link to="/register" className="auth-link">
            Sign up free
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default Login;
