import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Flame } from 'lucide-react';

/**
 * Floating Points Indicator
 * Displays animated popup for points, speed bonuses, and combos.
 */
const FloatingPoints = ({ points, combo = 1, isSpeed = false }) => {
  if (!points) return null;

  return (
    <motion.div
      className="floating-points-container"
      initial={{ opacity: 1, y: 0, scale: 0.8 }}
      animate={{ opacity: 0, y: -70, scale: 1.25 }}
      transition={{ duration: 1, ease: 'easeOut' }}
      aria-hidden="true"
    >
      <div className="floating-points-pill">
        <Zap size={18} className="floating-zap-icon" />
        <span className="floating-num">+{points} PTS!</span>
        {isSpeed && <span className="floating-bonus-tag">⚡ SPEED</span>}
        {combo >= 2 && (
          <span className="floating-combo-tag">
            <Flame size={14} /> {combo}×
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default FloatingPoints;
