import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Eye, EyeOff, UserPlus, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import Mascot from '../components/Mascot';
import Button from '../components/Button';

const Register = () => {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    displayName: '',
    avatar: '🍌'
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [avatars, setAvatars] = useState([
    '🍌', '🐒', '🦍', '🌴', '🦁', '🐯', '🦊', '🐸', '🐧', '🦄', '🎮', '🏆', '⭐', '🔥', '💎'
  ]);

  if (user) {
    navigate('/game', { replace: true });
    return null;
  }

  useEffect(() => {
    api.get('/profile/avatars')
      .then(({ data }) => setAvatars(data.avatars))
      .catch(() => {});
  }, []);

  // Compute password strength score (0-4)
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: 'None', color: 'var(--color-border-light)' };
    let s = 0;
    if (pwd.length >= 8) s += 1;
    if (pwd.length >= 12) s += 1;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) s += 1;
    if (/[0-9]/.test(pwd) || /[^A-Za-z0-9]/.test(pwd)) s += 1;

    if (s <= 1) return { score: 25, label: 'Weak', color: 'var(--color-wrong)' };
    if (s === 2) return { score: 50, label: 'Fair', color: 'var(--color-streak)' };
    if (s === 3) return { score: 75, label: 'Good', color: 'var(--color-primary)' };
    return { score: 100, label: 'Strong 💪', color: 'var(--color-correct)' };
  };

  const strength = getPasswordStrength(form.password);

  const validate = () => {
    const e = {};
    if (!form.username || form.username.length < 3) e.username = 'Username must be 3–20 characters';
    if (!/^[a-zA-Z0-9_]+$/.test(form.username)) e.username = 'Letters, numbers, and underscores only';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (!form.password || form.password.length < 8) e.password = 'Password must be at least 8 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register(form);
      toast.success('Welcome to Monkey Genius Lab! 🍌🎉');
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
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="auth-card glass-card" style={{ maxWidth: '480px' }}>
        {/* Playful Header with Mascot */}
        <div className="auth-header">
          <Mascot state="crowned" size={90} className="auth-mascot" />
          <h1 className="auth-title">Join the Lab!</h1>
          <p className="auth-subtitle">Pick an avatar and join the global chalkboard ranks</p>
        </div>

        {/* Avatar Selector */}
        <div className="avatar-picker">
          <p className="avatar-label">Choose Your Scientist Avatar</p>
          <div className="avatar-grid" role="group" aria-label="Avatar options">
            {avatars.map((av) => (
              <button
                key={av}
                type="button"
                className={`avatar-btn ${form.avatar === av ? 'selected' : ''}`}
                onClick={() => setForm((p) => ({ ...p, avatar: av }))}
                aria-label={`Select avatar ${av}`}
              >
                {av}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {errors.general && (
            <div className="form-error-banner" role="alert">
              {errors.general}
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="reg-username" className="form-label">Username</label>
              <input
                id="reg-username"
                type="text"
                className={`form-input ${errors.username ? 'input-error' : ''}`}
                placeholder="banana_genius"
                value={form.username}
                maxLength={20}
                onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
                autoComplete="username"
              />
              {errors.username && <span className="field-error">{errors.username}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="reg-display" className="form-label">
                Display Name <span className="optional">(optional)</span>
              </label>
              <input
                id="reg-display"
                type="text"
                className="form-input"
                placeholder="Dr. Banana"
                value={form.displayName}
                maxLength={50}
                onChange={(e) => setForm((p) => ({ ...p, displayName: e.target.value }))}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reg-email" className="form-label">Email Address</label>
            <input
              id="reg-email"
              type="email"
              className={`form-input ${errors.email ? 'input-error' : ''}`}
              placeholder="you@lab.org"
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

            {/* Password strength meter */}
            {form.password && (
              <div className="pw-strength-container" aria-live="polite">
                <div className="pw-strength">
                  <div
                    className="pw-bar"
                    style={{
                      width: `${strength.score}%`,
                      background: strength.color,
                    }}
                  />
                </div>
                <div className="pw-strength-label" style={{ color: strength.color }}>
                  Strength: {strength.label}
                </div>
              </div>
            )}
          </div>

          <Button
            id="register-submit"
            type="submit"
            variant="primary"
            size="lg"
            disabled={loading}
            icon={<UserPlus size={18} />}
            className="btn-full"
            style={{ marginTop: '0.5rem' }}
          >
            {loading ? 'Creating Lab Record...' : 'Create Scientist Account'}
          </Button>
        </form>

        {/* Continue as guest option */}
        <div className="auth-guest-divider">
          <span>or try without an account</span>
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
          Already registered in the lab?{' '}
          <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </motion.div>
  );
};

export default Register;
