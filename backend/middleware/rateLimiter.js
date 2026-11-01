const rateLimit = require('express-rate-limit');

// Auth endpoints: prevent brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { error: 'Too many authentication attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

// Game answer: prevent brute-forcing the 0-9 solution
const gameAnswerLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 15,
  message: { error: 'Too many answer submissions, slow down!' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Game start: prevent excessive API calls to banana API
const gameStartLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: 'Too many game start requests' },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests, please slow down' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { authLimiter, gameAnswerLimiter, gameStartLimiter, generalLimiter };
