// Web Audio API Synthesizer — Zero external audio files or dependencies
let audioCtx = null;

const getAudioContext = () => {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

let soundEnabled = true;
try {
  const saved = localStorage.getItem('banana_sound_enabled');
  if (saved !== null) {
    soundEnabled = saved === 'true';
  }
} catch {
  soundEnabled = true;
}

export const isSoundEnabled = () => soundEnabled;

export const toggleSound = () => {
  soundEnabled = !soundEnabled;
  try {
    localStorage.setItem('banana_sound_enabled', String(soundEnabled));
  } catch {
    // Ignore localStorage errors
  }
  return soundEnabled;
};

/** Crisp click sound for number pad / UI buttons */
export const playClickSound = () => {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(600, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.05);

  gain.gain.setValueAtTime(0.2, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.05);
};

/** Harmonious victory chime for correct answer */
export const playCorrectSound = (streak = 1) => {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const notes = streak >= 5 ? [523.25, 659.25, 783.99, 1046.5] : [523.25, 659.25, 783.99]; // C5, E5, G5, (C6)

  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + idx * 0.08);

    gain.gain.setValueAtTime(0.001, now + idx * 0.08);
    gain.gain.exponentialRampToValueAtTime(0.25, now + idx * 0.08 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + idx * 0.08);
    osc.stop(now + idx * 0.08 + 0.36);
  });
};

/** Gentle descending buzzer for wrong answer */
export const playWrongSound = () => {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(220, now);
  osc.frequency.exponentialRampToValueAtTime(110, now + 0.25);

  gain.gain.setValueAtTime(0.18, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.26);
};

/** Timeout buzzer */
export const playTimeoutSound = () => {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  [0, 0.12].forEach((offset) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(180, now + offset);

    gain.gain.setValueAtTime(0.15, now + offset);
    gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.09);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + offset);
    osc.stop(now + offset + 0.1);
  });
};

/** Uplifting sparkle sound when a hint is revealed */
export const playHintSound = () => {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const notes = [587.33, 739.99, 880.0]; // D5, F#5, A5 sparkle

  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + idx * 0.07);

    gain.gain.setValueAtTime(0.001, now + idx * 0.07);
    gain.gain.exponentialRampToValueAtTime(0.2, now + idx * 0.07 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + idx * 0.07);
    osc.stop(now + idx * 0.07 + 0.26);
  });
};

/** Device haptic vibration helper for physical feedback */
export const vibrateDevice = (pattern = [80, 40, 80, 40, 120]) => {
  if (typeof window !== 'undefined' && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignore vibration error on unsupported devices
    }
  }
};
