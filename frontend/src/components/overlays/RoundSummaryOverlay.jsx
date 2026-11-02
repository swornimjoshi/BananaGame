import React from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Trophy, LogOut, Zap, Award } from 'lucide-react';
import Mascot from '../Mascot';
import Button from '../Button';

// Grade tier based on total round score
const getRoundGrade = (totalScore) => {
  if (totalScore >= 3500) return { grade: 'S', label: 'MASTER PIKACHU!', color: '#FFDE00' };
  if (totalScore >= 2500) return { grade: 'A', label: 'EXPERT SCIENTIST!', color: '#00C2FF' };
  if (totalScore >= 1800) return { grade: 'B', label: 'HONOR ROLL!', color: '#2EAA34' };
  if (totalScore >= 1000) return { grade: 'C', label: 'GOOD FINISH!', color: '#E5A800' };
  return { grade: 'D', label: 'TRAINING LAB', color: '#FF8C00' };
};

const RoundSummaryOverlay = ({ score, puzzleCount, onPlayAgain, onQuit }) => {
  const gradeInfo = getRoundGrade(score || 0);

  return (
    <div className="overlay-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="round-summary-title">
      <motion.div
        className="result-overlay glass-card"
        initial={{ opacity: 0, scale: 0.88, y: 20 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      >
        <div className="result-mascot-wrap">
          <Mascot state="crowned" size={130} />
        </div>

        {/* Grade Tier Badge */}
        <div className="grade-tier-wrap">
          <span className={`grade-tier-badge grade-${gradeInfo.grade.toLowerCase()}`}>
            TIER {gradeInfo.grade} • {gradeInfo.label}
          </span>
        </div>

        <div className="round-trophy-badge" aria-hidden="true">
          <Trophy size={18} /> 10-Puzzle Round Complete!
        </div>

        <h2 id="round-summary-title" className="result-title">Victory Lap! ⚡</h2>
        <div className="result-score">Final Score: {score?.toLocaleString()} pts</div>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
          Thunderous performance! You solved all 10 puzzles in this lab challenge.
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
