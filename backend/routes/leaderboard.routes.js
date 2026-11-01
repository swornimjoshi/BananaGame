const express = require('express');
const router = express.Router();
const { getLeaderboard, getMyRank } = require('../controllers/leaderboard.controller');
const { authenticate, optionalAuth } = require('../middleware/auth.middleware');
const { generalLimiter } = require('../middleware/rateLimiter');

router.get('/', generalLimiter, optionalAuth, getLeaderboard);
router.get('/me', authenticate, getMyRank);

module.exports = router;
