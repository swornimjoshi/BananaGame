import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Trophy, Medal, Crown, RefreshCw, X, Flame, Target, Zap, Clock } from 'lucide-react';

const PERIODS = [
  { key: 'daily', label: '📅 Daily' },
  { key: 'weekly', label: '📆 Weekly' },
  { key: 'all', label: '🏆 All-Time' },
  { key: 'challenge', label: '🍌 Daily Challenge' },
];

const RankBadge = ({ rank }) => {
  if (rank === 1) return <span className="rank-badge rank-1"><Crown size={14} /> 1</span>;
  if (rank === 2) return <span className="rank-badge rank-2"><Medal size={14} /> 2</span>;
  if (rank === 3) return <span className="rank-badge rank-3"><Medal size={14} /> 3</span>;
  return <span className="rank-badge rank-default">#{rank}</span>;
};

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
    <motion.div
      className="modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="modal-card glass-card"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close-btn" onClick={onClose} title="Close">
          <X size={18} />
        </button>

        {loading ? (
          <div className="table-loading" style={{ padding: '2rem' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} style={{ fontSize: '2rem' }}>🍌</motion.div>
            <p>Loading player details...</p>
          </div>
        ) : !profile ? (
          <p style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-secondary)' }}>Player not found.</p>
        ) : (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '0.25rem' }}>{profile.avatar}</div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>{profile.displayName || profile.username}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>@{profile.username}</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '4px' }}>
                Member since {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              <div className="stat-card glass-card" style={{ padding: '10px 14px' }}>
                <div style={{ color: 'var(--color-banana)', fontSize: '1.1rem', fontWeight: 700 }}>
                  {profile.stats?.totalScore?.toLocaleString() || 0}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Total Score</div>
              </div>
              <div className="stat-card glass-card" style={{ padding: '10px 14px' }}>
                <div style={{ color: 'var(--color-green)', fontSize: '1.1rem', fontWeight: 700 }}>
                  {profile.stats?.accuracy != null ? `${profile.stats.accuracy}%` : '0%'}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Accuracy</div>
              </div>
              <div className="stat-card glass-card" style={{ padding: '10px 14px' }}>
                <div style={{ color: 'var(--color-orange)', fontSize: '1.1rem', fontWeight: 700 }}>
                  🔥 {profile.stats?.bestStreak || 0}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Best Streak</div>
              </div>
              <div className="stat-card glass-card" style={{ padding: '10px 14px' }}>
                <div style={{ color: '#06b6d4', fontSize: '1.1rem', fontWeight: 700 }}>
                  {profile.stats?.totalGames || 0}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Games Played</div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
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

  const fetchLeaderboard = useCallback(async (p = period, pg = page, showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      if (p === 'challenge') {
        const { data: res } = await api.get('/game/daily-challenge');
        setData({
          period: 'challenge',
          page: 1,
          limit: 20,
          total: res.leaderboard?.length || 0,
          totalPages: 1,
          leaderboard: res.leaderboard || [],
          myRank: null,
        });
      } else {
        const { data: res } = await api.get(`/leaderboard?period=${p}&page=${pg}&limit=20`);
        setData(res);
      }
    } catch {
      // silent fail
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [period, page]);

  useEffect(() => {
    setPage(1);
    fetchLeaderboard(period, 1);
  }, [period]);

  // Auto-refresh every 30s
  useEffect(() => {
    const id = setInterval(() => fetchLeaderboard(period, page, true), 30_000);
    return () => clearInterval(id);
  }, [period, page, fetchLeaderboard]);

  const handlePeriod = (p) => {
    if (p === period) return;
    setPeriod(p);
  };

  return (
    <motion.div
      className="leaderboard-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="page-header">
        <h1 className="page-title"><Trophy size={28} className="banana-text" /> Leaderboard</h1>
        <button
          className="refresh-btn"
          onClick={() => fetchLeaderboard(period, page, true)}
          title="Refresh"
        >
          <motion.span animate={refreshing ? { rotate: 360 } : {}} transition={{ repeat: refreshing ? Infinity : 0, duration: 0.8, ease: 'linear' }}>
            <RefreshCw size={16} />
          </motion.span>
        </button>
      </div>

      {/* Period tabs */}
      <div className="period-tabs">
        {PERIODS.map((tab) => (
          <motion.button
            key={tab.key}
            id={`tab-${tab.key}`}
            className={`period-tab ${period === tab.key ? 'active' : ''}`}
            onClick={() => handlePeriod(tab.key)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {tab.label}
            {period === tab.key && (
              <motion.div layoutId="tab-indicator" className="tab-indicator" transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
            )}
          </motion.button>
        ))}
      </div>

      {/* My rank banner */}
      {data?.myRank && (
        <motion.div
          className="my-rank-banner glass-card"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <span className="my-rank-label">Your Rank</span>
          <span className="my-rank-value banana-text">#{data.myRank}</span>
        </motion.div>
      )}

      {/* Table */}
      <div className="leaderboard-table-wrap glass-card">
        {loading ? (
          <div className="table-loading">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              style={{ fontSize: '2rem' }}
            >
              🍌
            </motion.div>
            <p>Loading rankings...</p>
          </div>
        ) : data?.leaderboard?.length === 0 ? (
          <div className="table-empty">
            <p>🍌 No entries yet for this period.<br />Be the first to play!</p>
          </div>
        ) : (
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>Score</th>
                <th>Accuracy</th>
                <th>Games</th>
                {period === 'all' && <th>Best Streak</th>}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {data?.leaderboard?.map((entry, i) => {
                  const isMe = user && entry.userId === user.id;
                  return (
                    <motion.tr
                      key={entry.userId}
                      className={`lb-row ${isMe ? 'lb-row-me' : ''} ${entry.rank <= 3 ? `lb-row-top${entry.rank}` : ''}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => setSelectedUsername(entry.username)}
                      style={{ cursor: 'pointer' }}
                      title={`View @${entry.username}'s profile`}
                    >
                      <td><RankBadge rank={entry.rank} /></td>
                      <td>
                        <div className="player-cell">
                          <span className="player-avatar">{entry.avatar}</span>
                          <div>
                            <span className="player-name">{entry.displayName || entry.username}</span>
                            {isMe && <span className="you-badge">You</span>}
                          </div>
                        </div>
                      </td>
                      <td><span className="score-cell banana-text">{entry.score.toLocaleString()}</span></td>
                      <td>
                        <span className={`accuracy-cell ${entry.accuracy >= 80 ? 'acc-high' : entry.accuracy >= 50 ? 'acc-mid' : 'acc-low'}`}>
                          {entry.accuracy != null ? `${entry.accuracy}%` : '—'}
                        </span>
                      </td>
                      <td><span className="games-cell">{entry.total}</span></td>
                      {period === 'all' && (
                        <td>
                          {entry.bestStreak > 0
                            ? <span className="streak-cell">🔥 {entry.bestStreak}</span>
                            : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                        </td>
                      )}
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {data?.leaderboard?.length >= 20 && (
        <div className="pagination">
          <button
            className="btn btn-ghost btn-sm"
            disabled={page <= 1}
            onClick={() => { setPage(p => p - 1); fetchLeaderboard(period, page - 1); }}
          >
            ← Prev
          </button>
          <span style={{ color: 'var(--text-secondary)' }}>Page {page}</span>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => { setPage(p => p + 1); fetchLeaderboard(period, page + 1); }}
          >
            Next →
          </button>
        </div>
      )}

      {/* Player profile modal */}
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
