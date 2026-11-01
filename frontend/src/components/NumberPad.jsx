import { motion } from 'framer-motion';
import { playClickSound } from '../utils/audio';

const NumberPad = ({ onPress, disabled, disabledDigits = [] }) => {
  // 5x2 layout: 1 2 3 4 5 on row 1, 6 7 8 9 0 on row 2
  const keys = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

  const handlePress = (key) => {
    if (disabled || disabledDigits.includes(key)) return;
    playClickSound();
    onPress(key);
  };

  return (
    <div className="number-pad-5x2">
      {keys.map((key, idx) => {
        const isEliminated = disabledDigits.includes(key);
        const isDisabled = disabled || isEliminated;

        return (
          <motion.button
            key={key}
            id={`num-btn-${key}`}
            className={`num-btn ${isEliminated ? 'num-btn-eliminated' : ''}`}
            onClick={() => handlePress(key)}
            disabled={isDisabled}
            whileHover={!isDisabled ? { scale: 1.08, y: -2 } : {}}
            whileTap={!isDisabled ? { scale: 0.92 } : {}}
            initial={{ opacity: 0, y: 15 }}
            animate={
              isEliminated
                ? { opacity: 0.25, scale: 0.92, filter: 'grayscale(1)' }
                : { opacity: 1, scale: 1, filter: 'none', y: 0 }
            }
            transition={{ delay: idx * 0.02, type: 'spring', stiffness: 300, damping: 20 }}
            title={isEliminated ? `Digit ${key} eliminated by hint` : `Press ${key}`}
          >
            <span className="num-btn-text">
              {key}
              {isEliminated && <span className="eliminated-cross">✕</span>}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
};

export default NumberPad;
