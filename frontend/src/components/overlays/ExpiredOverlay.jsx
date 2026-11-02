import React from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Clock, LogOut } from 'lucide-react';
import Mascot from '../Mascot';
import Button from '../Button';

const ExpiredOverlay = ({ onNext, onQuit }) => {
  return (
    <div className="overlay-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="expired-title">
      <motion.div
        className="result-overlay result-expired glass-card"
        initial={{ opacity: 0, scale: 0.88, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      >
        <div className="result-mascot-wrap">
          <Mascot state="thinking" size={100} />
        </div>

        <div className="expired-badge" aria-hidden="true">
          <Clock size={20} /> Time's Up!
        </div>

        <h2 id="expired-title" className="result-title">Out of Time!</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
          The timer ran out before an answer was picked. Let's try another puzzle!
        </p>

        <div className="result-actions">
          <Button
            id="try-again-btn"
            variant="primary"
            size="lg"
            onClick={onNext}
            icon={<RotateCcw size={18} />}
          >
            Try Another
          </Button>
          <Button
            variant="ghost"
            size="md"
            onClick={onQuit}
            icon={<LogOut size={16} />}
          >
            Quit
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default ExpiredOverlay;

