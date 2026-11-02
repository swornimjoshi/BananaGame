import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Clock, Zap } from 'lucide-react';

/**
 * Chunky Horizontal Timer Bar
 * Features:
 * - Thick progress bar with green (>50%), amber (20-50%), red (<20%) zones
 * - Under 5s: Text & icon urgency cue ("⚡ 4s left!"), gentle scale pulse only (no rotate shake)
 * - Accessible: aria-valuenow, aria-valuemin, aria-valuemax, aria-live
 */
const Timer = ({ timeLeft, totalTime = 30, isPractice = false }) => {
  const percentage = isPractice
    ? 100
    : Math.max(0, Math.min(100, (timeLeft / (totalTime || 30)) * 100));

  // Determine color zone & label
  const { colorClass, zoneName } = useMemo(() => {
    if (isPractice) return { colorClass: 'timer-zone-practice', zoneName: 'Practice' };
    if (timeLeft > (totalTime * 0.5)) return { colorClass: 'timer-zone-green', zoneName: 'Safe' };
    if (timeLeft > (totalTime * 0.2)) return { colorClass: 'timer-zone-amber', zoneName: 'Hurry' };
    return { colorClass: 'timer-zone-red', zoneName: 'Critical' };
  }, [timeLeft, totalTime, isPractice]);

  const urgent = !isPractice && timeLeft <= 5 && timeLeft > 0;

  return (
    <div
      className="timer-container"
      role="timer"
      aria-live={urgent ? 'assertive' : 'off'}
      aria-label={`Time remaining: ${timeLeft} seconds`}
      aria-valuenow={timeLeft}
      aria-valuemin={0}
      aria-valuemax={totalTime}
    >
      <div className="timer-header-info">
        <div className="timer-label-wrap">
          <Clock size={16} className="timer-icon" />
          <span className="timer-caption">
            {isPractice ? 'Elapsed Practice Time' : 'Time Remaining'}
          </span>
        </div>

        {/* Numeric time pill with gentle pulse under 5s */}
        <motion.div
          className={`timer-digits-badge ${colorClass} ${urgent ? 'timer-urgent-pill' : ''}`}
          animate={urgent ? { scale: [1, 1.08, 1] } : { scale: 1 }}
          transition={urgent ? { repeat: Infinity, duration: 0.6, ease: 'easeInOut' } : {}}
        >
          {urgent && <Zap size={14} className="timer-flash-icon" />}
          <span className="timer-seconds-num">{timeLeft}s</span>
          {urgent && <span className="timer-urgent-text">HURRY!</span>}
        </motion.div>
      </div>

      {/* Chunky 3D Progress Bar Track */}
      <div className="timer-track-bar">
        <motion.div
          className={`timer-progress-fill ${colorClass}`}
          initial={false}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'linear' }}
        />
      </div>
    </div>
  );
};

export default Timer;
