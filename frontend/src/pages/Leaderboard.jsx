import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Trophy, Medal, Crown, RefreshCw, X, Flame, Target, Zap, Clock, ArrowRight } from 'lucide-react';
import Mascot from '../components/Mascot';
import Button from '../components/Button';

const PERIODS = [
  { key: 'daily', label: '📅 Daily' },
  { key: 'weekly', label: '📆 Weekly' },
  { key: 'all', label: '🏆 All-Time' },
  { key: 'challenge', label: '🍌 Daily Challenge' },
];

// Top 3 Podium Visual Component
const Podium = ({ topPlayers, onSelectUser, currentUserId }) => {
  if (!topPlayers || topPlayers.length === 0) return null;

  // Reorder for podium presentation: [2nd, 1st, 3rd]
  const first = topPlayers[0];
  const second = topPlayers[1];
  const third = topPlayers[2];

  const podiumSlots = [
    { player: second, rank: 2, height: '120px', badge: '🥈 2nd', color: '#94A3B8' },
    { player: first, rank: 1, height: '150px', badge: '👑 1st', color: 'var(--color-primary)' },
    { player: third, rank: 3, height: '100px', badge: '🥉 3rd', color: '#CD7F32' },
  ];

  return (
    <div className="podium-container" aria-label="Top 3 Podium">
      {podiumSlots.map(({ player, rank, height, badge, color }) => {
        if (!player) return <div key={rank} className="podium-col empty" />;
        const isMe = currentUserId && player.userId === currentUserId;

        return (
          <motion.div
            key={player.userId}
            className={`podium-col rank-${rank} ${isMe ? 'podium-me' : ''}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: rank * 0.1, duration: 0.5 }}
            onClick={() => onSelectUser(player.username)}
          >
            {/* Crown / Mascot for First Place */}
            {rank === 1 && (
              <div className="podium-mascot-crown">
                <Mascot state="crowned" size={64} />
              </div>
            )}

            <div className="podium-avatar-wrap">
              <span className="podium-avatar">{player.avatar || '🍌'}</span>
              <span className="podium-rank-pill" style={{ background: color }}>
                {badge}
              </span>
            </div>

            <div className="podium-player-name">
              {player.displayName || player.username}
              {isMe && <span className="you-badge">You</span>}
            </div>

            <div className="podium-score banana-text">
              {player.score?.toLocaleString()} pts
            </div>

            {/* Chunky Pedestal Block */}
            <div className="podium-pedestal" style={{ height }}>
              <span className="pedestal-number">#{rank}</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

// Player Profile Modal
const PlayerModal = ({ username, onClose }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    api.get(`/profile/${username}`)
      .then(({ data }) => {
        if (isMounted) setProfile(data);
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, [username]);

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-player-name">
      <motion.div
        className="modal-card glass-card"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close-btn" onClick={onClose} title="Close" aria-label="Close modal">
          <X size={18} />
        </button>

        {loading ? (
          <div className="table-loading" style={{ padding: '2rem' }}>
            <Mascot state="thinking" size={80} />
            <p style={{ marginTop: '0.75rem', fontWeight: 600 }}>Loading lab records...</p>
          </div>
        ) : !profile ? (
          <p style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--color-text-secondary)' }}>
            Player details not found.
          </p>
        ) : (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '0.25rem' }}>{profile.avatar}</div>
              <h2 id="modal-player-name" style={{ fontSize: '1.35rem', fontWeight: 800 }}>
                {profile.displayName || profile.username}
              </h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>@{profile.username}</p>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem', marginTop: '4px' }}>
                Lab member since {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              <div className="stat-card glass-card" style={{ padding: '12px' }}>
                <div style={{ color: 'var(--color-primary)', fontSize: '1.15rem', fontWeight: 800 }}>
                  {profile.stats?.totalScore?.toLocaleString() || 0}
                </div>
                <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem', fontWeight: 600 }}>Total Score</div>
              </div>
              <div className="stat-card glass-card" style={{ padding: '12px' }}>
                <div style={{ color: 'var(--color-correct)', fontSize: '1.15rem', fontWeight: 800 }}>
                  {profile.stats?.accuracy != null ? `${profile.stats.accuracy}%` : '0%'}
                </div>
                <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem', fontWeight: 600 }}>Accuracy</div>
              </div>
              <div className="stat-card glass-card" style={{ padding: '12px' }}>
                <div style={{ color: 'var(--color-streak)', fontSize: '1.15rem', fontWeight: 800 }}>
                  🔥 {profile.stats?.bestStreak || 0}
                </div>
                <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem', fontWeight: 600 }}>Best Streak</div>
              </div>
              <div className="stat-card glass-card" style={{ padding: '12px' }}>
                <div style={{ color: 'var(--color-info)', fontSize: '1.15rem', fontWeight: 800 }}>
                  {profile.stats?.totalGames || 0}
                </div>
                <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem', fontWeight: 600 }}>Puzzles Played</div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

const Leaderboard = () => {
  const { user } = useAuth();
  const [period, setPeriod] = useState('all');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUsername, setSelectedUsername] = useState(null);

  // Auto-refresh without abrupt reshuffle: show a chip if new results detected
  const [hasNewData, setHasNewData] = useState(false);
  const pendingDataRef = useRef(null);

  const fetchLeaderboard = useCallback(async (p = period, pg = page, isBackground = false) => {
    if (!isBackground) setLoading(true);
    else setRefreshing(true);

    try {
      if (p === 'challenge') {
        const { data: res } = await api.get('/game/daily-challenge');
        const formatted = {
          period: 'challenge',
          page: 1,
          limit: 20,
          total: res.leaderboard?.length || 0,
          totalPages: 1,
          leaderboard: res.leaderboard || [],
          myRank: null,
        };
        if (isBackground && JSON.stringify(formatted) !== JSON.stringify(data)) {
          pendingDataRef.current = formatted;
          setHasNewData(true);
        } else if (!isBackground) {
          setData(formatted);
          setHasNewData(false);
        }
      } else {
        const { data: res } = await api.get(`/leaderboard?period=${p}&page=${pg}&limit=20`);
        if (isBackground && JSON.stringify(res) !== JSON.stringify(data)) {
          pendingDataRef.current = res;
          setHasNewData(true);
        } else if (!isBackground) {
          setData(res);
          setHasNewData(false);
        }
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [period, page, data]);

  useEffect(() => {
    setPage(1);
    setHasNewData(false);
    fetchLeaderboard(period, 1, false);
  }, [period]);

  // Background check every 30s
  useEffect(() => {
    const id = setInterval(() => fetchLeaderboard(period, page, true), 30_000);
    return () => clearInterval(id);
  }, [period, page, fetchLeaderboard]);

  const applyPendingRefresh = () => {
    if (pendingDataRef.current) {
      setData(pendingDataRef.current);
      pendingDataRef.current = null;
    }
    setHasNewData(false);
  };

  const handlePeriod = (p) => {
    if (p === period) return;
    setPeriod(p);
  };

  const topThree = data?.leaderboard ? data.leaderboard.slice(0, 3) : [];
  const remainingPlayers = data?.leaderboard ? data.leaderboard.slice(3) : [];

  return (
    <motion.div
      className="leaderboard-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* ── Page Header & Refresh ──────────────────────────────────── */}
      <div className="page-header">
        <h1 className="page-title">
          <Trophy size={30} className="banana-text" />
          <span>Hall of Fame</span>
        </h1>

        <button
          type="button"
          className="refresh-btn"
          onClick={() => fetchLeaderboard(period, page, false)}
          title="Refresh rankings"
          aria-label="Refresh leaderboard"
        >
          <motion.span
            animate={refreshing ? { rotate: 360 } : {}}
            transition={{ repeat: refreshing ? Infinity : 0, duration: 0.8, ease: 'linear' }}
          >
            <RefreshCw size={18} />
          </motion.span>
        </button>
      </div>

      {/* ── Period Navigation Tabs ─────────────────────────────────── */}
      <nav className="period-tabs" role="tablist" aria-label="Leaderboard timeframe">
        {PERIODS.map((tab) => (
          <button
            key={tab.key}
            id={`tab-${tab.key}`}
            role="tab"
            aria-selected={period === tab.key}
            type="button"
            className={`period-tab ${period === tab.key ? 'active' : ''}`}
            onClick={() => handlePeriod(tab.key)}
          >
            {tab.label}
            {period === tab.key && (
              <motion.div
                layoutId="tab-indicator"
                className="tab-indicator"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        ))}
      </nav>

      {/* ── Non-intrusive Refresh Chip ─────────────────────────────── */}
      <AnimatePresence>
        {hasNewData && (
          <motion.div
            className="new-results-chip"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <button
              type="button"
              className="chip-btn"
              onClick={applyPendingRefresh}
            >
              <RefreshCw size={14} /> New results recorded — tap to update!
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Pinned "Your Rank" Bar ─────────────────────────────────── */}
      {data?.myRank && (
        <motion.div
          className="my-rank-banner glass-card"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="my-rank-info">
            <span className="my-rank-label">Your Current Standing:</span>
            <span className="my-rank-value banana-text">#{data.myRank}</span>
          </div>
          <Button to="/game" variant="primary" size="sm">
            Play to Climb
          </Button>
        </motion.div>
      )}

      {/* ── Loading / Empty / Content ──────────────────────────────── */}
      {loading ? (
        <div className="table-loading glass-card">
          <Mascot state="thinking" size={90} />
          <p style={{ fontWeight: 700, marginTop: '1rem' }}>Crunching leaderboard ranks...</p>
        </div>
      ) : data?.leaderboard?.length === 0 ? (
        /* Friendly Empty State with Call to Action */
        <div className="table-empty glass-card" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
          <Mascot state="cheering" size={100} />
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '1rem' }}>No Scores Yet This Period!</h3>
          <p style={{ color: 'var(--color-text-secondary)', maxWidth: '400px', margin: '0.5rem auto 1.5rem' }}>
            Be the very first genius to finish a puzzle round and claim the #1 golden lab crown.
          </p>
          <Button to="/game" variant="primary" size="md">
            Claim #1 Rank Now
          </Button>
        </div>
      ) : (
        <>
          {/* ── Top 3 Podium Visual ──────────────────────────────────── */}
          <Podium
            topPlayers={topThree}
            onSelectUser={(u) => setSelectedUsername(u)}
            currentUserId={user?.id}
          />

          {/* ── Rest of the Ranks: Desktop Table / Mobile Cards ────── */}
          {remainingPlayers.length > 0 && (
            <div className="leaderboard-table-wrap glass-card">
              {/* Desktop Table View */}
              <table className="leaderboard-table desktop-only-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Scientist</th>
                    <th>Score</th>
                    <th>Accuracy</th>
                    <th>Solved</th>
                    {period === 'all' && <th>Best Streak</th>}
                  </tr>
                </thead>
                <tbody>
                  {remainingPlayers.map((entry) => {
                    const isMe = user && entry.userId === user.id;
                    return (
                      <tr
                        key={entry.userId}
                        className={`lb-row ${isMe ? 'lb-row-me' : ''}`}
                        onClick={() => setSelectedUsername(entry.username)}
                        title={`View ${entry.displayName || entry.username}'s lab profile`}
                      >
                        <td><span className="rank-badge rank-default">#{entry.rank}</span></td>
                        <td>
                          <div className="player-cell">
                            <span className="player-avatar">{entry.avatar}</span>
                            <div>
                              <span className="player-name">{entry.displayName || entry.username}</span>
                              {isMe && <span className="you-badge">You</span>}
                            </div>
                          </div>
                        </td>
                        <td><span className="score-cell banana-text">{entry.score?.toLocaleString()}</span></td>
                        <td>
                          <span className={`accuracy-cell ${entry.accuracy >= 80 ? 'acc-high' : entry.accuracy >= 50 ? 'acc-mid' : 'acc-low'}`}>
                            {entry.accuracy != null ? `${entry.accuracy}%` : '—'}
                          </span>
                        </td>
                        <td><span className="games-cell">{entry.total}</span></td>
                        {period === 'all' && (
                          <td>
                            {entry.bestStreak > 0 ? (
                              <span className="streak-cell">🔥 {entry.bestStreak}</span>
                            ) : (
                              <span style={{ color: 'var(--color-text-muted)' }}>—</span>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Mobile Cards View */}
              <div className="mobile-only-cards">
                {remainingPlayers.map((entry) => {
                  const isMe = user && entry.userId === user.id;
                  return (
                    <div
                      key={entry.userId}
                      className={`player-mobile-card ${isMe ? 'lb-row-me' : ''}`}
                      onClick={() => setSelectedUsername(entry.username)}
                    >
                      <div className="mobile-card-header">
                        <span className="rank-badge rank-default">#{entry.rank}</span>
                        <div className="player-cell">
                          <span className="player-avatar">{entry.avatar}</span>
                          <span className="player-name">{entry.displayName || entry.username}</span>
                          {isMe && <span className="you-badge">You</span>}
                        </div>
                        <span className="score-cell banana-text">{entry.score?.toLocaleString()} pts</span>
                      </div>
                      <div className="mobile-card-meta">
                        <span>Accuracy: <strong>{entry.accuracy != null ? `${entry.accuracy}%` : '—'}</strong></span>
                        <span>Solved: <strong>{entry.total}</strong></span>
                        {entry.bestStreak > 0 && <span>Streak: <strong>🔥 {entry.bestStreak}</strong></span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Pagination ─────────────────────────────────────────────── */}
      {data?.leaderboard?.length >= 20 && (
        <div className="pagination">
          <Button
            variant="ghost"
            size="sm"
            disabled={page <= 1}
            onClick={() => { setPage(p => p - 1); fetchLeaderboard(period, page - 1, false); }}
          >
            ← Previous
          </Button>
          <span style={{ fontWeight: 700, color: 'var(--color-text-secondary)' }}>Page {page}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setPage(p => p + 1); fetchLeaderboard(period, page + 1, false); }}
          >
            Next →
          </Button>
        </div>
      )}

      {/* ── Player Profile Modal ───────────────────────────────────── */}
      <AnimatePresence>
        {selectedUsername && (
          <PlayerModal
            username={selectedUsername}
            onClose={() => setSelectedUsername(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Leaderboard;
