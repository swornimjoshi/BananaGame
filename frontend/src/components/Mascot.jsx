import React from 'react';
import { motion } from 'framer-motion';

/**
 * Pikachu Electric Scientist Mascot Component
 * Character Theme: Pikachu (Electric Mouse Scientist)
 * States: 'idle' | 'thinking' | 'cheering' | 'headshake' | 'crowned'
 */
const Mascot = ({ state = 'idle', size = 100, className = '' }) => {
  // Motion animations per state
  const animations = {
    idle: {
      y: [0, -5, 0],
      transition: { repeat: Infinity, duration: 2.4, ease: 'easeInOut' }
    },
    thinking: {
      rotate: [-4, 4, -4],
      y: [0, -3, 0],
      transition: { repeat: Infinity, duration: 2, ease: 'easeInOut' }
    },
    cheering: {
      y: [0, -14, 0],
      scale: [1, 1.07, 1],
      transition: { repeat: Infinity, duration: 0.65, ease: 'easeOut' }
    },
    headshake: {
      rotate: [-8, 8, -6, 6, 0],
      transition: { duration: 0.6, ease: 'easeInOut' }
    },
    crowned: {
      y: [0, -6, 0],
      scale: [1, 1.04, 1],
      transition: { repeat: Infinity, duration: 2.2, ease: 'easeInOut' }
    }
  };

  return (
    <motion.div
      className={`mascot-container ${className}`}
      animate={animations[state] || animations.idle}
      style={{ display: 'inline-block', width: size, height: size }}
      role="img"
      aria-label={`Pikachu Electric Scientist - ${state}`}
    >
      <svg
        viewBox="0 0 130 130"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Soft shadow base */}
        <ellipse cx="65" cy="120" rx="36" ry="6" fill="#2B231D" opacity="0.18" />

        {/* ── Lightning Bolt Tail ─────────────────────────────────────── */}
        <g id="pikachu-tail">
          {/* Tail base brown */}
          <path
            d="M92 90 L102 76 L112 82 L102 96 Z"
            fill="#8B4513"
            stroke="#2B231D"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Tail zigzag electric yellow */}
          <path
            d="M102 76 L118 56 L110 52 L126 30 L108 36 L114 48 L98 64 Z"
            fill="#FFDE00"
            stroke="#2B231D"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        </g>

        {/* ── Iconic Long Ears with Black Tips ────────────────────────── */}
        {/* Left Ear */}
        <g id="left-ear">
          <path
            d="M44 48 C36 32, 20 18, 14 6 C28 10, 46 26, 52 42 Z"
            fill="#FFDE00"
            stroke="#2B231D"
            strokeWidth="2.8"
            strokeLinejoin="round"
          />
          {/* Black tip */}
          <path
            d="M14 6 C18 10, 24 13, 27 15 L22 24 C18 20, 15 14, 14 6 Z"
            fill="#2B231D"
          />
        </g>

        {/* Right Ear */}
        <g id="right-ear">
          <path
            d="M78 42 C84 26, 102 10, 116 6 C110 18, 94 32, 86 48 Z"
            fill="#FFDE00"
            stroke="#2B231D"
            strokeWidth="2.8"
            strokeLinejoin="round"
          />
          {/* Black tip */}
          <path
            d="M116 6 C112 10, 106 13, 103 15 L108 24 C112 20, 115 14, 116 6 Z"
            fill="#2B231D"
          />
        </g>

        {/* ── Pikachu Body & Lab Coat ─────────────────────────────────── */}
        {/* Yellow Body Base */}
        <path
          d="M40 76 C40 68, 90 68, 90 76 L96 114 C96 118, 34 118, 34 114 Z"
          fill="#FFDE00"
          stroke="#2B231D"
          strokeWidth="2.8"
          strokeLinejoin="round"
        />

        {/* White Lab Coat with Electric Collar */}
        <path
          d="M42 82 C42 74, 88 74, 88 82 L94 114 C94 116, 36 116, 36 114 Z"
          fill="#FFFFFF"
          stroke="#2B231D"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Lapel V-neck */}
        <path d="M52 82 L65 96 L78 82" fill="#F4F8FA" stroke="#2B231D" strokeWidth="2.5" />
        <line x1="65" y1="96" x2="65" y2="114" stroke="#2B231D" strokeWidth="2" />

        {/* Electric Lab Badge on Pocket */}
        <rect x="42" y="94" width="9" height="10" rx="2" fill="#FFDE00" stroke="#2B231D" strokeWidth="1.5" />
        {/* Mini lightning inside badge */}
        <path d="M47 95 L45 99 L48 99 L46 103" stroke="#EE1515" strokeWidth="1.5" strokeLinecap="round" />

        {/* ── Pikachu Chubby Head ─────────────────────────────────────── */}
        <ellipse cx="65" cy="56" rx="34" ry="30" fill="#FFDE00" stroke="#2B231D" strokeWidth="2.8" />

        {/* ── Iconic Rosy Red Electric Cheek Pouches ──────────────────── */}
        {/* Left Cheek */}
        <circle cx="41" cy="65" r="8" fill="#EE1515" stroke="#2B231D" strokeWidth="1.8" />
        {/* Right Cheek */}
        <circle cx="89" cy="65" r="8" fill="#EE1515" stroke="#2B231D" strokeWidth="1.8" />

        {/* Cheek sparks when cheering or thinking */}
        {(state === 'cheering' || state === 'thinking') && (
          <g stroke="#FFDE00" strokeWidth="2" strokeLinecap="round" fill="none">
            {/* Left cheek sparks */}
            <path d="M31 60 L26 56" />
            <path d="M29 67 L24 68" />
            <path d="M32 73 L27 77" />
            {/* Right cheek sparks */}
            <path d="M99 60 L104 56" />
            <path d="M101 67 L106 68" />
            <path d="M98 73 L103 77" />
          </g>
        )}

        {/* ── Eyes Based on State ─────────────────────────────────────── */}
        {state === 'cheering' ? (
          // Joyful arch eyes ^_^
          <g stroke="#2B231D" strokeWidth="3.2" strokeLinecap="round" fill="none">
            <path d="M50 52 Q56 45 61 52" />
            <path d="M69 52 Q74 45 80 52" />
          </g>
        ) : state === 'headshake' ? (
          // Dizzy spiral / bewildered eyes
          <g stroke="#2B231D" strokeWidth="2.5" strokeLinecap="round" fill="none">
            <circle cx="55" cy="52" r="5" strokeDasharray="4 2" />
            <circle cx="75" cy="52" r="5" strokeDasharray="4 2" />
            {/* Sweatdrop */}
            <path d="M96 46 Q98 40 102 46 Q100 50 96 46 Z" fill="#00C2FF" />
          </g>
        ) : state === 'thinking' ? (
          // Inquisitive upward gaze
          <g>
            <circle cx="55" cy="51" r="5.5" fill="#2B231D" />
            <circle cx="54" cy="49" r="2" fill="#FFFFFF" />
            <circle cx="75" cy="51" r="5.5" fill="#2B231D" />
            <circle cx="74" cy="49" r="2" fill="#FFFFFF" />
          </g>
        ) : (
          // Big classic Pikachu anime eyes with white catchlight
          <g>
            <circle cx="54" cy="52" r="5.5" fill="#2B231D" />
            <circle cx="56" cy="50" r="2.2" fill="#FFFFFF" />
            <circle cx="53" cy="54" r="1" fill="#FFFFFF" />
            <circle cx="76" cy="52" r="5.5" fill="#2B231D" />
            <circle cx="78" cy="50" r="2.2" fill="#FFFFFF" />
            <circle cx="75" cy="54" r="1" fill="#FFFFFF" />
          </g>
        )}

        {/* Tiny triangular nose */}
        <polygon points="65,58 63,60 67,60" fill="#2B231D" />

        {/* ── Mouth Based on State ────────────────────────────────────── */}
        {state === 'cheering' ? (
          // Big happy open mouth with pink tongue
          <g>
            <path
              d="M57 63 Q65 77 73 63 Z"
              fill="#D92B2B"
              stroke="#2B231D"
              strokeWidth="2.2"
              strokeLinejoin="round"
            />
            {/* Tongue */}
            <path d="M60 68 Q65 71 70 68" stroke="#FFA4A4" strokeWidth="3" strokeLinecap="round" />
          </g>
        ) : state === 'headshake' ? (
          // Wavy perplexed mouth
          <path
            d="M58 65 Q62 62 65 65 Q68 68 72 64"
            fill="none"
            stroke="#2B231D"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        ) : state === 'thinking' ? (
          // Cute cat-like smirk (:3)
          <path
            d="M60 64 Q63 66 65 64 Q67 66 70 64"
            fill="none"
            stroke="#2B231D"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        ) : (
          // Friendly open smile
          <path
            d="M58 63 Q65 72 72 63"
            fill="none"
            stroke="#2B231D"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        )}

        {/* ── Paws / Hands ────────────────────────────────────────────── */}
        {state === 'cheering' ? (
          // Paws raised in celebration
          <g>
            <ellipse cx="32" cy="46" rx="6" ry="6" fill="#FFDE00" stroke="#2B231D" strokeWidth="2.2" />
            <ellipse cx="98" cy="46" rx="6" ry="6" fill="#FFDE00" stroke="#2B231D" strokeWidth="2.2" />
          </g>
        ) : state === 'thinking' ? (
          // Paw touching cheek pouch
          <g>
            <ellipse cx="78" cy="74" rx="6" ry="6" fill="#FFDE00" stroke="#2B231D" strokeWidth="2.2" />
          </g>
        ) : (
          // Cute resting paws
          <g>
            <ellipse cx="44" cy="88" rx="5" ry="5" fill="#FFDE00" stroke="#2B231D" strokeWidth="2" />
            <ellipse cx="86" cy="88" rx="5" ry="5" fill="#FFDE00" stroke="#2B231D" strokeWidth="2" />
          </g>
        )}

        {/* ── Crown for Crowned State (Leaderboard #1 / Round Champion) ─ */}
        {state === 'crowned' && (
          <g id="crown">
            <path
              d="M44 32 L50 14 L65 24 L80 14 L86 32 Z"
              fill="#FFDE00"
              stroke="#2B231D"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Crown jewels */}
            <circle cx="50" cy="16" r="2.5" fill="#EE1515" />
            <circle cx="65" cy="25" r="2.5" fill="#00C2FF" />
            <circle cx="80" cy="16" r="2.5" fill="#2EAA34" />
            <circle cx="65" cy="30" r="3" fill="#EE1515" />
          </g>
        )}

        {/* ── Lightning Sparks on Cheering ────────────────────────────── */}
        {state === 'cheering' && (
          <g fill="#FFDE00" stroke="#2B231D" strokeWidth="1.5">
            <path d="M18 36 L24 24 L20 24 L26 14 L20 18 L24 28 L18 28 Z" />
            <path d="M108 36 L114 24 L110 24 L116 14 L110 18 L114 28 L108 28 Z" />
          </g>
        )}
      </svg>
    </motion.div>
  );
};

export default Mascot;
