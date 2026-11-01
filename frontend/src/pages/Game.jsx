import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../hooks/useGame';
import { useAuth } from '../context/AuthContext';
import NumberPad from '../components/NumberPad';
import Timer from '../components/Timer';
import {
  Flame, Star, Trophy, Zap, RotateCcw, Play, Volume2, VolumeX, Lightbulb,
  Pause, Maximize2, Minimize2, Heart, Award, HelpCircle, Eye, Sun, Moon
} from 'lucide-react';
import { playClickSound, isSoundEnabled, toggleSound } from '../utils/audio';

// ─── Sub-components ───────────────────────────────────────────────────────────

const ScorePopup = ({ amount }) => (
  <motion.div
    className="score-popup"
    initial={{ opacity: 1, y: 0, scale: 1 }}
    animate={{ opacity: 0, y: -60, scale: 1.3 }}
    transition={{ duration: 1, ease: 'easeOut' }}
  >
    +{amount}
  </motion.div>
);

const ResultOverlay = ({ result, streak, onNext, onQuit, onRevealSolution, revealedSolution }) => {
  const isCorrect = result?.correct;
  const breakdown = result?.breakdown;

  return (
    <motion.div
      className={`result-overlay ${isCorrect ? 'result-correct' : 'result-wrong'}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <motion.div
        className="result-emoji"
        animate={{
          rotate: isCorrect ? [0, -15, 15, -10, 10, 0] : [0, -12, 12, -8, 8, 0],
          scale: isCorrect ? [1, 1.3, 1] : [1, 0.9, 1],
        }}
        transition={{ duration: 0.6 }}
      >
        {isCorrect ? '🎉' : '💥'}
      </motion.div>
      <h2 className="result-title">{isCorrect ? 'Correct!' : 'Wrong Answer!'}</h2>

      {isCorrect && result?.scoreEarned > 0 && (
        <div className="result-score-box">
          <div className="result-score">+{result.scoreEarned} pts</div>

          {/* Point System Breakdown */}
          {breakdown && (
            <div className="point-breakdown-card">
              <div className="breakdown-row">
                <span>Base Points:</span>
                <span className="banana-text">+{breakdown.baseScore}</span>
              </div>
              {breakdown.timeBonus > 0 && (
                <div className="breakdown-row">
                  <span>Speed Bonus:</span>
                  <span style={{ color: 'var(--color-orange)' }}>+{breakdown.timeBonus}</span>
                </div>
              )}
              {breakdown.multiplier > 1 && (
                <div className="breakdown-row">
                  <span>Streak Multiplier:</span>
                  <span style={{ color: 'var(--color-purple)' }}>{breakdown.multiplier}×</span>
                </div>
              )}
              {breakdown.hintPenalty > 0 && (
                <div className="breakdown-row">
                  <span>Hint Deduction:</span>
                  <span style={{ color: '#ef4444' }}>-{breakdown.hintPenalty}</span>
                </div>
              )}
              <div className="breakdown-total">
                <span>Total Added to Score:</span>
                <span className="banana-text">+{result.scoreEarned} pts</span>
              </div>
            </div>
          )}
        </div>
      )}

      {!isCorrect && (
        <div className="result-wrong-details">
          <p className="result-answer">
            The correct answer was <strong className="banana-text">{result?.correctAnswer}</strong>
          </p>
          <p className="mistake-note">❌ 0 points awarded & streak reset.</p>

          {/* Reveal & Learn Option */}
          {!revealedSolution ? (
            <motion.button
              className="btn btn-sm btn-ghost reveal-sol-btn"
              onClick={onRevealSolution}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Eye size={14} /> Reveal Solution Explanation
            </motion.button>
          ) : (
            <div className="revealed-box glass-card">
              <span className="revealed-title">💡 How to solve:</span>
              <p className="revealed-text">{result?.explanation || `Find the missing variable balancing the equation. The answer is ${result?.correctAnswer}.`}</p>
            </div>
          )}
        </div>
      )}

      {/* Educational Explanation for correct answers too */}
      {isCorrect && result?.explanation && (
        <div className="explanation-box">
          <p className="explanation-text">💡 {result.explanation}</p>
        </div>
      )}

      {/* Hints used count badge */}
      {result?.hintsUsed > 0 && (
        <div className="hints-used-badge">
          <span>💡 {result.hintsUsed} hint{result.hintsUsed > 1 ? 's' : ''} used</span>
        </div>
      )}

      {isCorrect && streak >= 2 && (
        <div className="result-streak">
          <motion.span
            animate={{ scale: [1, 1.25, 1], rotate: [-6, 6, -6, 0] }}
            transition={{ repeat: Infinity, duration: 1 }}
          >
            🔥
          </motion.span>
          <span>{streak} Streak!</span>
          {streak >= 3 && (
            <span className="streak-mult">
              {' '}
              {streak >= 10 ? '3×' : streak >= 6 ? '2×' : '1.5×'} multiplier
            </span>
          )}
        </div>
      )}

      <div className="result-actions">
        <motion.button
          className="btn btn-primary"
          onClick={onNext}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          id="next-question-btn"
        >
          <Play size={16} /> Next Question
        </motion.button>
        <motion.button
          className="btn btn-ghost"
          onClick={onQuit}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Quit
        </motion.button>
      </div>
    </motion.div>
  );
};

const ExpiredOverlay = ({ onNext, onQuit }) => (
  <motion.div
    className="result-overlay result-expired"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
  >
    <div className="result-emoji">⏰</div>
    <h2 className="result-title">Time's Up!</h2>
    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
      Streak reset. Keep practicing!
    </p>
    <div className="result-actions">
      <motion.button className="btn btn-primary" onClick={onNext} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} id="try-again-btn">
        <RotateCcw size={16} /> Try Again
      </motion.button>
      <motion.button className="btn btn-ghost" onClick={onQuit} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        Quit
      </motion.button>
    </div>
  </motion.div>
);

const PauseOverlay = ({ onResume, onQuit }) => (
  <motion.div
    className="result-overlay result-paused glass-card"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
  >
    <div className="result-emoji">⏸</div>
    <h2 className="result-title">Game Paused</h2>
    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
      Take your time. Timer is safely frozen.
    </p>
    <div className="result-actions">
      <motion.button className="btn btn-primary" onClick={onResume} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Play size={16} /> Resume Game
      </motion.button>
      <motion.button className="btn btn-ghost" onClick={onQuit} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        Quit to Menu
      </motion.button>
    </div>
  </motion.div>
);

const RoundSummaryOverlay = ({ score, puzzleCount, onPlayAgain, onQuit }) => (
  <motion.div
    className="result-overlay glass-card"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
  >
    <div className="result-emoji">🏆</div>
    <h2 className="result-title">10-Puzzle Round Complete!</h2>
    <div className="result-score">Final Score: {score} pts</div>
    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
      You successfully completed all 10 puzzles!
    </p>
    <div className="result-actions">
      <motion.button className="btn btn-primary" onClick={onPlayAgain} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <RotateCcw size={16} /> Play Another Round
      </motion.button>
      <motion.button className="btn btn-ghost" onClick={onQuit} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        Quit
      </motion.button>
    </div>
  </motion.div>
);

// ─── Main Game Page ───────────────────────────────────────────────────────────

const Game = () => {
  const { user } = useAuth();
  const {
    gameState, currentSession, score, streak, bestStreak,
    lastResult, timeLeft, isLoading,
    gameMode, setGameMode, difficulty, setDifficulty,
    lives, puzzleCount, roundCompleted, revealedSolution,
    hints, eliminatedDigits, isHintLoading, isShaking,
    pauseGame, resumeGame, revealSolutionAfterWrong,
    startNewGame, requestHint, submitAnswer, resetToIdle,
  } = useGame(0, 0, 0);

  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [imgSrc, setImgSrc] = useState(null);
  const [imgLoading, setImgLoading] = useState(true);
  const [imgFailedDirect, setImgFailedDirect] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    if (currentSession?.questionUrl) {
      const bestUrl = currentSession.questionDataUri || currentSession.questionUrl;
      setImgSrc(bestUrl);
      // If we have an instant data URI, it's already in memory!
      if (bestUrl.startsWith('data:')) {
        setImgLoading(false);
      } else {
        setImgLoading(true);
      }
      setImgFailedDirect(false);
      setIsZoomed(false);
    }
  }, [currentSession?.sessionId, currentSession?.questionUrl, currentSession?.questionDataUri]);

  const handleToggleSound = () => {
    const updated = toggleSound();
    setSoundOn(updated);
    if (updated) playClickSound();
  };

  // Keyboard support (skips numbers eliminated by hints)
  useEffect(() => {
    const handler = (e) => {
      if (gameState === 'playing' && e.key >= '0' && e.key <= '9') {
        const digit = parseInt(e.key, 10);
        if (!eliminatedDigits.includes(digit)) {
          playClickSound();
          submitAnswer(digit);
        }
      } else if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        if (gameState === 'playing') pauseGame();
        else if (gameState === 'paused') resumeGame();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [gameState, submitAnswer, eliminatedDigits, pauseGame, resumeGame]);

  const getMultiplierLabel = () => {
    if (streak >= 10) return '3×';
    if (streak >= 6) return '2×';
    if (streak >= 3) return '1.5×';
    return null;
  };

  // Flame growth scale
  const flameScale = Math.min(1.8, 1 + streak * 0.08);

  const isPlaying = gameState === 'playing';
  const isPaused = gameState === 'paused';
  const isAnswering = gameState === 'answering';
  const isLoaded = isPlaying || isAnswering || isPaused;
  const showResult = gameState === 'correct' || gameState === 'wrong';
  const showExpired = gameState === 'expired';

  return (
    <motion.div
      className="game-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Stats bar */}
      <div className="game-stats-bar">
        <div className="stat-chip">
          <Star size={14} className="stat-icon banana-text" />
          <span>{score.toLocaleString()}</span>
          <span className="stat-label">{gameMode === 'practice' ? 'Practice' : 'Score'}</span>
        </div>

        {/* Dynamic flame icon that grows with streak */}
        <div className="stat-chip">
          <motion.span
            animate={{ scale: [flameScale, flameScale * 1.15, flameScale], rotate: [-4, 4, -4, 0] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            style={{ display: 'inline-block' }}
          >
            <Flame size={14} className="stat-icon" style={{ color: streak > 0 ? '#f97316' : 'var(--text-muted)' }} />
          </motion.span>
          <span style={{ color: streak > 0 ? '#f97316' : undefined, fontWeight: 700 }}>{streak}</span>
          <span className="stat-label">Streak</span>
          {getMultiplierLabel() && (
            <motion.span
              className="mult-badge"
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
            >
              {getMultiplierLabel()}
            </motion.span>
          )}
        </div>

        {/* Lives mode display */}
        {gameMode === 'lives' && (
          <div className="stat-chip lives-chip">
            {[1, 2, 3].map((heart) => (
              <Heart
                key={heart}
                size={14}
                fill={heart <= lives ? '#ef4444' : 'none'}
                color={heart <= lives ? '#ef4444' : 'var(--text-muted)'}
              />
            ))}
            <span className="stat-label">Lives</span>
          </div>
        )}

        {/* Round puzzle progress */}
        {gameMode === 'round' && (
          <div className="stat-chip">
            <span style={{ color: 'var(--color-cyan)', fontWeight: 700 }}>{Math.min(10, puzzleCount)}/10</span>
            <span className="stat-label">Puzzle</span>
          </div>
        )}

        <div className="stat-chip">
          <Trophy size={14} className="stat-icon" style={{ color: 'var(--color-purple)' }} />
          <span style={{ color: 'var(--color-purple)' }}>{bestStreak}</span>
          <span className="stat-label">Best</span>
        </div>

        {/* Pause Button */}
        {isPlaying && (
          <motion.button
            className="stat-chip pause-btn"
            onClick={pauseGame}
            title="Pause game (P)"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Pause size={14} className="banana-text" />
            <span className="stat-label">Pause</span>
          </motion.button>
        )}

        <motion.button
          className="stat-chip sound-toggle-btn"
          onClick={handleToggleSound}
          title={soundOn ? 'Mute Sound' : 'Enable Sound'}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.06)', border: 'none' }}
        >
          {soundOn ? <Volume2 size={15} className="banana-text" /> : <VolumeX size={15} style={{ color: 'var(--text-muted)' }} />}
          <span className="stat-label">{soundOn ? 'Sound' : 'Muted'}</span>
        </motion.button>
      </div>

      {/* Game area */}
      <div className="game-area">
        <AnimatePresence mode="wait">

          {/* Idle / Start screen with Mode & Difficulty Selectors */}
          {(gameState === 'idle') && (
            <motion.div
              key="idle"
              className="start-screen glass-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <motion.div
                className="start-banana"
                animate={{ y: [-8, 8, -8], rotate: [-5, 5, -5] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
              >
                🍌
              </motion.div>
              <h2 className="start-title">Ready to Play?</h2>
              <p className="start-desc">
                Find the missing digit in the banana puzzle!<br />
                Use the compact pad below or keyboard (0–9).
              </p>

              {/* Mode Selector */}
              <div className="selector-group">
                <span className="selector-label">Game Mode</span>
                <div className="mode-toggle-bar">
                  {[
                    { id: 'classic', label: '⚡ Classic' },
                    { id: 'round', label: '🎯 10-Round' },
                    { id: 'lives', label: '❤️ 3 Lives' },
                    { id: 'practice', label: '🌱 Practice' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      className={`mode-btn ${gameMode === m.id ? 'active' : ''}`}
                      onClick={() => setGameMode(m.id)}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty Selector */}
              <div className="selector-group">
                <span className="selector-label">Difficulty Timer</span>
                <div className="diff-toggle-bar">
                  {[
                    { id: 'easy', label: 'Easy (45s)' },
                    { id: 'normal', label: 'Normal (30s)' },
                    { id: 'hard', label: 'Hard (18s)' },
                  ].map((d) => (
                    <button
                      key={d.id}
                      className={`diff-btn ${difficulty === d.id ? 'active' : ''}`}
                      onClick={() => setDifficulty(d.id)}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              <motion.button
                id="start-game-btn"
                className="btn btn-primary btn-lg"
                onClick={() => startNewGame()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{ marginTop: '1rem' }}
              >
                <Play size={20} /> Start Playing ({gameMode})
              </motion.button>
              <p className="keyboard-hint" style={{ marginTop: '0.8rem' }}>💡 Tip: Press P or Esc anytime to Pause!</p>
            </motion.div>
          )}

          {/* Loading */}
          {gameState === 'loading' && (
            <motion.div key="loading" className="loading-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div
                className="loading-banana"
                animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                transition={{ rotate: { repeat: Infinity, duration: 1, ease: 'linear' }, scale: { repeat: Infinity, duration: 0.8 } }}
              >
                🍌
              </motion.div>
              <p style={{ color: 'var(--text-secondary)' }}>Loading puzzle from Banana API...</p>
            </motion.div>
          )}

          {/* Playing / Answering / Paused */}
          {isLoaded && currentSession && (
            <motion.div
              key="question"
              className="question-area"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              {/* Timer Bar with Pause option */}
              <div className="timer-center" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Timer
                  timeLeft={timeLeft}
                  totalTime={difficulty === 'easy' ? 45 : difficulty === 'hard' ? 18 : 30}
                  isPractice={gameMode === 'practice'}
                />
                <motion.button
                  className="pause-pill-btn"
                  onClick={isPaused ? resumeGame : pauseGame}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  title="Pause / Resume"
                >
                  {isPaused ? <Play size={16} /> : <Pause size={16} />}
                </motion.button>
              </div>

              {/* Scaled Question Image Card with Enlarge / Zoom Modal on tap */}
              <motion.div
                className={`question-card glass-card ${isAnswering ? 'answering' : ''} ${isShaking ? 'shake-vibrate' : ''} ${gameState === 'correct' ? 'card-correct-flash' : ''}`}
                animate={
                  isShaking
                    ? {
                        x: [-16, 16, -12, 12, -8, 8, -4, 4, 0],
                        transition: { duration: 0.55, ease: 'easeInOut' },
                      }
                    : isAnswering
                    ? { opacity: 0.7 }
                    : { opacity: 1 }
                }
              >
                <div className="question-header-row">
                  <p className="question-hint">Find the missing digit 🍌</p>
                  <button
                    className="zoom-toggle-btn"
                    onClick={() => setIsZoomed(!isZoomed)}
                    title={isZoomed ? 'Shrink' : 'Zoom / Enlarge Puzzle'}
                  >
                    {isZoomed ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                    <span>{isZoomed ? 'Normal' : 'Zoom'}</span>
                  </button>
                </div>

                <div className={`question-image-wrap ${isZoomed ? 'image-enlarged' : ''}`}>
                  {imgLoading && (
                    <div className="img-skeleton">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                        style={{ fontSize: '1.8rem' }}
                      >
                        🍌
                      </motion.div>
                      <span>Loading puzzle...</span>
                    </div>
                  )}
                  <img
                    src={imgSrc || currentSession.questionUrl}
                    alt="Banana math puzzle — tap to zoom"
                    className={`question-img ${imgLoading ? 'img-hidden' : ''}`}
                    onClick={() => setIsZoomed(!isZoomed)}
                    title="Tap image to zoom in"
                    onLoad={() => setImgLoading(false)}
                    onError={() => {
                      if (!imgFailedDirect && currentSession.directQuestionUrl && imgSrc !== currentSession.directQuestionUrl) {
                        setImgFailedDirect(true);
                        setImgSrc(currentSession.directQuestionUrl);
                      } else {
                        setImgLoading(false);
                      }
                    }}
                  />
                  {!imgLoading && imgFailedDirect && (
                    <div className="img-error-box" style={{ marginTop: '0.5rem' }}>
                      <p>Image taking longer to load?</p>
                      <button
                        className="btn btn-sm btn-ghost"
                        onClick={() => {
                          setImgLoading(true);
                          setImgSrc(`${currentSession.questionUrl}?retry=${Date.now()}`);
                        }}
                      >
                        Retry Loading
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* 3-Step Hint Section */}
              <div className="hints-container">
                {/* Active Hints Stack */}
                {hints.length > 0 && (
                  <motion.div
                    className="hints-stack"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {hints.map((h, i) => (
                      <motion.div
                        key={i}
                        className="hint-bubble glass-card"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        <div className="hint-header">
                          <span className="hint-badge">💡 Hint {h.step}/3</span>
                          <span className="hint-penalty">-{h.penalty} pts</span>
                        </div>
                        <p className="hint-text">{h.text}</p>
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {/* Hint Request Button with escalating cost indicators */}
                <motion.button
                  className={`btn-hint ${hints.length >= 3 ? 'btn-hint-max' : ''}`}
                  onClick={requestHint}
                  disabled={!isPlaying || isHintLoading || hints.length >= 3}
                  whileHover={isPlaying && hints.length < 3 ? { scale: 1.03 } : {}}
                  whileTap={isPlaying && hints.length < 3 ? { scale: 0.97 } : {}}
                  title={hints.length >= 3 ? 'All 3 hints used' : 'Request progressive hint'}
                >
                  <Lightbulb size={16} />
                  <span>
                    {isHintLoading
                      ? 'Revealing hint...'
                      : hints.length === 0
                      ? '💡 Hint 1: Type & Range (-15 pts)'
                      : hints.length === 1
                      ? '💡 Hint 2: Eliminate 4 Numbers (-35 pts)'
                      : hints.length === 2
                      ? '💡 Hint 3: 50/50 Showdown (-60 pts)'
                      : '✓ All 3 Hints Used'}
                  </span>
                </motion.button>
              </div>

              {/* Score popup */}
              <AnimatePresence>
                {lastResult?.scoreEarned > 0 && lastResult?.correct && (
                  <ScorePopup key={lastResult.scoreEarned + Date.now()} amount={lastResult.scoreEarned} />
                )}
              </AnimatePresence>

              {/* Compact 5x2 Number Pad (0 key is always on-screen and visible) */}
              <NumberPad
                onPress={submitAnswer}
                disabled={!isPlaying}
                disabledDigits={eliminatedDigits}
              />
              <p className="keyboard-hint" style={{ textAlign: 'center', marginTop: '0.4rem' }}>
                Press <kbd>0–9</kbd> on keyboard | <kbd>P</kbd> to Pause
              </p>
            </motion.div>
          )}

          {/* Pause Modal Overlay */}
          {isPaused && (
            <PauseOverlay onResume={resumeGame} onQuit={resetToIdle} />
          )}

          {/* Round Complete Modal Overlay */}
          {roundCompleted && (
            <RoundSummaryOverlay
              score={score}
              puzzleCount={puzzleCount}
              onPlayAgain={() => { resetToIdle(); startNewGame('round'); }}
              onQuit={resetToIdle}
            />
          )}

          {/* Result overlays with Explanation and Reveal Solution options */}
          {showResult && !roundCompleted && (
            <ResultOverlay
              key="result"
              result={lastResult}
              streak={streak}
              revealedSolution={revealedSolution}
              onRevealSolution={revealSolutionAfterWrong}
              onNext={() => startNewGame()}
              onQuit={resetToIdle}
            />
          )}

          {showExpired && !roundCompleted && (
            <ExpiredOverlay onNext={() => startNewGame()} onQuit={resetToIdle} />
          )}

        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Game;
