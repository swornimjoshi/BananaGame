const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { startGame, answerGame, expireGame, getQuestionImage, requestHint, getDailyChallenge } = require('../controllers/game.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { gameAnswerLimiter, gameStartLimiter } = require('../middleware/rateLimiter');

// Image proxy for question image (no CORS/mixed-content issues)
router.get('/image/:sessionId', getQuestionImage);

// Daily challenge info & rankings
router.get('/daily-challenge', getDailyChallenge);

router.post('/start', authenticate, gameStartLimiter, startGame);

router.post(
  '/hint',
  authenticate,
  gameAnswerLimiter,
  [body('sessionId').isUUID().withMessage('Valid session ID required')],
  requestHint
);

router.post(
  '/answer',
  authenticate,
  gameAnswerLimiter,
  [
    body('sessionId').isUUID().withMessage('Valid session ID required'),
    body('answer').isInt({ min: 0, max: 9 }).withMessage('Answer must be digit 0–9'),
  ],
  answerGame
);

router.post(
  '/expire',
  authenticate,
  gameAnswerLimiter,
  [body('sessionId').isUUID().withMessage('Valid session ID required')],
  expireGame
);

module.exports = router;
