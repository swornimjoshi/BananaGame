import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';
import Mascot from './Mascot';

/**
 * Arcade Match Countdown Component (3... 2... 1... SOLVE! ⚡)
 * Inspired by competitive arcade duel arenas.
 * Spacebar, Enter, or Click immediately skips.
 */
const MatchIntro = ({ onComplete }) => {
  const [count, setCount] = useState(3);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        onComplete();
      }
    };
    window.addEventListener('keydown', handleKey);

    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setTimeout(onComplete, 450);
          return 0; // 'SOLVE!'
        }
        return prev - 1;
      });
    }, 700);

    return () => {
      clearInterval(timer);
      window.removeEventListener('keydown', handleKey);
    };
  }, [onComplete]);

  const labels = {
    3: 'READY!',
    2: 'FOCUS!',
    1: 'CHARGE!',
    0: 'SOLVE! ⚡',
  };

  return (
    <div
      className="match-intro-backdrop"
      onClick={onComplete}
      role="dialog"
      aria-modal="true"
      aria-label="Match countdown"
    >
      <div className="match-intro-center">
        <Mascot state={count === 0 ? 'cheering' : 'thinking'} size={120} />

        <AnimatePresence mode="wait">
          <motion.div
            key={count}
            className={`countdown-number-box ${count === 0 ? 'countdown-solve' : ''}`}
            initial={{ scale: 0.4, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 1.4, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 450, damping: 20 }}
          >
            <span className="countdown-digit">
              {count > 0 ? count : <Zap size={48} className="solve-zap-icon" />}
            </span>
            <span className="countdown-label">{labels[count]}</span>
          </motion.div>
        </AnimatePresence>

        <p className="countdown-skip-hint">
          Click or press <kbd>Space</kbd> to skip intro
        </p>
      </div>
    </div>
  );
};

export default MatchIntro;
