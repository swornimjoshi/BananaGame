const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { getProfile, getMyProfile, updateProfile, getAvatarOptions } = require('../controllers/profile.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { generalLimiter } = require('../middleware/rateLimiter');

router.get('/me', authenticate, getMyProfile);
router.put(
  '/me',
  authenticate,
  [
    body('displayName').optional().trim().isLength({ min: 1, max: 50 }),
    body('avatar').optional().isString(),
  ],
  updateProfile
);
router.get('/avatars', getAvatarOptions);
router.get('/:username', generalLimiter, getProfile);

module.exports = router;
