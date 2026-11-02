import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Eye, ChevronDown, ChevronUp, Flame, CheckCircle, XCircle, Zap, Award } from 'lucide-react';
import Mascot from '../Mascot';
import Button from '../Button';

// Grade tier calculator
const getGradeTier = (scoreEarned, isCorrect) => {
  if (!isCorrect) return { grade: 'D', label: 'Try Again', color: '#FF8C00' };
  if (scoreEarned >= 300) return { grade: 'S', label: 'SUPERCHARGED!', color: '#FFDE00', glow: true };
  if (scoreEarned >= 200) return { grade: 'A', label: 'EXCELLENT!', color: '#00C2FF' };
  if (scoreEarned >= 150) return { grade: 'B', label: 'GREAT SPEED!', color: '#2EAA34' };
  return { grade: 'C', label: 'SOLVED!', color: '#E5A800' };
};

const ResultOverlay = ({
  result,
  streak,
  onNext,
  onQuit,
  onRevealSolution,
  revealedSolution
}) => {
  const isCorrect = result?.correct;
  const breakdown = result?.breakdown;
  const [showBreakdown, setShowBreakdown] = useState(false);

  const gradeInfo = getGradeTier(result?.scoreEarned || 0, isCorrect);

  return (
    <div className="overlay-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="result-heading">
      <motion.div
        className={`result-overlay ${isCorrect ? 'result-correct' : 'result-wrong'}`}
        initial={{ opacity: 0, scale: 0.85, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', stiffness: 320, damping: 25 }}
      >
        {/* Pikachu Mascot Reaction */}
        <div className="result-mascot-wrap">
          <Mascot
            state={isCorrect ? (gradeInfo.grade === 'S' ? 'crowned' : 'cheering') : 'headshake'}
            size={115}
            className="result-mascot-fig"
          />
        </div>

        {/* Grade Tier Badge */}
        <div className="grade-tier-wrap">
          <span className={`grade-tier-badge grade-${gradeInfo.grade.toLowerCase()}`}>
            GRADE {gradeInfo.grade} • {gradeInfo.label}
          </span>
        </div>

        {/* Heading & Outcome */}
        <div className="result-header-text">
          <div className="result-status-pill">
            {isCorrect ? (
              <span className="status-badge-correct">
                <CheckCircle size={18} /> Pika-Powerful Solve! ⚡
              </span>
            ) : (
              <span className="status-badge-wrong">
                <XCircle size={18} /> Not quite — let's review the equation!
              </span>
            )}
          </div>
          <h2 id="result-heading" className="result-title">
            {isCorrect ? 'Correct Equation!' : 'Keep Charging Up!'}
          </h2>
        </div>

        {/* Score Display (Correct) */}
        {isCorrect && result?.scoreEarned > 0 && (
          <div className="result-score-box">
            <div className="result-score">+{result.scoreEarned} pts</div>

            {/* Streak Multiplier Badge */}
            {streak >= 2 && (
              <div className="result-streak">
                <Flame size={18} className="streak-fire" />
                <span>{streak} Streak!</span>
                {streak >= 3 && (
                  <span className="streak-mult-badge">
                    {streak >= 10 ? '3× Max' : streak >= 6 ? '2× Mult' : '1.5× Mult'}
                  </span>
                )}
              </div>
            )}

            {/* Collapsible Breakdown Toggle */}
            {breakdown && (
              <div className="breakdown-collapsible-wrapper">
                <button
                  type="button"
                  className="breakdown-toggle-btn"
                  onClick={() => setShowBreakdown(!showBreakdown)}
                  aria-expanded={showBreakdown}
                >
                  <span>{showBreakdown ? 'Hide point breakdown' : 'See point breakdown'}</span>
                  {showBreakdown ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                <AnimatePresence>
                  {showBreakdown && (
                    <motion.div
                      className="point-breakdown-card"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="breakdown-row">
                        <span>Base puzzle points</span>
                        <span className="breakdown-val">+{breakdown.baseScore || 100}</span>
                      </div>
                      {breakdown.timeBonus > 0 && (
                        <div className="breakdown-row bonus-speed">
                          <span>⚡ Quick solve bonus</span>
                          <span className="breakdown-val">+{breakdown.timeBonus}</span>
                        </div>
                      )}
                      {breakdown.multiplier > 1 && (
                        <div className="breakdown-row bonus-streak">
                          <span>🔥 Lightning streak multiplier</span>
                          <span className="breakdown-val">{breakdown.multiplier}×</span>
                        </div>
                      )}
                      {breakdown.hintPenalty > 0 && (
                        <div className="breakdown-row penalty-hint">
                          <span>💡 Hint deduction</span>
                          <span className="breakdown-val">-{breakdown.hintPenalty}</span>
                        </div>
                      )}
                      <div className="breakdown-total">
                        <span>Total added to bank</span>
                        <span className="breakdown-total-val">+{result.scoreEarned} pts</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}

        {/* Wrong Answer Review */}
        {!isCorrect && (
          <div className="result-wrong-details">
            <p className="result-answer">
              The correct digit was <strong className="correct-answer-spotlight">{result?.correctAnswer}</strong>
            </p>
            <p className="mistake-note">⚡ Streak discharged to 0, but you can charge right back up!</p>

            {!revealedSolution ? (
              <button
                type="button"
                className="btn btn-sm btn-ghost reveal-sol-btn"
                onClick={onRevealSolution}
              >
                <Eye size={15} /> Reveal Solution Explanation
              </button>
            ) : (
              <div className="revealed-box">
                <span className="revealed-title">💡 Pikachu Lab Solution:</span>
                <p className="revealed-text">
                  {result?.explanation || `Find the missing variable balancing each banana bunch: the answer is ${result?.correctAnswer}.`}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Explanation for correct answers too */}
        {isCorrect && result?.explanation && (
          <div className="explanation-box">
            <p className="explanation-text">💡 {result.explanation}</p>
          </div>
        )}

        {/* Hints used reminder */}
        {result?.hintsUsed > 0 && (
          <div className="hints-used-badge">
            <span>💡 {result.hintsUsed} hint{result.hintsUsed > 1 ? 's' : ''} consulted</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="result-actions">
          <Button
            id="next-question-btn"
            variant="primary"
            size="lg"
            onClick={onNext}
            icon={<Play size={18} />}
          >
            Next Puzzle
          </Button>
          <Button
            variant="ghost"
            size="md"
            onClick={onQuit}
          >
            Quit to Menu
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default ResultOverlay;
