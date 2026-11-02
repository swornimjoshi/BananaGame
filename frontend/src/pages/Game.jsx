import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../hooks/useGame';
import { useAuth } from '../context/AuthContext';
import NumberPad from '../components/NumberPad';
import Timer from '../components/Timer';
import Mascot from '../components/Mascot';
import Button from '../components/Button';
import MatchIntro from '../components/MatchIntro';
import FloatingPoints from '../components/FloatingPoints';
import ResultOverlay from '../components/overlays/ResultOverlay';
import PauseOverlay from '../components/overlays/PauseOverlay';
import ExpiredOverlay from '../components/overlays/ExpiredOverlay';
import RoundSummaryOverlay from '../components/overlays/RoundSummaryOverlay';
import {
  Flame, Star, Trophy, Volume2, VolumeX, Lightbulb,
  Pause, Maximize2, Minimize2, Heart, Play, Zap
} from 'lucide-react';
import { playClickSound, isSoundEnabled, toggleSound } from '../utils/audio';

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
  const [showMatchIntro, setShowMatchIntro] = useState(false);

  useEffect(() => {
    if (currentSession?.questionUrl) {
      const bestUrl = currentSession.questionDataUri || currentSession.questionUrl;
      setImgSrc(bestUrl);
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

  // Keyboard navigation support (0-9 for numbers, P/Esc for pause)
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

  const handleStartWithIntro = (mode, diff) => {
    setShowMatchIntro(true);
    startNewGame(mode, diff);
  };

  const getMultiplierLabel = () => {
    if (streak >= 10) return '3×';
    if (streak >= 6) return '2×';
    if (streak >= 3) return '1.5×';
    return null;
  };

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
      {/* ── Match Countdown Intro ───────────────────────────────────── */}
      <AnimatePresence>
        {showMatchIntro && isPlaying && (
          <MatchIntro onComplete={() => setShowMatchIntro(false)} />
        )}
      </AnimatePresence>

      {/* ── 1. Slim Top Bar ────────────────────────────────────────── */}
      <div className="game-stats-bar" role="region" aria-label="Game Status Bar">
        {/* Score Chip */}
        <div className="stat-chip" title="Current Score">
          <Star size={16} className="stat-icon banana-text" />
          <span>{score.toLocaleString()}</span>
          <span className="stat-label">{gameMode === 'practice' ? 'Practice' : 'Score'}</span>
        </div>

        {/* Dynamic Streak Flame Chip */}
        <div className="stat-chip" title={`Current streak: ${streak}`}>
          <motion.span
            animate={{ scale: streak > 0 ? [1, 1.15, 1] : 1 }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            style={{ display: 'inline-flex' }}
          >
            <Flame
              size={16}
              className="stat-icon"
              style={{ color: streak > 0 ? 'var(--color-streak)' : 'var(--color-text-muted)' }}
            />
          </motion.span>
          <span style={{ color: streak > 0 ? 'var(--color-streak)' : undefined, fontWeight: 800 }}>
            {streak}
          </span>
          <span className="stat-label">Streak</span>
          {getMultiplierLabel() && (
            <span className="mult-badge">
              {getMultiplierLabel()}
            </span>
          )}
        </div>

        {/* Lives Mode: Heart Indicators */}
        {gameMode === 'lives' && (
          <div className="stat-chip lives-chip" aria-label={`${lives} lives remaining`}>
            {[1, 2, 3].map((heart) => (
              <Heart
                key={heart}
                size={16}
                fill={heart <= lives ? '#EE1515' : 'none'}
                color={heart <= lives ? '#EE1515' : 'var(--color-text-muted)'}
              />
            ))}
            <span className="stat-label">Lives</span>
          </div>
        )}

        {/* Round Mode: 10-step progress bar */}
        {gameMode === 'round' && (
          <div className="stat-chip round-chip" aria-label={`Puzzle ${Math.min(10, puzzleCount)} of 10`}>
            <span style={{ color: 'var(--color-info)', fontWeight: 800 }}>
              {Math.min(10, puzzleCount)}/10
            </span>
            <span className="stat-label">Round</span>
          </div>
        )}

        {/* Best Streak Chip */}
        <div className="stat-chip" title={`Best streak: ${bestStreak}`}>
          <Trophy size={16} className="stat-icon" style={{ color: 'var(--color-bonus)' }} />
          <span style={{ color: 'var(--color-bonus)' }}>{bestStreak}</span>
          <span className="stat-label">Best</span>
        </div>

        {/* Single Icon-Only Pause Button */}
        {isPlaying && (
          <button
            type="button"
            className="stat-chip pause-btn"
            onClick={pauseGame}
            title="Pause game (P or Esc)"
            aria-label="Pause game"
          >
            <Pause size={16} className="banana-text" />
            <span className="stat-label">Pause</span>
          </button>
        )}

        {/* Sound Toggle Button */}
        <button
          type="button"
          className="stat-chip sound-toggle-btn"
          onClick={handleToggleSound}
          title={soundOn ? 'Mute sound effects' : 'Unmute sound effects'}
          aria-label={soundOn ? 'Mute sound effects' : 'Unmute sound effects'}
        >
          {soundOn ? (
            <Volume2 size={16} className="banana-text" />
          ) : (
            <VolumeX size={16} style={{ color: 'var(--color-text-muted)' }} />
          )}
          <span className="stat-label">{soundOn ? 'Sound' : 'Muted'}</span>
        </button>
      </div>

      {/* ── 2. Game Area ───────────────────────────────────────────── */}
      <div className="game-area">
        <AnimatePresence mode="wait">
          {/* Start Screen with Mode & Difficulty Selectors */}
          {gameState === 'idle' && (
            <motion.div
              key="idle"
              className="start-screen glass-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="start-mascot-hero">
                <Mascot state="cheering" size={120} />
              </div>
              <h2 className="start-title">Banana Math Challenge ⚡</h2>
              <p className="start-desc">
                Pikachu Electric Lab: Find the missing digit (0–9) to balance the equation before the timer runs out!
              </p>

              {/* Mode Selector */}
              <div className="selector-group">
                <span className="selector-label">Select Mode</span>
                <div className="mode-toggle-bar">
                  {[
                    { id: 'classic', label: '⚡ Classic' },
                    { id: 'round', label: '🎯 10-Round' },
                    { id: 'lives', label: '❤️ 3 Lives' },
                    { id: 'practice', label: '🌱 Practice' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      className={`mode-btn ${gameMode === m.id ? 'active' : ''}`}
                      onClick={() => setGameMode(m.id)}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty Timer Selector */}
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
                      type="button"
                      className={`diff-btn ${difficulty === d.id ? 'active' : ''}`}
                      onClick={() => setDifficulty(d.id)}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Start Playing CTA with Arcade Countdown */}
              <Button
                id="start-game-btn"
                variant="primary"
                size="lg"
                onClick={() => handleStartWithIntro()}
                icon={<Play size={20} />}
                className="btn-full"
                style={{ marginTop: '1.25rem' }}
              >
                Start Playing ({gameMode.toUpperCase()})
              </Button>
              <p className="keyboard-hint" style={{ marginTop: '0.8rem' }}>
                💡 Tip: Press <kbd>P</kbd> or <kbd>Esc</kbd> anytime to Pause!
              </p>
            </motion.div>
          )}

          {/* Loading Screen */}
          {gameState === 'loading' && (
            <motion.div
              key="loading"
              className="loading-screen glass-card"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ padding: '2.5rem', textAlign: 'center' }}
            >
              <Mascot state="thinking" size={110} />
              <p style={{ marginTop: '1rem', fontWeight: 700, color: 'var(--color-text)' }}>
                Charging up the equation on the chalkboard... ⚡
              </p>
            </motion.div>
          )}

          {/* Active Question Screen */}
          {isLoaded && currentSession && (
            <motion.div
              key="question"
              className="question-area"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              {/* ── A. Chalkboard Puzzle Card ────────────────────────── */}
              <motion.div
                className={`question-card glass-card ${isAnswering ? 'answering' : ''} ${isShaking ? 'shake-vibrate' : ''} ${gameState === 'correct' ? 'card-correct-flash' : ''}`}
              >
                <div className="question-header-row">
                  <span className="question-hint">
                    ⚡ Chalkboard Lab: What digit balances the equation?
                  </span>
                  <button
                    type="button"
                    className="zoom-toggle-btn"
                    onClick={() => setIsZoomed(!isZoomed)}
                    title={isZoomed ? 'Shrink Image' : 'Zoom Puzzle Image'}
                    aria-label={isZoomed ? 'Shrink puzzle image' : 'Zoom puzzle image'}
                  >
                    {isZoomed ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                    <span>{isZoomed ? 'Reset' : 'Zoom'}</span>
                  </button>
                </div>

                {/* Banana Puzzle Image with Skeleton Loader */}
                <div className={`question-image-wrap ${isZoomed ? 'image-enlarged' : ''}`}>
                  {imgLoading && (
                    <div className="img-skeleton" aria-live="polite">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                        style={{ fontSize: '2rem' }}
                      >
                        🍌
                      </motion.div>
                      <span>Drafting puzzle equation...</span>
                    </div>
                  )}

                  <img
                    src={imgSrc || currentSession.questionUrl}
                    alt="Banana math equation puzzle. Solve for the missing digit."
                    className={`question-img ${imgLoading ? 'img-hidden' : ''}`}
                    onClick={() => setIsZoomed(!isZoomed)}
                    title="Tap to zoom"
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
                      <p>Image loading slowly?</p>
                      <button
                        type="button"
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

              {/* ── B. Thick Horizontal Timer Bar ─────────────────────── */}
              <div className="timer-center">
                <Timer
                  timeLeft={timeLeft}
                  totalTime={difficulty === 'easy' ? 45 : difficulty === 'hard' ? 18 : 30}
                  isPractice={gameMode === 'practice'}
                />
              </div>

              {/* ── C. Lightbulb Hint Button & Mascot Speech Bubbles ─── */}
              <div className="hints-container">
                {hints.length > 0 && (
                  <motion.div
                    className="hints-stack"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {hints.map((h, i) => (
                      <motion.div
                        key={i}
                        className="hint-bubble"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        <div className="hint-header">
                          <span className="hint-badge">💡 Hint {h.step}/3: {h.title}</span>
                          <span className="hint-penalty">-{h.penalty} pts</span>
                        </div>
                        <p className="hint-text">"{h.text}"</p>
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                <button
                  type="button"
                  className={`btn-hint ${hints.length >= 3 ? 'btn-hint-max' : ''}`}
                  onClick={requestHint}
                  disabled={!isPlaying || isHintLoading || hints.length >= 3}
                  title={hints.length >= 3 ? 'All 3 hints used' : 'Request hint from Pikachu'}
                >
                  <Lightbulb size={16} />
                  <span>
                    {isHintLoading
                      ? 'Charging up hint...'
                      : hints.length === 0
                      ? 'Hint 1: Type & Range (-15 pts)'
                      : hints.length === 1
                      ? 'Hint 2: Eliminate 4 Numbers (-35 pts)'
                      : hints.length === 2
                      ? 'Hint 3: 50/50 Showdown (-60 pts)'
                      : '✓ All 3 Hints Used'}
                  </span>
                </button>
              </div>

              {/* Dynamic Floating Points Indicator */}
              <AnimatePresence>
                {lastResult?.scoreEarned > 0 && lastResult?.correct && (
                  <FloatingPoints
                    key={lastResult.scoreEarned + Date.now()}
                    points={lastResult.scoreEarned}
                    combo={streak}
                    isSpeed={lastResult?.breakdown?.timeBonus > 0}
                  />
                )}
              </AnimatePresence>

              {/* ── D. 5x2 Touch-Friendly Number Pad (Thumb Zone) ─────── */}
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

          {/* Overlays */}
          {isPaused && (
            <PauseOverlay onResume={resumeGame} onQuit={resetToIdle} />
          )}

          {roundCompleted && (
            <RoundSummaryOverlay
              score={score}
              puzzleCount={puzzleCount}
              onPlayAgain={() => { resetToIdle(); startNewGame('round'); }}
              onQuit={resetToIdle}
            />
          )}

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
