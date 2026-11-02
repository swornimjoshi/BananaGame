import React from 'react';
import { motion } from 'framer-motion';
import { Play, LogOut, Pause } from 'lucide-react';
import Mascot from '../Mascot';
import Button from '../Button';

const PauseOverlay = ({ onResume, onQuit }) => {
  return (
    <div className="overlay-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="pause-title">
      <motion.div
        className="result-overlay result-paused glass-card"
        initial={{ opacity: 0, scale: 0.88 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      >
        <div className="result-mascot-wrap">
          <Mascot state="thinking" size={100} />
        </div>

        <div className="pause-icon-badge" aria-hidden="true">
          <Pause size={22} />
        </div>

        <h2 id="pause-title" className="result-title">Lab On Hold!</h2>
        <p className="pause-desc" style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
          Take a breath! The experiment timer is frozen.
        </p>

        <div className="result-actions">
          <Button
            variant="primary"
            size="lg"
            onClick={onResume}
            icon={<Play size={18} />}
          >
            Resume (P)
          </Button>
          <Button
            variant="ghost"
            size="md"
            onClick={onQuit}
            icon={<LogOut size={16} />}
          >
            Quit to Menu
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default PauseOverlay;

