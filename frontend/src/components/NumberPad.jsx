import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { playClickSound } from '../utils/audio';

/**
 * Chunky 5x2 Number Pad
 * Keys >= 48px tall, touch-friendly, 3D pressable bottom edge,
 * eliminated state (greyed + cross + flash on elimination).
 */
const NumberPad = ({ onPress, disabled, disabledDigits = [] }) => {
  // 5x2 layout: 1 2 3 4 5 on top row, 6 7 8 9 0 on bottom row
  const keys = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

  // Track newly eliminated keys to trigger brief flash animation
  const [flashingKey, setFlashingKey] = useState(null);

  useEffect(() => {
    if (disabledDigits.length > 0) {
      const latest = disabledDigits[disabledDigits.length - 1];
      setFlashingKey(latest);
      const timer = setTimeout(() => setFlashingKey(null), 800);
      return () => clearTimeout(timer);
    }
  }, [disabledDigits]);

  const handlePress = (key) => {
    if (disabled || disabledDigits.includes(key)) return;
    playClickSound();
    onPress(key);
  };

  return (
    <div
      className="number-pad-5x2"
      role="group"
      aria-label="Answer number keypad from 0 to 9"
    >
      {keys.map((key) => {
        const isEliminated = disabledDigits.includes(key);
        const isFlashing = flashingKey === key;
        const isDisabled = disabled || isEliminated;

        return (
          <motion.button
            key={key}
            id={`num-btn-${key}`}
            type="button"
            className={`num-btn ${isEliminated ? 'num-btn-eliminated' : ''} ${isFlashing ? 'num-btn-flash' : ''}`}
            onClick={() => handlePress(key)}
            disabled={isDisabled}
            whileHover={!isDisabled ? { scale: 1.05 } : {}}
            whileTap={!isDisabled ? { y: 3, boxShadow: 'none' } : {}}
            aria-label={isEliminated ? `Digit ${key}, eliminated` : `Select digit ${key}`}
            aria-disabled={isDisabled}
            title={isEliminated ? `Digit ${key} was eliminated by a hint` : `Press ${key}`}
          >
            <span className="num-btn-text">
              {key}
              {isEliminated && (
                <span className="eliminated-cross" aria-hidden="true">✕</span>
              )}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
};

export default NumberPad;
