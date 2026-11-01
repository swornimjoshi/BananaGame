import { useState, useCallback, useRef, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { playCorrectSound, playWrongSound, playTimeoutSound, playHintSound, vibrateDevice } from '../utils/audio';

// Game states: idle | loading | playing | paused | answering | correct | wrong | expired
export const useGame = (initialScore = 0, initialStreak = 0, initialBest = 0) => {
  const [gameState, setGameState] = useState('idle');
  const [currentSession, setCurrentSession] = useState(null);
  const [score, setScore] = useState(initialScore);
  const [streak, setStreak] = useState(initialStreak);
  const [bestStreak, setBestStreak] = useState(initialBest);
  const [lastResult, setLastResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isLoading, setIsLoading] = useState(false);

  // Game Modes: 'classic' | 'practice' (no timer, no score impact) | 'round' (10 puzzles) | 'lives' (3 lives)
  const [gameMode, setGameMode] = useState('classic');
  const [difficulty, setDifficulty] = useState('normal'); // 'easy' (40s) | 'normal' (30s) | 'hard' (15s)
  const [lives, setLives] = useState(3);
  const [puzzleCount, setPuzzleCount] = useState(0);
  const [roundCompleted, setRoundCompleted] = useState(false);
  const [revealedSolution, setRevealedSolution] = useState(null);

  // 3-Step Hint State
  const [hints, setHints] = useState([]);
  const [eliminatedDigits, setEliminatedDigits] = useState([]);
  const [isHintLoading, setIsHintLoading] = useState(false);

  // Wrong answer shake & vibration feedback
  const [isShaking, setIsShaking] = useState(false);

  const timerRef = useRef(null);
  const gameStateRef = useRef(gameState);
  const currentSessionRef = useRef(currentSession);
  const gameModeRef = useRef(gameMode);
  const isPausedRef = useRef(false);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    currentSessionRef.current = currentSession;
  }, [currentSession]);

  useEffect(() => {
    gameModeRef.current = gameMode;
  }, [gameMode]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const pauseGame = useCallback(() => {
    if (gameStateRef.current === 'playing') {
      stopTimer();
      isPausedRef.current = true;
      setGameState('paused');
    }
  }, [stopTimer]);

  const resumeGame = useCallback(() => {
    if (gameStateRef.current === 'paused') {
      isPausedRef.current = false;
      setGameState('playing');
      if (gameModeRef.current !== 'practice') {
        startTimer(timeLeft);
      }
    }
  }, [timeLeft]);

  const startTimer = useCallback(
    (seconds = 30) => {
      stopTimer();
      // If practice mode, count UP seconds so the player can see their elapsed time
      if (gameModeRef.current === 'practice') {
        setTimeLeft(0);
        timerRef.current = setInterval(() => {
          setTimeLeft((prev) => prev + 1);
        }, 1000);
        return;
      }

      setTimeLeft(seconds);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            stopTimer();
            setGameState('expired');
            setStreak(0);
            playTimeoutSound();

            if (gameModeRef.current === 'lives') {
              setLives((l) => Math.max(0, l - 1));
            }

            if (currentSessionRef.current?.sessionId && gameModeRef.current !== 'practice') {
              api.post('/game/expire', { sessionId: currentSessionRef.current.sessionId }).catch(() => {});
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    },
    [stopTimer]
  );

  // Cleanup on unmount
  useEffect(() => () => stopTimer(), [stopTimer]);

  const startNewGame = useCallback(async (selectedMode = null, selectedDiff = null) => {
    const activeMode = selectedMode || gameMode;
    const activeDiff = selectedDiff || difficulty;
    if (selectedMode) setGameMode(selectedMode);
    if (selectedDiff) setDifficulty(selectedDiff);

    try {
      setIsLoading(true);
      setGameState('loading');
      setLastResult(null);
      setHints([]);
      setEliminatedDigits([]);
      setIsShaking(false);
      setRevealedSolution(null);

      const { data } = await api.post('/game/start');
      setCurrentSession(data);
      setGameState('playing');

      const modeSeconds = activeMode === 'practice' ? 999 : activeDiff === 'easy' ? 45 : activeDiff === 'hard' ? 18 : 30;
      startTimer(modeSeconds);
      setPuzzleCount((c) => c + 1);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load question');
      setGameState('idle');
    } finally {
      setIsLoading(false);
    }
  }, [gameMode, difficulty, startTimer]);

  const requestHint = useCallback(async () => {
    if (!currentSession?.sessionId || gameStateRef.current !== 'playing' || isHintLoading) return;
    if (hints.length >= 3) {
      toast('All 3 hints have been used for this puzzle!', { icon: '💡' });
      return;
    }

    try {
      setIsHintLoading(true);
      const { data } = await api.post('/game/hint', { sessionId: currentSession.sessionId });
      playHintSound();
      setHints((prev) => [...prev, data]);
      if (Array.isArray(data.eliminatedDigits) && data.eliminatedDigits.length > 0) {
        setEliminatedDigits((prev) => Array.from(new Set([...prev, ...data.eliminatedDigits])));
      }
      toast.success(`${data.title}: ${data.text}`, { duration: 4000 });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to retrieve hint');
    } finally {
      setIsHintLoading(false);
    }
  }, [currentSession, hints.length, isHintLoading]);

  const revealSolutionAfterWrong = useCallback(() => {
    if (lastResult?.correctAnswer !== undefined) {
      setRevealedSolution(lastResult.correctAnswer);
      toast(`Revealed: The answer is ${lastResult.correctAnswer}!`, { icon: '🔍' });
    }
  }, [lastResult]);

  const submitAnswer = useCallback(
    async (answer) => {
      if (gameStateRef.current !== 'playing' || !currentSession) return;

      stopTimer();
      setGameState('answering');

      try {
        const { data } = await api.post('/game/answer', {
          sessionId: currentSession.sessionId,
          answer,
        });

        // In practice mode, we don't save score to global profile
        const effectiveScoreEarned = gameMode === 'practice' ? 0 : data.scoreEarned;
        const modifiedData = {
          ...data,
          scoreEarned: effectiveScoreEarned,
          gameMode,
        };

        setLastResult(modifiedData);
        if (gameMode !== 'practice') {
          setScore(data.totalScore);
          setStreak(data.newStreak);
          setBestStreak((prev) => Math.max(prev, data.bestStreak));
        }

        if (data.correct) {
          setGameState('correct');
          playCorrectSound(data.newStreak);
          if (data.newStreak >= 3) {
            confetti({
              particleCount: data.newStreak >= 10 ? 200 : 100,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#f7c948', '#ff6b35', '#a855f7', '#22c55e'],
            });
          }
        } else {
          setGameState('wrong');
          if (gameMode === 'lives') {
            setLives((l) => Math.max(0, l - 1));
          }
          setIsShaking(true);
          vibrateDevice([80, 40, 80, 40, 150]);
          playWrongSound();
          setTimeout(() => setIsShaking(false), 650);
        }

        // Check 10-puzzle round completion
        if (gameMode === 'round' && puzzleCount >= 10) {
          setRoundCompleted(true);
        }
      } catch (err) {
        if (err.response?.data?.timeExpired) {
          setGameState('expired');
          setStreak(0);
          playTimeoutSound();
        } else {
          toast.error(err.response?.data?.error || 'Failed to submit answer');
          setGameState('idle');
        }
      }
    },
    [currentSession, stopTimer, gameMode, puzzleCount]
  );

  const resetToIdle = useCallback(() => {
    stopTimer();
    setGameState('idle');
    setCurrentSession(null);
    setLastResult(null);
    setTimeLeft(30);
    setHints([]);
    setEliminatedDigits([]);
    setIsShaking(false);
    setLives(3);
    setPuzzleCount(0);
    setRoundCompleted(false);
    setRevealedSolution(null);
  }, [stopTimer]);

  return {
    gameState,
    currentSession,
    score,
    streak,
    bestStreak,
    lastResult,
    timeLeft,
    isLoading,
    gameMode,
    setGameMode,
    difficulty,
    setDifficulty,
    lives,
    puzzleCount,
    roundCompleted,
    revealedSolution,
    hints,
    eliminatedDigits,
    isHintLoading,
    isShaking,
    pauseGame,
    resumeGame,
    revealSolutionAfterWrong,
    startNewGame,
    requestHint,
    submitAnswer,
    resetToIdle,
  };
};
