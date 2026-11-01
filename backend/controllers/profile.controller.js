const { pool } = require('../config/db');
const { validationResult } = require('express-validator');
const { AVATAR_OPTIONS } = require('./auth.controller');

// ─── Get Any Public Profile ──────────────────────────────────────────────────

const getProfile = async (req, res, next) => {
  try {
    const { username } = req.params;

    const [rows] = await pool.execute(
      `SELECT u.id, u.username, u.display_name, u.avatar, u.created_at,
              us.total_score, us.total_games, us.correct_answers,
              us.best_streak, us.current_streak, us.total_time_ms, us.last_played
       FROM users u
       LEFT JOIN user_stats us ON u.id = us.user_id
       WHERE u.username = ?`,
      [username.toLowerCase()]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const u = rows[0];
    const totalGames = Number(u.total_games) || 0;
    const correctAnswers = Number(u.correct_answers) || 0;
    const accuracy = totalGames > 0 ? Math.round((correctAnswers / totalGames) * 1000) / 10 : 0;
    const avgTimeMs = totalGames > 0 ? Math.round(Number(u.total_time_ms) / totalGames) : 0;

    return res.json({
      id: u.id,
      username: u.username,
      displayName: u.display_name,
      avatar: u.avatar,
      createdAt: u.created_at,
      stats: {
        totalScore: Number(u.total_score) || 0,
        totalGames,
        correctAnswers,
        accuracy,
        bestStreak: Number(u.best_streak) || 0,
        currentStreak: Number(u.current_streak) || 0,
        avgTimeMs,
        lastPlayed: u.last_played,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get Own Profile (with email + history) ──────────────────────────────────

const getMyProfile = async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT u.id, u.username, u.email, u.display_name, u.avatar, u.created_at,
              us.total_score, us.total_games, us.correct_answers,
              us.best_streak, us.current_streak, us.total_time_ms, us.last_played
       FROM users u
       LEFT JOIN user_stats us ON u.id = us.user_id
       WHERE u.id = ?`,
      [req.user.userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const u = rows[0];
    const totalGames = Number(u.total_games) || 0;
    const correctAnswers = Number(u.correct_answers) || 0;
    const accuracy = totalGames > 0 ? Math.round((correctAnswers / totalGames) * 1000) / 10 : 0;
    const avgTimeMs = totalGames > 0 ? Math.round(Number(u.total_time_ms) / totalGames) : 0;

    // Recent 15 games
    const [history] = await pool.execute(
      `SELECT id, question_image_url, is_correct, answer_given, score_earned,
              time_taken_ms, started_at, answered_at
       FROM game_sessions
       WHERE user_id = ? AND answered_at IS NOT NULL
       ORDER BY answered_at DESC
       LIMIT 15`,
      [req.user.userId]
    );

    return res.json({
      id: u.id,
      username: u.username,
      email: u.email,
      displayName: u.display_name,
      avatar: u.avatar,
      createdAt: u.created_at,
      stats: {
        totalScore: Number(u.total_score) || 0,
        totalGames,
        correctAnswers,
        accuracy,
        bestStreak: Number(u.best_streak) || 0,
        currentStreak: Number(u.current_streak) || 0,
        avgTimeMs,
        lastPlayed: u.last_played,
      },
      recentGames: history.map((g) => ({
        id: g.id,
        questionUrl: g.question_image_url,
        isCorrect: Boolean(g.is_correct),
        answerGiven: g.answer_given,
        scoreEarned: g.score_earned,
        timeTakenMs: g.time_taken_ms,
        playedAt: g.answered_at,
      })),
    });
  } catch (error) {
    next(error);
  }
};

// ─── Update Profile ───────────────────────────────────────────────────────────

const updateProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { displayName, avatar } = req.body;
    const updates = [];
    const values = [];

    if (displayName !== undefined) {
      updates.push('display_name = ?');
      values.push(displayName.trim());
    }
    if (avatar !== undefined) {
      if (!AVATAR_OPTIONS.includes(avatar)) {
        return res.status(400).json({ error: 'Invalid avatar selection' });
      }
      updates.push('avatar = ?');
      values.push(avatar);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    values.push(req.user.userId);
    await pool.execute(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);

    const [updated] = await pool.execute(
      'SELECT id, username, email, display_name, avatar FROM users WHERE id = ?',
      [req.user.userId]
    );

    const u = updated[0];
    return res.json({
      message: 'Profile updated',
      user: { id: u.id, username: u.username, email: u.email, displayName: u.display_name, avatar: u.avatar },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Avatar Options ───────────────────────────────────────────────────────────

const getAvatarOptions = (req, res) => {
  res.json({ avatars: AVATAR_OPTIONS });
};

module.exports = { getProfile, getMyProfile, updateProfile, getAvatarOptions };
