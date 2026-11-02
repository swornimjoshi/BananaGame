import React from 'react';
import { motion } from 'framer-motion';

/**
 * Monkey Genius Lab Mascot Component
 * States: 'idle' | 'thinking' | 'cheering' | 'headshake' | 'crowned'
 */
const Mascot = ({ state = 'idle', size = 100, className = '' }) => {
  // Motion animations per state
  const animations = {
    idle: {
      y: [0, -4, 0],
      transition: { repeat: Infinity, duration: 2.5, ease: 'easeInOut' }
    },
    thinking: {
      rotate: [-3, 3, -3],
      y: [0, -2, 0],
      transition: { repeat: Infinity, duration: 2, ease: 'easeInOut' }
    },
    cheering: {
      y: [0, -12, 0],
      scale: [1, 1.05, 1],
      transition: { repeat: Infinity, duration: 0.6, ease: 'easeOut' }
    },
    headshake: {
      rotate: [-6, 6, -6, 6, 0],
      transition: { duration: 0.6, ease: 'easeInOut' }
    },
    crowned: {
      y: [0, -6, 0],
      scale: [1, 1.04, 1],
      transition: { repeat: Infinity, duration: 2, ease: 'easeInOut' }
    }
  };

  return (
    <motion.div
      className={`mascot-container ${className}`}
      animate={animations[state] || animations.idle}
      style={{ display: 'inline-block', width: size, height: size }}
      role="img"
      aria-label={`Monkey Genius Mascot - ${state}`}
    >
      <svg
        viewBox="0 0 120 120"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Drop shadow underneath */}
        <ellipse cx="60" cy="112" rx="36" ry="6" fill="#3B2A1A" opacity="0.18" />

        {/* Ears */}
        <circle cx="28" cy="50" r="14" fill="#935116" stroke="#3B2A1A" strokeWidth="3" />
        <circle cx="28" cy="50" r="8" fill="#F5CBA7" />
        <circle cx="92" cy="50" r="14" fill="#935116" stroke="#3B2A1A" strokeWidth="3" />
        <circle cx="92" cy="50" r="8" fill="#F5CBA7" />

        {/* Lab Coat (Body) */}
        <path
          d="M36 86 C36 74, 84 74, 84 86 L90 108 C90 110, 30 110, 30 108 Z"
          fill="#FFFFFF"
          stroke="#3B2A1A"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* Lab Coat Lapels */}
        <path d="M48 84 L60 98 L72 84" fill="#F0F4F8" stroke="#3B2A1A" strokeWidth="2.5" />
        <line x1="60" y1="98" x2="60" y2="108" stroke="#3B2A1A" strokeWidth="2.5" />
        {/* Pocket with Pen */}
        <rect x="40" y="94" width="8" height="9" rx="1.5" fill="#E2E8F0" stroke="#3B2A1A" strokeWidth="1.5" />
        <line x1="42" y1="91" x2="42" y2="94" stroke="#4DABF7" strokeWidth="2" strokeLinecap="round" />
        <line x1="45" y1="92" x2="45" y2="94" stroke="#FF6B6B" strokeWidth="2" strokeLinecap="round" />

        {/* Main Head */}
        <ellipse cx="60" cy="54" rx="32" ry="30" fill="#935116" stroke="#3B2A1A" strokeWidth="3" />

        {/* Face Muzzle Area */}
        <ellipse cx="60" cy="62" rx="22" ry="17" fill="#F5CBA7" stroke="#3B2A1A" strokeWidth="2.5" />
        {/* Eye Mask Area */}
        <path
          d="M44 48 C44 40, 58 40, 60 47 C62 40, 76 40, 76 48 C76 56, 44 56, 44 48 Z"
          fill="#F5CBA7"
        />

        {/* Eyes based on state */}
        {state === 'cheering' ? (
          // Joyful arch eyes ^_^
          <g stroke="#3B2A1A" strokeWidth="3" strokeLinecap="round" fill="none">
            <path d="M46 47 Q52 40 56 47" />
            <path d="M64 47 Q68 40 74 47" />
          </g>
        ) : state === 'headshake' ? (
          // Confused / spiral / closed eyes
          <g stroke="#3B2A1A" strokeWidth="2.5" strokeLinecap="round" fill="none">
            <path d="M46 48 L54 44" />
            <path d="M46 44 L54 48" />
            <circle cx="70" cy="46" r="4" fill="#3B2A1A" />
          </g>
        ) : state === 'thinking' ? (
          // Looking up / thoughtful
          <g>
            <circle cx="51" cy="46" r="5" fill="#FFFFFF" stroke="#3B2A1A" strokeWidth="2" />
            <circle cx="50" cy="44" r="2.5" fill="#3B2A1A" />
            <circle cx="69" cy="46" r="5" fill="#FFFFFF" stroke="#3B2A1A" strokeWidth="2" />
            <circle cx="68" cy="44" r="2.5" fill="#3B2A1A" />
          </g>
        ) : (
          // Default bright friendly eyes
          <g>
            <circle cx="51" cy="47" r="5" fill="#3B2A1A" />
            <circle cx="53" cy="45" r="1.8" fill="#FFFFFF" />
            <circle cx="69" cy="47" r="5" fill="#3B2A1A" />
            <circle cx="71" cy="45" r="1.8" fill="#FFFFFF" />
          </g>
        )}

        {/* Cheeks Blush */}
        <circle cx="43" cy="58" r="4" fill="#FF8A80" opacity="0.5" />
        <circle cx="77" cy="58" r="4" fill="#FF8A80" opacity="0.5" />

        {/* Nose */}
        <ellipse cx="60" cy="58" rx="4" ry="2.5" fill="#3B2A1A" />

        {/* Mouth based on state */}
        {state === 'cheering' ? (
          // Big happy open smile
          <g>
            <path
              d="M51 64 Q60 77 69 64 Z"
              fill="#D32F2F"
              stroke="#3B2A1A"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path d="M54 64 Q60 67 66 64" fill="#FFFFFF" />
          </g>
        ) : state === 'headshake' ? (
          // Wobbly / puzzled mouth
          <path
            d="M52 68 Q56 64 60 67 Q64 70 68 65"
            fill="none"
            stroke="#3B2A1A"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        ) : state === 'thinking' ? (
          // Small pursed thoughtful "o" or smirk
          <path
            d="M56 67 Q63 68 67 64"
            fill="none"
            stroke="#3B2A1A"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        ) : (
          // Warm friendly curve smile
          <path
            d="M52 64 Q60 73 68 64"
            fill="none"
            stroke="#3B2A1A"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        )}

        {/* Hands / Arms */}
        {state === 'cheering' ? (
          // Both hands raised high
          <g>
            <ellipse cx="26" cy="38" rx="7" ry="7" fill="#F5CBA7" stroke="#3B2A1A" strokeWidth="2.5" />
            <ellipse cx="94" cy="38" rx="7" ry="7" fill="#F5CBA7" stroke="#3B2A1A" strokeWidth="2.5" />
          </g>
        ) : state === 'thinking' ? (
          // Hand on chin
          <g>
            <ellipse cx="70" cy="72" rx="6" ry="6" fill="#F5CBA7" stroke="#3B2A1A" strokeWidth="2.5" />
          </g>
        ) : state === 'headshake' ? (
          // Hand scratching head
          <g>
            <ellipse cx="88" cy="36" rx="6" ry="6" fill="#F5CBA7" stroke="#3B2A1A" strokeWidth="2.5" />
          </g>
        ) : (
          // Resting hands
          <g>
            <ellipse cx="32" cy="95" rx="5" ry="5" fill="#F5CBA7" stroke="#3B2A1A" strokeWidth="2" />
            <ellipse cx="88" cy="95" rx="5" ry="5" fill="#F5CBA7" stroke="#3B2A1A" strokeWidth="2" />
          </g>
        )}

        {/* Lab Goggles on Forehead */}
        {state !== 'crowned' && (
          <g>
            {/* Strap */}
            <path d="M30 38 Q60 30 90 38" stroke="#3B2A1A" strokeWidth="4" fill="none" strokeLinecap="round" />
            {/* Left Lens */}
            <circle cx="48" cy="33" r="10" fill="#4DABF7" stroke="#3B2A1A" strokeWidth="2.5" opacity="0.9" />
            <circle cx="48" cy="33" r="8" fill="#E1F5FE" opacity="0.6" />
            <path d="M44 30 L48 27" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
            {/* Right Lens */}
            <circle cx="72" cy="33" r="10" fill="#4DABF7" stroke="#3B2A1A" strokeWidth="2.5" opacity="0.9" />
            <circle cx="72" cy="33" r="8" fill="#E1F5FE" opacity="0.6" />
            <path d="M68 30 L72 27" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
            {/* Bridge */}
            <line x1="58" y1="33" x2="62" y2="33" stroke="#3B2A1A" strokeWidth="3" />
          </g>
        )}

        {/* Crown for Crowned State (#1 on Leaderboard / Champion) */}
        {state === 'crowned' && (
          <g>
            <path
              d="M40 32 L46 16 L60 26 L74 16 L80 32 Z"
              fill="#FFD93D"
              stroke="#3B2A1A"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Jewels on crown */}
            <circle cx="46" cy="18" r="2" fill="#FF6B6B" />
            <circle cx="60" cy="27" r="2" fill="#4DABF7" />
            <circle cx="74" cy="18" r="2" fill="#4CAF50" />
            <circle cx="60" cy="31" r="2.5" fill="#A855F7" />
          </g>
        )}

        {/* Extra Accents */}
        {state === 'cheering' && (
          // Sparkle stars
          <g fill="#FFD93D" stroke="#3B2A1A" strokeWidth="1">
            <path d="M16 26 L18 20 L24 22 L20 27 L22 33 L17 29 L12 31 L14 25 Z" />
            <path d="M102 24 L104 18 L110 20 L106 25 L108 31 L103 27 L98 29 L100 23 Z" />
          </g>
        )}
        {state === 'thinking' && (
          // Lightbulb / thought bubble
          <g>
            <ellipse cx="88" cy="22" rx="4" ry="4" fill="#FFD93D" stroke="#3B2A1A" strokeWidth="1.5" />
            <ellipse cx="80" cy="28" rx="2" ry="2" fill="#FFD93D" />
          </g>
        )}
      </svg>
    </motion.div>
  );
};

export default Mascot;
