import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Button from './Button';

/**
 * Avatar Picker Modal Component
 */
const AvatarPicker = ({ open, onClose, avatars = [], selectedAvatar, onSelect }) => {
  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="picker-title">
        <motion.div
          className="modal-card"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="modal-close-btn" onClick={onClose} title="Close" aria-label="Close avatar picker">
            <X size={18} />
          </button>

          <h3 id="picker-title" className="avatar-picker-title">
            Choose Your Mascot Avatar
          </h3>
          <p className="avatar-picker-subtitle">
            Pick a character to represent you on the leaderboard!
          </p>

          <div className="avatar-grid avatar-picker-grid">
            {avatars.map((av) => (
              <motion.button
                key={av}
                type="button"
                className={`avatar-btn ${selectedAvatar === av ? 'selected' : ''}`}
                onClick={() => {
                  onSelect(av);
                  onClose();
                }}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                aria-label={`Select avatar ${av}`}
              >
                {av}
              </motion.button>
            ))}
          </div>

          <div className="avatar-picker-actions">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AvatarPicker;

