import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Eye, ChevronDown, ChevronUp, Sparkles, Flame, CheckCircle, XCircle } from 'lucide-react';
import Mascot from '../Mascot';
import Button from '../Button';

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

  return (
    <div className="overlay-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="result-heading">
      <motion.div
        className={`result-overlay ${isCorrect ? 'result-correct' : 'result-wrong'}`}
        initial={{ opacity: 0, scale: 0.85, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', stiffness: 320, damping: 25 }}
      >
        {/* Mascot Reaction */}
        <div className="result-mascot-wrap">
          <Mascot
            state={isCorrect ? 'cheering' : 'headshake'}
            size={110}
            className="result-mascot-fig"
          />
        </div>

        {/* Heading & Outcome */}
        <div className="result-header-text">
          <div className="result-status-pill">
            {isCorrect ? (
              <span className="status-badge-correct">
                <CheckCircle size={18} /> Brilliant!
              </span>
            ) : (
              <span className="status-badge-wrong">
                <XCircle size={18} /> Not quite — let's learn why!
              </span>
            )}
          </div>
          <h2 id="result-heading" className="result-title">
            {isCorrect ? 'Correct Equation!' : 'Good Effort!'}
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
                <span>{streak} in a Row!</span>
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
                  <span>{showBreakdown ? 'Hide score breakdown' : 'See score breakdown'}</span>
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
                        <span>Base points</span>
                        <span className="breakdown-val">+{breakdown.baseScore || 100}</span>
                      </div>
                      {breakdown.timeBonus > 0 && (
                        <div className="breakdown-row bonus-speed">
                          <span>Speed bonus</span>
                          <span className="breakdown-val">+{breakdown.timeBonus}</span>
                        </div>
                      )}
                      {breakdown.multiplier > 1 && (
                        <div className="breakdown-row bonus-streak">
                          <span>Streak multiplier</span>
                          <span className="breakdown-val">{breakdown.multiplier}×</span>
                        </div>
                      )}
                      {breakdown.hintPenalty > 0 && (
                        <div className="breakdown-row penalty-hint">
                          <span>Hint deduction</span>
                          <span className="breakdown-val">-{breakdown.hintPenalty}</span>
                        </div>
                      )}
                      <div className="breakdown-total">
                        <span>Total added</span>
                        <span className="breakdown-total-val">+{result.scoreEarned} pts</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}

        {/* Wrong Answer Educational Card */}
        {!isCorrect && (
          <div className="result-wrong-details">
            <p className="result-answer">
              The puzzle digit was <strong className="correct-answer-spotlight">{result?.correctAnswer}</strong>
            </p>
            <p className="mistake-note">💡 Streak reset, but you can try another one!</p>

            {/* Reveal explanation button */}
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
                <span className="revealed-title">💡 Professor Chimpy's Solution:</span>
                <p className="revealed-text">
                  {result?.explanation || `Balance each banana item to find the missing digit: the answer is ${result?.correctAnswer}.`}
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
            <span>💡 {result.hintsUsed} hint{result.hintsUsed > 1 ? 's' : ''} used</span>
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
