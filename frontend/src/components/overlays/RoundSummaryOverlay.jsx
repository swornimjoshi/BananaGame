import React from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Trophy, LogOut } from 'lucide-react';
import Mascot from '../Mascot';
import Button from '../Button';

const RoundSummaryOverlay = ({ score, puzzleCount, onPlayAgain, onQuit }) => {
  return (
    <div className="overlay-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="round-summary-title">
      <motion.div
        className="result-overlay glass-card"
        initial={{ opacity: 0, scale: 0.88, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      >
        <div className="result-mascot-wrap">
          <Mascot state="crowned" size={120} />
        </div>

        <div className="round-trophy-badge" aria-hidden="true">
          <Trophy size={20} /> Round Finished!
        </div>

        <h2 id="round-summary-title" className="result-title">10-Puzzle Round Complete!</h2>
        <div className="result-score">Final Score: {score?.toLocaleString()} pts</div>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
          Amazing job! You conquered all 10 puzzles in this lab session.
        </p>

        <div className="result-actions">
          <Button
            variant="primary"
            size="lg"
            onClick={onPlayAgain}
            icon={<RotateCcw size={18} />}
          >
            Play Another Round
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

export default RoundSummaryOverlay;
