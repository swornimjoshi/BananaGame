import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Gamepad2, Trophy, Zap, Lightbulb, Flame, ArrowRight, CheckCircle2 } from 'lucide-react';
import Mascot from '../components/Mascot';
import Button from '../components/Button';
import { playClickSound } from '../utils/audio';

const Home = () => {
  const { user } = useAuth();

  // Interactive Demo Card State
  const [demoDigit, setDemoDigit] = useState(null);
  const [demoReaction, setDemoReaction] = useState('idle');
  const [demoFeedback, setDemoFeedback] = useState('Tap a digit below to solve the equation: 🍌 + 🍌 = ?');

  const handleDemoTap = (n) => {
    playClickSound();
    setDemoDigit(n);
    if (n === 8) {
      setDemoReaction('cheering');
      setDemoFeedback('🎉 Correct! 4 + 4 = 8. Professor Chimpy is impressed!');
    } else {
      setDemoReaction('headshake');
      setDemoFeedback(`🤔 Not quite ${n}! Remember: each bunch has 4 bananas.`);
    }
  };

  const features = [
    {
      icon: <Zap size={28} />,
      title: 'Speed Bonus',
      color: 'var(--color-streak)',
      desc: 'Answer in the first 5 seconds to bank up to +50 speed bonus points on every puzzle.',
    },
    {
      icon: <Flame size={28} />,
      title: 'Streak Multiplier',
      color: 'var(--color-primary)',
      desc: 'Chain consecutive correct answers for a compounding 1.5×, 2×, up to 3× multiplier.',
    },
    {
      icon: <Lightbulb size={28} />,
      title: '3-Step Hint Lab',
      color: 'var(--color-info)',
      desc: 'Stuck on an equation? Get parity clues, eliminate 4 wrong digits, or trigger a 50/50 duel.',
    },
    {
      icon: <Trophy size={28} />,
      title: 'Live Global Ranks',
      color: 'var(--color-bonus)',
      desc: 'Climb daily, weekly, and all-time leaderboards. Claim the #1 golden lab crown.',
    },
  ];

  return (
    <motion.div
      className="home-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* ── 1. Hero Section ────────────────────────────────────────── */}
      <section className="hero-section" aria-label="Introduction">
        <motion.div
          className="hero-content"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="hero-badge">
            <span role="img" aria-hidden="true">🔬</span>
            <span>Welcome to Monkey Genius Lab</span>
          </div>

          <h1 className="hero-title">
            Solve the Puzzle.<br />
            <span className="gradient-text">Master Math Logic.</span>
          </h1>

          <p className="hero-subtitle">
            Find the missing digit (0–9) hidden inside the banana equation.
            Race against Professor Chimpy's chalkboard timer, build unstoppable streaks,
            and dominate the global leaderboard!
          </p>

          {/* Primary CTA Above the Fold */}
          <div className="hero-cta">
            <Button
              to="/game"
              variant="primary"
              size="lg"
              icon={<Gamepad2 size={22} />}
            >
              Play Now (Free)
            </Button>

            {!user && (
              <Button
                to="/register"
                variant="ghost"
                size="lg"
              >
                Sign Up to Save Score
              </Button>
            )}
          </div>

          <p className="hero-guest-hint">
            🌱 <strong>Guests can play immediately!</strong> Log in anytime to save your score and unlock leaderboard ranks.
          </p>
        </motion.div>

        {/* ── 2. Interactive Demo Card ──────────────────────────────── */}
        <motion.div
          className="hero-demo"
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="demo-card glass-card">
            <div className="demo-header">
              <span className="demo-label">Interactive Demo Lab</span>
              <span className="demo-timer">⏱ 28s</span>
            </div>

            {/* Chalkboard Card in Demo */}
            <div className="demo-image-wrap">
              <div className="demo-mascot-row">
                <Mascot state={demoReaction} size={70} />
              </div>
              <div className="demo-image-placeholder">
                <p className="demo-equation">🍌 + 🍌 = <span className="demo-target">{demoDigit !== null ? demoDigit : '?'}</span></p>
                <p className="demo-chalk-sub">(Each bunch = 4 bananas)</p>
              </div>
            </div>

            <p className="demo-feedback-text" aria-live="polite">
              {demoFeedback}
            </p>

            {/* Interactive Number Keys */}
            <div className="demo-pad" role="group" aria-label="Demo number keypad">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`demo-num ${demoDigit === n ? 'demo-num-selected' : ''}`}
                  onClick={() => handleDemoTap(n)}
                  aria-label={`Test digit ${n}`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── 3. Four Feature Cards ──────────────────────────────────── */}
      <section className="features-section" aria-label="Game Features">
        <h2 className="section-title">Why Students & Gamers Love It</h2>
        <div className="features-grid">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              className="feature-card glass-card"
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
            >
              <div className="feature-icon" style={{ color: f.color }}>
                {f.icon}
              </div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── 4. Scoring Explainer Card ──────────────────────────────── */}
      <section className="scoring-section" aria-label="Scoring Mechanics">
        <div className="scoring-card glass-card">
          <h2 className="section-title" style={{ marginBottom: '1rem' }}>
            Fair & Transparent Scoring System
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
            Every correct equation rewards your calculation speed and continuous accuracy.
          </p>

          <div className="scoring-grid">
            <div className="score-item">
              <span className="score-label">Base Points</span>
              <span className="score-value banana-text">100 pts</span>
              <span className="score-subtext">For any correct digit</span>
            </div>
            <div className="score-item">
              <span className="score-label">Speed Bonus</span>
              <span className="score-value" style={{ color: 'var(--color-streak)' }}>+50 pts</span>
              <span className="score-subtext">Under 5s rapid solve</span>
            </div>
            <div className="score-item">
              <span className="score-label">Streak Multiplier</span>
              <span className="score-value" style={{ color: 'var(--color-bonus)' }}>Up to 3×</span>
              <span className="score-subtext">Multiplier on entire score</span>
            </div>
            <div className="score-item">
              <span className="score-label">Max Per Puzzle</span>
              <span className="score-value" style={{ color: 'var(--color-correct)' }}>450 pts</span>
              <span className="score-subtext">Speed + 10x streak cap</span>
            </div>
          </div>

          <div className="scoring-cta-wrap">
            <Button
              to="/game"
              variant="primary"
              size="lg"
              icon={<ArrowRight size={20} />}
            >
              Start Your First Round
            </Button>
          </div>
        </div>
      </section>

      {/* ── 5. Footer & Academic Attribution ───────────────────────── */}
      <footer className="home-footer" role="contentinfo">
        <p>
          🍌 Banana Math Challenge • Puzzles powered by{' '}
          <a
            href="https://marcconrad.com/uob/banana/"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-credit-link"
          >
            Marc Conrad's Banana API
          </a>
        </p>
      </footer>
    </motion.div>
  );
};

export default Home;
