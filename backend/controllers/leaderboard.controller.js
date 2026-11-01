const { pool } = require('../config/db');

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Returns 1-based rank of userId in a given period, or null if no games played */
const getUserRank = async (userId, period = 'all') => {
  try {
    if (period === 'all') {
      const [userRows] = await pool.execute(
        'SELECT total_score, total_games FROM user_stats WHERE user_id = ?',
        [userId]
      );
      if (!userRows.length || Number(userRows[0].total_games) === 0) {
        return null;
      }

      const userScore = Number(userRows[0].total_score) || 0;
      const [rows] = await pool.execute(
        `SELECT COUNT(*) + 1 AS rank
         FROM user_stats
         WHERE total_score > ? AND total_games > 0`,
        [userScore]
      );
      return Number(rows[0]?.rank) || null;
    }

    const intervalSQL =
      period === 'daily'
        ? 'DATE(NOW())'
        : 'DATE_SUB(NOW(), INTERVAL 7 DAY)';

    const [userPeriod] = await pool.execute(
      `SELECT COUNT(id) AS played, COALESCE(SUM(score_earned), 0) AS score
       FROM game_sessions
       WHERE user_id = ?
         AND answered_at >= ${intervalSQL}
         AND answered_at IS NOT NULL`,
      [userId]
    );

    if (!userPeriod.length || Number(userPeriod[0].played) === 0) {
      return null;
    }

    const userPeriodScore = Number(userPeriod[0].score) || 0;
    const [rows] = await pool.execute(
      `SELECT COUNT(*) + 1 AS rank
       FROM (
         SELECT user_id, SUM(score_earned) AS score
         FROM game_sessions
         WHERE answered_at >= ${intervalSQL} AND answered_at IS NOT NULL
         GROUP BY user_id
       ) t
       WHERE score > ?`,
      [userPeriodScore]
    );
    return Number(rows[0]?.rank) || null;
  } catch (err) {
    console.error('Error calculating user rank:', err.message);
    return null;
  }
};

// ─── Get Leaderboard ─────────────────────────────────────────────────────────

const getLeaderboard = async (req, res, next) => {
  try {
    const { period = 'all', page = 1, limit = 20 } = req.query;

    const validPeriods = ['all', 'daily', 'weekly'];
    const safePeriod = validPeriods.includes(period) ? period : 'all';
    const limitInt = Math.min(Math.max(parseInt(limit) || 20, 1), 50);
    const pageInt = Math.max(parseInt(page) || 1, 1);
    const offset = (pageInt - 1) * limitInt;

    let rows;

    if (safePeriod === 'all') {
      [rows] = await pool.execute(
        `SELECT
           u.id,
           u.username,
           u.display_name,
           u.avatar,
           us.total_score        AS period_score,
           us.correct_answers    AS correct,
           us.total_games        AS total,
           us.best_streak,
           ROUND(us.correct_answers / NULLIF(us.total_games,0) * 100, 1) AS accuracy
         FROM users u
         INNER JOIN user_stats us ON u.id = us.user_id
         WHERE us.total_games > 0
         ORDER BY us.total_score DESC
         LIMIT ? OFFSET ?`,
        [limitInt, offset]
      );
    } else {
      const intervalSQL =
        safePeriod === 'daily'
          ? 'DATE(NOW())'
          : 'DATE_SUB(NOW(), INTERVAL 7 DAY)';

      [rows] = await pool.execute(
        `SELECT
           u.id,
           u.username,
           u.display_name,
           u.avatar,
           COALESCE(SUM(gs.score_earned), 0) AS period_score,
           COUNT(CASE WHEN gs.is_correct = 1 THEN 1 END) AS correct,
           COUNT(gs.id) AS total,
           NULL AS best_streak,
           ROUND(
             COUNT(CASE WHEN gs.is_correct = 1 THEN 1 END)
             / NULLIF(COUNT(gs.id), 0) * 100,
             1
           ) AS accuracy
         FROM users u
         INNER JOIN game_sessions gs
           ON u.id = gs.user_id
           AND gs.answered_at >= ${intervalSQL}
           AND gs.answered_at IS NOT NULL
         GROUP BY u.id
         HAVING period_score > 0
         ORDER BY period_score DESC
         LIMIT ? OFFSET ?`,
        [limitInt, offset]
      );
    }

    // My rank (optional — user may not be logged in on this route, but authenticate is applied)
    const myRank = req.user ? await getUserRank(req.user.userId, safePeriod) : null;

    const leaderboard = rows.map((row, i) => ({
      rank: offset + i + 1,
      userId: row.id,
      username: row.username,
      displayName: row.display_name,
      avatar: row.avatar,
      score: Number(row.period_score),
      correct: Number(row.correct) || 0,
      total: Number(row.total) || 0,
      accuracy: Number(row.accuracy) || 0,
      bestStreak: row.best_streak != null ? Number(row.best_streak) : null,
    }));

    return res.json({ leaderboard, myRank, period: safePeriod, page: pageInt, limit: limitInt });
  } catch (error) {
    next(error);
  }
};

// ─── Get My Rank ─────────────────────────────────────────────────────────────

const getMyRank = async (req, res, next) => {
  try {
    const { period = 'all' } = req.query;
    const validPeriods = ['all', 'daily', 'weekly'];
    const safePeriod = validPeriods.includes(period) ? period : 'all';

    const rank = await getUserRank(req.user.userId, safePeriod);

    const [stats] = await pool.execute(
      'SELECT total_score, total_games FROM user_stats WHERE user_id = ?',
      [req.user.userId]
    );

    return res.json({
      rank,
      score: Number(stats[0]?.total_score) || 0,
      totalGames: Number(stats[0]?.total_games) || 0,
      period: safePeriod,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getLeaderboard, getMyRank };
