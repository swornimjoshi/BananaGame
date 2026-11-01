import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Gamepad2, Trophy, Zap, Shield, Lightbulb } from 'lucide-react';

const floatingBananas = ['🍌', '🍌', '🐒', '🍌', '🌴', '🍌', '⭐', '🍌'];

const Home = () => {
  const { user } = useAuth();

  const features = [
    { icon: <Zap size={28} />, title: 'Speed Bonus', desc: 'Answer faster to earn extra points on top of your base score.' },
    { icon: '🔥', title: 'Streak Multiplier', desc: 'Chain correct answers for up to 3× multiplier on your score.' },
    { icon: <Lightbulb size={28} />, title: '3-Step Hint System', desc: 'Progressive clues from number parity to a 50/50 final showdown.' },
    { icon: <Trophy size={28} />, title: 'Live Leaderboard', desc: 'Compete globally with daily, weekly, and all-time rankings.' },
  ];

  return (
    <motion.div
      className="home-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Floating banana decorations */}
      <div className="floating-bg" aria-hidden="true">
        {floatingBananas.map((emoji, i) => (
          <motion.span
            key={i}
            className="floating-emoji"
            style={{ left: `${10 + i * 12}%`, animationDelay: `${i * 0.7}s`, fontSize: `${1.2 + (i % 3) * 0.5}rem` }}
            animate={{ y: [-20, 20, -20], rotate: [-10, 10, -10] }}
            transition={{ repeat: Infinity, duration: 4 + i, ease: 'easeInOut', delay: i * 0.5 }}
          >
            {emoji}
          </motion.span>
        ))}
      </div>

      {/* Hero */}
      <section className="hero-section">
        <motion.div
          className="hero-content"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.6 }}
        >
          <motion.div
            className="hero-badge"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
          >
            🍌 Banana Math Challenge
          </motion.div>

          <h1 className="hero-title">
            Solve the Puzzle.<br />
            <span className="gradient-text">Climb the Ranks.</span>
          </h1>

          <p className="hero-subtitle">
            Find the missing digit hidden in each banana puzzle. Race against the clock,
            build streaks, and dominate the global leaderboard.
          </p>

          <div className="hero-cta">
            {user ? (
              <Link to="/game" className="btn btn-primary btn-lg">
                <Gamepad2 size={20} /> Play Now
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  state={{ from: '/game', message: 'Please log in to play Banana Math Game! 🍌' }}
                  className="btn btn-primary btn-lg"
                >
                  <Gamepad2 size={20} /> Play Now (Login Required)
                </Link>
                <Link to="/register" className="btn btn-ghost btn-lg">
                  Create Account
                </Link>
              </>
            )}
          </div>
        </motion.div>

        {/* Demo card */}
        <motion.div
          className="hero-demo"
          initial={{ x: 60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.7 }}
        >
          <div className="demo-card glass-card">
            <div className="demo-header">
              <span className="demo-label">Banana Puzzle</span>
              <span className="demo-timer">⏱ 28s</span>
            </div>
            <div className="demo-image-wrap">
              <div className="demo-image-placeholder">
                <span style={{ fontSize: '2.5rem' }}>🍌 + 🍌 = 10</span>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '8px' }}>
                  Solve the equation & find the missing digit!
                </p>
                <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--color-banana)' }}>
                  🍌 Powered by Marc Conrad's Banana API
                </div>
              </div>
            </div>
            <div className="demo-pad">
              {[1,2,3,4,5,6,7,8,9,0].map(n => (
                <div key={n} className="demo-num">{n}</div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="features-section">
        <motion.h2
          className="section-title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Why Play Banana Math?
        </motion.h2>
        <div className="features-grid">
          {features.map((f, i) => (
            <motion.div
              key={i}
              className="feature-card glass-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -5, boxShadow: '0 8px 32px rgba(247,201,72,0.15)' }}
            >
              <div className="feature-icon">
                {typeof f.icon === 'string' ? <span style={{ fontSize: '1.8rem' }}>{f.icon}</span> : f.icon}
              </div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Scoring explainer */}
      <section className="scoring-section">
        <motion.div
          className="scoring-card glass-card"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="section-title" style={{ marginBottom: '1.5rem' }}>Scoring System</h2>
          <div className="scoring-grid">
            <div className="score-item">
              <span className="score-label">Base Score</span>
              <span className="score-value banana-text">100 pts</span>
            </div>
            <div className="score-item">
              <span className="score-label">Speed Bonus</span>
              <span className="score-value" style={{ color: 'var(--color-orange)' }}>+50 pts</span>
            </div>
            <div className="score-item">
              <span className="score-label">Streak ×3</span>
              <span className="score-value" style={{ color: 'var(--color-purple)' }}>3× mult</span>
            </div>
            <div className="score-item">
              <span className="score-label">Max per Q</span>
              <span className="score-value" style={{ color: 'var(--color-green)' }}>450 pts</span>
            </div>
          </div>
          {!user && (
            <Link to="/register" className="btn btn-primary" style={{ marginTop: '2rem' }}>
              Get Started — It's Free
            </Link>
          )}
        </motion.div>
      </section>

      {/* Footer / Attribution */}
      <footer style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
        <p>
          Game puzzles powered by{' '}
          <a
            href="https://marcconrad.com/uob/banana/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--color-banana)', textDecoration: 'underline' }}
          >
            Marc Conrad's Banana API
          </a>
        </p>
      </footer>
    </motion.div>
  );
};

export default Home;
