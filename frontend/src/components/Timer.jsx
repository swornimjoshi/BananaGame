import { motion } from 'framer-motion';
import { useMemo } from 'react';

const Timer = ({ timeLeft, totalTime = 30, isPractice = false }) => {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const progress = isPractice ? 1 : Math.max(0, Math.min(1, timeLeft / (totalTime || 30)));
  const dashoffset = circumference * (1 - progress);

  const color = useMemo(() => {
    if (isPractice) return '#3b82f6'; // Clean soothing blue for practice
    if (timeLeft > 15) return '#22c55e';
    if (timeLeft > 7) return '#f59e0b';
    return '#ef4444';
  }, [timeLeft, isPractice]);

  const urgent = !isPractice && timeLeft <= 5 && timeLeft > 0;

  return (
    <motion.div
      className={`timer-wrapper ${urgent ? 'timer-urgent-pulse' : ''}`}
      animate={urgent ? { scale: [1, 1.15, 1], rotate: [-2, 2, -2, 0] } : { scale: 1 }}
      transition={urgent ? { repeat: Infinity, duration: 0.45, ease: 'easeInOut' } : {}}
    >
      <svg width="100" height="100" viewBox="0 0 100 100" className="timer-svg">
        {/* Track */}
        <circle
          cx="50" cy="50" r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="7"
        />
        {/* Glow filter */}
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Progress arc */}
        <circle
          cx="50" cy="50" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashoffset}
          transform="rotate(-90 50 50)"
          filter="url(#glow)"
          style={{ transition: 'stroke-dashoffset 0.9s linear, stroke 0.4s ease' }}
        />
        {/* Time text */}
        <text
          x="50" y="46"
          textAnchor="middle"
          fill={color}
          fontSize="22"
          fontWeight="700"
          fontFamily="Outfit, sans-serif"
          style={{ transition: 'fill 0.4s ease' }}
        >
          {timeLeft}
        </text>
        <text
          x="50" y="62"
          textAnchor="middle"
          fill="rgba(255,255,255,0.4)"
          fontSize="9"
          fontFamily="Outfit, sans-serif"
        >
          SEC
        </text>
      </svg>
    </motion.div>
  );
};

export default Timer;
