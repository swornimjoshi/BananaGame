const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { register, login, logout, refresh, me } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authLimiter } = require('../middleware/rateLimiter');

router.post(
  '/register',
  authLimiter,
  [
    body('username')
      .trim()
      .isLength({ min: 3, max: 20 })
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username must be 3–20 characters (letters, numbers, underscore)'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters'),
    body('displayName').optional().trim().isLength({ max: 50 }),
  ],
  register
);

router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
  ],
  login
);

router.post('/logout', logout);
router.post('/refresh', refresh);
router.get('/me', authenticate, me);

module.exports = router;
