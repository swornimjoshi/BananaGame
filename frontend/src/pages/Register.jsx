import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', displayName: '', avatar: '🍌' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [avatars, setAvatars] = useState(['🍌', '🐒', '🦍', '🌴', '🦁', '🐯', '🦊', '🐸', '🐧', '🦄', '🎮', '🏆', '⭐', '🔥', '💎']);
  const [step, setStep] = useState(1); // 2-step form

  if (user) { navigate('/game', { replace: true }); return null; }

  useEffect(() => {
    api.get('/profile/avatars').then(({ data }) => setAvatars(data.avatars)).catch(() => {});
  }, []);

  const validate = () => {
    const e = {};
    if (!form.username || form.username.length < 3) e.username = 'Username must be 3–20 characters';
    if (!/^[a-zA-Z0-9_]+$/.test(form.username)) e.username = 'Letters, numbers, underscore only';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (!form.password || form.password.length < 8) e.password = 'At least 8 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register(form);
      toast.success('Welcome to Banana Math! 🍌🎉');
      navigate('/game');
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      if (apiErrors) {
        const mapped = {};
        apiErrors.forEach((e) => { mapped[e.path || 'general'] = e.msg; });
        setErrors(mapped);
      } else {
        const msg = err.response?.data?.error || 'Registration failed';
        toast.error(msg);
        setErrors({ general: msg });
      }
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
      <div className="auth-card glass-card" style={{ maxWidth: '480px' }}>
        <div className="auth-header">
          <motion.div
            className="auth-logo"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            {form.avatar}
          </motion.div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Pick an avatar and join the leaderboard</p>
        </div>

        {/* Avatar selector */}
        <div className="avatar-picker">
          <p className="avatar-label">Choose Your Avatar</p>
          <div className="avatar-grid">
            {avatars.map((av) => (
              <motion.button
                key={av}
                type="button"
                className={`avatar-btn ${form.avatar === av ? 'selected' : ''}`}
                onClick={() => setForm((p) => ({ ...p, avatar: av }))}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              >
                {av}
              </motion.button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {errors.general && (
            <motion.div className="form-error-banner" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {errors.general}
            </motion.div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="reg-username" className="form-label">Username</label>
              <input
                id="reg-username"
                type="text"
                className={`form-input ${errors.username ? 'input-error' : ''}`}
                placeholder="coolplayer99"
                value={form.username}
                maxLength={20}
                onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
                autoComplete="username"
              />
              {errors.username && <span className="field-error">{errors.username}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="reg-display" className="form-label">Display Name <span className="optional">(optional)</span></label>
              <input
                id="reg-display"
                type="text"
                className="form-input"
                placeholder="Cool Player"
                value={form.displayName}
                maxLength={50}
                onChange={(e) => setForm((p) => ({ ...p, displayName: e.target.value }))}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reg-email" className="form-label">Email</label>
            <input
              id="reg-email"
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
            <label htmlFor="reg-password" className="form-label">Password</label>
            <div className="input-icon-wrap">
              <input
                id="reg-password"
                type={showPw ? 'text' : 'password'}
                className={`form-input ${errors.password ? 'input-error' : ''}`}
                placeholder="At least 8 characters"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                autoComplete="new-password"
              />
              <button type="button" className="input-icon-btn" onClick={() => setShowPw((v) => !v)} tabIndex={-1}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <span className="field-error">{errors.password}</span>}
            {form.password && (
              <div className="pw-strength">
                <div
                  className="pw-bar"
                  style={{
                    width: `${Math.min(100, form.password.length * 8)}%`,
                    background: form.password.length >= 12 ? 'var(--color-green)'
                      : form.password.length >= 8 ? 'var(--color-banana)'
                      : 'var(--color-red)',
                  }}
                />
              </div>
            )}
          </div>

          <motion.button
            id="register-submit"
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>🍌</motion.span>
              : <><UserPlus size={18} /> Create Account</>}
          </motion.button>
        </form>

        <p className="auth-switch">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </motion.div>
  );
};

export default Register;
