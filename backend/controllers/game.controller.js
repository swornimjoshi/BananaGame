const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/db');
const { validationResult } = require('express-validator');

const TIME_LIMIT_MS = 30_000;      // 30s shown to user
const ANSWER_DEADLINE_MS = 35_000; // 35s server-side window (5s grace)

// ─── Banana API Resolver & Fetcher ──────────────────────────────────────────

const resolveBananaEndpoints = (rawUrl) => {
  let clean = (rawUrl || 'https://marcconrad.com/uob/banana/').trim();
  // Strip trailing slashes
  clean = clean.replace(/\/+$/, '');

  // If user passed root or directory e.g. "https://marcconrad.com/uob/banana"
  if (!clean.includes('api.php')) {
    clean = `${clean}/api.php`;
  }
  // Ensure out=json is present
  if (!clean.includes('out=')) {
    clean = clean.includes('?') ? `${clean}&out=json` : `${clean}?out=json`;
  }

  const endpoints = [clean];
  if (clean.startsWith('https://')) {
    endpoints.push(clean.replace('https://', 'http://'));
  } else if (clean.startsWith('http://')) {
    endpoints.push(clean.replace('http://', 'https://'));
  }
  return endpoints;
};

const fetchBananaPuzzle = async () => {
  const endpoints = resolveBananaEndpoints(
    process.env.BANANA_API_URL || 'https://marcconrad.com/uob/banana/'
  );
  let lastError = null;

  for (const url of endpoints) {
    try {
      const response = await axios.get(url, {
        timeout: 10_000,
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'User-Agent': 'BananaGame/1.0',
        },
      });

      let data = response.data;
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data.trim());
        } catch {
          continue;
        }
      }

      if (data && data.question && data.solution !== undefined && data.solution !== null) {
        return data;
      }
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error('Invalid response from Banana API');
};

// ─── Start Game ──────────────────────────────────────────────────────────────

const startGame = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // Check if player had a previous unanswered session that timed out — if so, mark expired & reset streak
    const [staleSessions] = await pool.execute(
      `SELECT id FROM game_sessions
       WHERE user_id = ? AND answered_at IS NULL AND is_expired = FALSE
         AND started_at < DATE_SUB(NOW(), INTERVAL 35 SECOND)`,
      [userId]
    );

    if (staleSessions.length > 0) {
      await pool.execute(
        `UPDATE game_sessions
         SET is_expired = TRUE
         WHERE user_id = ? AND answered_at IS NULL AND is_expired = FALSE
           AND started_at < DATE_SUB(NOW(), INTERVAL 35 SECOND)`,
        [userId]
      );
      await pool.execute(
        `UPDATE user_stats SET current_streak = 0 WHERE user_id = ?`,
        [userId]
      );
    }

    // Fetch from Marc Conrad's Banana API server-side — solution never touches client
    let apiData;
    try {
      apiData = await fetchBananaPuzzle();
    } catch (err) {
      const isTimeout = err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT';
      return res.status(isTimeout ? 504 : 502).json({
        error: isTimeout ? 'Game API timed out, please try again' : 'Failed to reach Banana API (https://marcconrad.com/uob/banana/)',
      });
    }

    const { question, solution } = apiData;

    if (!question || solution === undefined || solution === null) {
      return res.status(502).json({ error: 'Invalid response from Banana API' });
    }

    const solutionInt = parseInt(solution, 10);
    if (isNaN(solutionInt) || solutionInt < 0 || solutionInt > 9) {
      return res.status(502).json({ error: 'Malformed solution from Banana API' });
    }

    const sessionId = uuidv4();

    // Fetch and pre-buffer image data into Base64 so frontend renders INSTANTLY with 0ms image delay
    let imageDataUri = null;
    try {
      const imgRes = await axios.get(question, {
        responseType: 'arraybuffer',
        timeout: 6000,
        headers: {
          'User-Agent': 'BananaGame/1.0',
        },
      });
      const contentType = imgRes.headers['content-type'] || 'image/png';
      const b64 = Buffer.from(imgRes.data).toString('base64');
      imageDataUri = `data:${contentType};base64,${b64}`;
    } catch (imgErr) {
      console.warn('Direct image prefetch fallback to URL:', imgErr.message);
    }

    // Store session — solution kept ONLY in DB
    await pool.execute(
      'INSERT INTO game_sessions (id, user_id, question_image_url, solution) VALUES (?, ?, ?, ?)',
      [sessionId, req.user.userId, question, solutionInt]
    );

    // Return session ID, instant imageDataUri, proxied image URL, and direct fallback
    return res.json({
      sessionId,
      questionDataUri: imageDataUri, // Instant Base64 puzzle image (no extra HTTP roundtrip!)
      questionUrl: imageDataUri || `/api/game/image/${sessionId}`,
      directQuestionUrl: question,
      timeLimit: 30,
      startedAt: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

// ─── Answer Game ─────────────────────────────────────────────────────────────

const answerGame = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { sessionId, answer } = req.body;
    const answerInt = parseInt(answer);

    if (isNaN(answerInt) || answerInt < 0 || answerInt > 9) {
      return res.status(400).json({ error: 'Answer must be a digit 0-9' });
    }

    // Fetch session — must belong to this user and not yet answered
    const [sessions] = await pool.execute(
      `SELECT id, solution, started_at, answered_at, is_expired, hints_used,
              TIMESTAMPDIFF(MICROSECOND, started_at, NOW()) / 1000 AS db_elapsed_ms
       FROM game_sessions
       WHERE id = ? AND user_id = ?`,
      [sessionId, req.user.userId]
    );

    if (sessions.length === 0) {
      return res.status(404).json({ error: 'Game session not found' });
    }

    const session = sessions[0];

    if (session.answered_at) {
      return res.status(409).json({ error: 'Question already answered' });
    }
    if (session.is_expired) {
      return res.status(410).json({ error: 'Session expired', timeExpired: true });
    }

    // Safely calculate elapsed milliseconds using MySQL's TIMESTAMPDIFF
    let timeTakenMs = Math.round(Number(session.db_elapsed_ms));
    if (isNaN(timeTakenMs) || timeTakenMs < 0) {
      const jsElapsed = Date.now() - new Date(session.started_at).getTime();
      timeTakenMs = Math.max(0, isNaN(jsElapsed) ? 0 : jsElapsed);
    }
    // Clamp to prevent any negative or out-of-range integer values
    timeTakenMs = Math.max(0, Math.min(300000, timeTakenMs));

    // Server-side time validation (extra 5s grace period)
    if (timeTakenMs > ANSWER_DEADLINE_MS) {
      await pool.execute('UPDATE game_sessions SET is_expired = TRUE WHERE id = ?', [sessionId]);
      return res.status(410).json({ error: 'Time expired!', timeExpired: true });
    }

    const isCorrect = answerInt === session.solution;

    // Get current streak
    const [statsRows] = await pool.execute(
      'SELECT current_streak, best_streak FROM user_stats WHERE user_id = ?',
      [req.user.userId]
    );
    const stats = statsRows[0] || { current_streak: 0, best_streak: 0 };

    const newStreak = isCorrect ? stats.current_streak + 1 : 0;
    const newBestStreak = Math.max(stats.best_streak, newStreak);

    // Score calculation & Point System
    let baseScore = 0;
    let timeBonus = 0;
    let multiplier = 1;
    let hintPenalty = 0;
    let scoreEarned = 0;

    if (isCorrect) {
      baseScore = 100;
      timeBonus = Math.floor(50 * Math.max(0, 1 - timeTakenMs / TIME_LIMIT_MS));
      if (newStreak >= 10) multiplier = 3;
      else if (newStreak >= 6) multiplier = 2;
      else if (newStreak >= 3) multiplier = 1.5;

      const hintsCount = Number(session.hints_used) || 0;
      if (hintsCount === 1) hintPenalty = 15;
      else if (hintsCount === 2) hintPenalty = 35;
      else if (hintsCount >= 3) hintPenalty = 60;

      const grossScore = Math.floor((baseScore + timeBonus) * multiplier);
      scoreEarned = Math.max(10, grossScore - hintPenalty);
    }

    // Update session
    await pool.execute(
      `UPDATE game_sessions
       SET answered_at = NOW(), is_correct = ?, answer_given = ?, time_taken_ms = ?, score_earned = ?
       WHERE id = ?`,
      [isCorrect, answerInt, timeTakenMs, scoreEarned, sessionId]
    );

    // Update aggregate stats
    await pool.execute(
      `UPDATE user_stats
       SET total_score      = total_score + ?,
           total_games      = total_games + 1,
           correct_answers  = correct_answers + ?,
           current_streak   = ?,
           best_streak      = ?,
           total_time_ms    = total_time_ms + ?,
           last_played      = NOW()
       WHERE user_id = ?`,
      [scoreEarned, isCorrect ? 1 : 0, newStreak, newBestStreak, timeTakenMs, req.user.userId]
    );

    const [updated] = await pool.execute(
      'SELECT total_score FROM user_stats WHERE user_id = ?',
      [req.user.userId]
    );

    // Generate simple explanation of the solution
    const parityWord = session.solution === 0 ? 'zero' : session.solution % 2 === 0 ? 'even' : 'odd';
    const explanation = `In this puzzle, replacing the question mark with ${session.solution} balances the equations. Note that ${session.solution} is an ${parityWord} single-digit number (${session.solution <= 4 ? '0–4' : '5–9'} range).`;

    return res.json({
      correct: isCorrect,
      // Reveal solution AFTER answer (session consumed — safe for UX feedback)
      correctAnswer: session.solution,
      explanation,
      hintsUsed: Number(session.hints_used) || 0,
      scoreEarned,
      breakdown: {
        baseScore,
        timeBonus,
        multiplier,
        hintPenalty,
      },
      timeTakenMs,
      newStreak,
      bestStreak: newBestStreak,
      totalScore: Number(updated[0]?.total_score) || 0,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Request Hint (3-Step Progressive Hint System) ──────────────────────────

const requestHint = async (req, res, next) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    const [sessions] = await pool.execute(
      `SELECT id, solution, answered_at, is_expired, hints_used
       FROM game_sessions
       WHERE id = ? AND user_id = ?`,
      [sessionId, req.user.userId]
    );

    if (sessions.length === 0) {
      return res.status(404).json({ error: 'Game session not found' });
    }

    const session = sessions[0];
    if (session.answered_at) {
      return res.status(409).json({ error: 'Question already answered' });
    }
    if (session.is_expired) {
      return res.status(410).json({ error: 'Session expired' });
    }

    const currentHintsUsed = Number(session.hints_used) || 0;
    if (currentHintsUsed >= 3) {
      return res.status(400).json({ error: 'Maximum 3 hints already used for this question' });
    }

    const nextStep = currentHintsUsed + 1;
    const sol = session.solution; // 0 to 9

    let hintTitle = '';
    let hintText = '';
    let eliminatedDigits = [];
    let penalty = 0;

    const allDigits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const wrongDigits = allDigits.filter((d) => d !== sol);

    // Deterministic shuffle based on sessionId so hints remain consistent
    const seed = sessionId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const shuffledWrong = [...wrongDigits].sort((a, b) => {
      const hashA = (a * 9301 + 49297 + seed) % 233280;
      const hashB = (b * 9301 + 49297 + seed) % 233280;
      return hashA - hashB;
    });

    if (nextStep === 1) {
      // Step 1: Parity & Range clue - cheap hint (-15 pts)
      penalty = 15;
      hintTitle = 'Step 1/3: Number Type & Range';
      const parity = sol === 0 ? 'zero (an even number)' : sol % 2 === 0 ? 'an EVEN number' : 'an ODD number';
      const range = sol <= 4 ? 'Low range (0 to 4)' : 'High range (5 to 9)';
      hintText = `The missing digit is ${parity} and is in the ${range}.`;
      eliminatedDigits = [];
    } else if (nextStep === 2) {
      // Step 2: Eliminate 4 wrong digits - costlier hint (-35 pts)
      penalty = 35;
      hintTitle = 'Step 2/3: Narrow Down';
      eliminatedDigits = shuffledWrong.slice(0, 4).sort((a, b) => a - b);
      const remainingCandidates = allDigits.filter((d) => !eliminatedDigits.includes(d));
      hintText = `Eliminated 4 wrong choices: [${eliminatedDigits.join(', ')}]. Remaining candidates: [${remainingCandidates.join(', ')}].`;
    } else if (nextStep === 3) {
      // Step 3: 50/50 final hint - eliminate 8 wrong digits leaving only 2 digits (-60 pts)
      penalty = 60;
      hintTitle = 'Step 3/3: 50/50 Final Showdown';
      const decoy = shuffledWrong[shuffledWrong.length - 1];
      eliminatedDigits = allDigits.filter((d) => d !== sol && d !== decoy).sort((a, b) => a - b);
      const choices = [sol, decoy].sort((a, b) => a - b);
      hintText = `50/50 Chance! The missing digit is definitely either ${choices[0]} or ${choices[1]}!`;
    }

    await pool.execute(
      'UPDATE game_sessions SET hints_used = ? WHERE id = ?',
      [nextStep, sessionId]
    );

    return res.json({
      step: nextStep,
      title: hintTitle,
      text: hintText,
      eliminatedDigits,
      penalty,
      remainingHints: 3 - nextStep,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Expire Game (Client timer reached 0) ───────────────────────────────────

const expireGame = async (req, res, next) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID required' });
    }

    const [sessions] = await pool.execute(
      `SELECT id, solution, answered_at, is_expired
       FROM game_sessions
       WHERE id = ? AND user_id = ?`,
      [sessionId, req.user.userId]
    );

    if (sessions.length === 0) {
      return res.status(404).json({ error: 'Game session not found' });
    }

    const session = sessions[0];
    if (!session.answered_at && !session.is_expired) {
      await pool.execute(
        'UPDATE game_sessions SET is_expired = TRUE WHERE id = ?',
        [sessionId]
      );
      await pool.execute(
        'UPDATE user_stats SET current_streak = 0 WHERE user_id = ?',
        [req.user.userId]
      );
    }

    return res.json({
      message: 'Session expired',
      correctAnswer: session.solution,
      currentStreak: 0,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get Question Image (Proxied to prevent CORS & mixed-content issues) ───

const getQuestionImage = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    if (!sessionId) {
      return res.status(400).send('Session ID required');
    }

    const [sessions] = await pool.execute(
      'SELECT question_image_url FROM game_sessions WHERE id = ?',
      [sessionId]
    );

    if (sessions.length === 0) {
      return res.status(404).send('Session not found');
    }

    const imageUrl = sessions[0].question_image_url;

    // In case base64 string was stored
    if (imageUrl.startsWith('data:image/')) {
      const parts = imageUrl.split(',');
      const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/png';
      const imgBuffer = Buffer.from(parts[1], 'base64');
      res.setHeader('Content-Type', mime);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.send(imgBuffer);
    }

    // Stream/buffer remote image
    const imageResponse = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 10_000,
    });

    const contentType = imageResponse.headers['content-type'] || 'image/png';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.send(Buffer.from(imageResponse.data));
  } catch (error) {
    return res.status(502).send('Failed to proxy question image');
  }
};

// ─── Daily Challenge Endpoint ───────────────────────────────────────────────

const getDailyChallenge = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const [leaderboard] = await pool.execute(
      `SELECT u.username, u.display_name, u.avatar, gs.score_earned, gs.time_taken_ms, gs.created_at
       FROM game_sessions gs
       JOIN users u ON gs.user_id = u.id
       WHERE DATE(gs.started_at) = ? AND gs.is_correct = TRUE
       ORDER BY gs.score_earned DESC, gs.time_taken_ms ASC
       LIMIT 10`,
      [today]
    );

    return res.json({
      date: today,
      title: `Daily Banana Challenge (${today})`,
      leaderboard: leaderboard.map((row) => ({
        username: row.username,
        displayName: row.display_name || row.username,
        avatar: row.avatar,
        score: row.score_earned,
        timeTakenMs: row.time_taken_ms,
      })),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { startGame, answerGame, expireGame, getQuestionImage, requestHint, getDailyChallenge };
