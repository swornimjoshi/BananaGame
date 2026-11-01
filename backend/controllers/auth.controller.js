const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { pool } = require('../config/db');
const { validationResult } = require('express-validator');

const AVATAR_OPTIONS = ['🍌', '🐒', '🦍', '🌴', '🦁', '🐯', '🦊', '🐸', '🐧', '🦄', '🎮', '🏆', '⭐', '🔥', '💎'];

/**
 * Generate access + refresh JWT pair.
 * Access token: 15 min (stored in httpOnly cookie)
 * Refresh token: 7 days (hashed and stored in DB)
 */
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
  return { accessToken, refreshToken };
};

/** SHA-256 hash — used to store refresh tokens in DB (not bcrypt, tokens need exact match) */
const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

/** Set httpOnly, Secure cookies — never accessible from JS */
const setTokenCookies = (res, accessToken, refreshToken) => {
  const isProd = process.env.NODE_ENV === 'production';
  const base = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
  };
  res.cookie('accessToken', accessToken, { ...base, maxAge: 15 * 60 * 1000 });
  res.cookie('refreshToken', refreshToken, { ...base, maxAge: 7 * 24 * 60 * 60 * 1000 });
};

const clearTokenCookies = (res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
};

// ─── Register ────────────────────────────────────────────────────────────────

const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, displayName, avatar } = req.body;
    const selectedAvatar = AVATAR_OPTIONS.includes(avatar) ? avatar : '🍌';
    const passwordHash = await bcrypt.hash(password, 12);

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [result] = await conn.execute(
        'INSERT INTO users (username, email, password_hash, display_name, avatar) VALUES (?, ?, ?, ?, ?)',
        [username.toLowerCase(), email.toLowerCase(), passwordHash, displayName || username, selectedAvatar]
      );

      const userId = result.insertId;

      // Create empty stats row
      await conn.execute('INSERT INTO user_stats (user_id) VALUES (?)', [userId]);

      await conn.commit();

      const { accessToken, refreshToken } = generateTokens(userId);
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await pool.execute(
        'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
        [userId, hashToken(refreshToken), expiresAt]
      );

      setTokenCookies(res, accessToken, refreshToken);

      return res.status(201).json({
        message: 'Registration successful',
        user: {
          id: userId,
          username: username.toLowerCase(),
          email: email.toLowerCase(),
          displayName: displayName || username,
          avatar: selectedAvatar,
        },
      });
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } catch (error) {
    next(error);
  }
};

// ─── Login ────────────────────────────────────────────────────────────────────

const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const [rows] = await pool.execute(
      'SELECT id, username, email, password_hash, display_name, avatar FROM users WHERE email = ?',
      [email.toLowerCase()]
    );

    if (rows.length === 0) {
      // Generic message — don't reveal whether email exists
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const { accessToken, refreshToken } = generateTokens(user.id);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await pool.execute(
      'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
      [user.id, hashToken(refreshToken), expiresAt]
    );

    setTokenCookies(res, accessToken, refreshToken);

    return res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.display_name,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Logout ──────────────────────────────────────────────────────────────────

const logout = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      await pool.execute('DELETE FROM refresh_tokens WHERE token_hash = ?', [hashToken(token)]);
    }
    clearTokenCookies(res);
    return res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

// ─── Refresh ──────────────────────────────────────────────────────────────────

const refresh = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch {
      clearTokenCookies(res);
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const tokenHash = hashToken(token);
    const [rows] = await pool.execute(
      'SELECT id FROM refresh_tokens WHERE token_hash = ? AND user_id = ? AND expires_at > NOW()',
      [tokenHash, decoded.userId]
    );

    if (rows.length === 0) {
      clearTokenCookies(res);
      return res.status(401).json({ error: 'Refresh token expired or revoked' });
    }

    // Rotate: delete old token, issue new pair
    await pool.execute('DELETE FROM refresh_tokens WHERE token_hash = ?', [tokenHash]);

    const { accessToken, refreshToken: newRefresh } = generateTokens(decoded.userId);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await pool.execute(
      'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
      [decoded.userId, hashToken(newRefresh), expiresAt]
    );

    setTokenCookies(res, accessToken, newRefresh);
    return res.json({ message: 'Tokens refreshed' });
  } catch (error) {
    next(error);
  }
};

// ─── Me ──────────────────────────────────────────────────────────────────────

const me = async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, username, email, display_name, avatar, created_at FROM users WHERE id = ?',
      [req.user.userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const u = rows[0];
    return res.json({
      id: u.id,
      username: u.username,
      email: u.email,
      displayName: u.display_name,
      avatar: u.avatar,
      createdAt: u.created_at,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, logout, refresh, me, AVATAR_OPTIONS };
