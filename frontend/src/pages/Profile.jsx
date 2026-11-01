import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Edit2, Save, X, CheckCircle, XCircle, Clock, Zap, Flame, Target, Trophy } from 'lucide-react';

const StatCard = ({ icon, label, value, color, subtitle }) => (
  <motion.div
    className="stat-card glass-card"
    whileHover={{ y: -4, boxShadow: '0 8px 32px rgba(247,201,72,0.12)' }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
  >
    <div className="stat-card-icon" style={{ color }}>{icon}</div>
    <div className="stat-card-val" style={{ color }}>{value}</div>
    <div className="stat-card-label">{label}</div>
    {subtitle && <div className="stat-card-sub">{subtitle}</div>}
  </motion.div>
);

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [avatars, setAvatars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ displayName: '', avatar: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [profileRes, avatarRes] = await Promise.all([
          api.get('/profile/me'),
          api.get('/profile/avatars'),
        ]);
        setProfile(profileRes.data);
        setAvatars(avatarRes.data.avatars);
        setForm({ displayName: profileRes.data.displayName || '', avatar: profileRes.data.avatar || '🍌' });
      } catch {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.put('/profile/me', form);
      setProfile((p) => ({ ...p, ...data.user, displayName: data.user.displayName }));
      updateUser({ displayName: data.user.displayName, avatar: data.user.avatar });
      toast.success('Profile updated! 🍌');
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-loader">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} style={{ fontSize: '2.5rem' }}>🍌</motion.div>
        <p>Loading profile...</p>
      </div>
    );
  }

  const stats = profile?.stats || {};
  const avgSecs = stats.avgTimeMs ? (stats.avgTimeMs / 1000).toFixed(1) : '—';
  const accuracy = stats.accuracy != null ? `${stats.accuracy}%` : '—';

  return (
    <motion.div
      className="profile-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Profile card */}
      <div className="profile-header glass-card">
        <motion.div
          className="profile-avatar-big"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 3 }}
        >
          {editing ? form.avatar : profile?.avatar}
        </motion.div>

        {editing ? (
          <div style={{ width: '100%' }}>
            {/* Avatar picker */}
            <p className="avatar-label" style={{ textAlign: 'center', marginBottom: '0.75rem' }}>Pick your avatar</p>
            <div className="avatar-grid avatar-grid-profile">
              {avatars.map((av) => (
                <motion.button
                  key={av}
                  type="button"
                  className={`avatar-btn ${form.avatar === av ? 'selected' : ''}`}
                  onClick={() => setForm((p) => ({ ...p, avatar: av }))}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {av}
                </motion.button>
              ))}
            </div>
            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label className="form-label">Display Name</label>
              <input
                id="profile-display-name"
                type="text"
                className="form-input"
                value={form.displayName}
                maxLength={50}
                onChange={(e) => setForm((p) => ({ ...p, displayName: e.target.value }))}
                placeholder="Your display name"
              />
            </div>
            <div className="profile-edit-actions">
              <motion.button
                className="btn btn-primary btn-sm"
                onClick={handleSave}
                disabled={saving}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {saving ? '🍌' : <><Save size={14} /> Save</>}
              </motion.button>
              <motion.button
                className="btn btn-ghost btn-sm"
                onClick={() => { setEditing(false); setForm({ displayName: profile.displayName || '', avatar: profile.avatar }); }}
                whileHover={{ scale: 1.05 }}
              >
                <X size={14} /> Cancel
              </motion.button>
            </div>
          </div>
        ) : (
          <>
            <div className="profile-info">
              <h1 className="profile-display-name">{profile?.displayName || profile?.username}</h1>
              <p className="profile-username">@{profile?.username}</p>
              <p className="profile-email" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{profile?.email}</p>
              <p className="profile-joined" style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                Joined {new Date(profile?.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
              </p>
            </div>
            <motion.button
              id="edit-profile-btn"
              className="btn btn-ghost btn-sm edit-btn"
              onClick={() => setEditing(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Edit2 size={14} /> Edit Profile
            </motion.button>
          </>
        )}
      </div>

      {/* Stats grid */}
      <div className="stats-grid">
        <StatCard icon={<Trophy size={22} />} label="Total Score" value={stats.totalScore?.toLocaleString() || '0'} color="var(--color-banana)" />
        <StatCard icon={<Target size={22} />} label="Accuracy" value={accuracy} color="var(--color-green)" subtitle={`${stats.correctAnswers || 0} / ${stats.totalGames || 0} correct`} />
        <StatCard icon={<Flame size={22} />} label="Best Streak" value={stats.bestStreak || 0} color="var(--color-orange)" subtitle={`Current: ${stats.currentStreak || 0}`} />
        <StatCard icon={<Clock size={22} />} label="Avg Speed" value={`${avgSecs}s`} color="var(--color-purple)" subtitle="per question" />
        <StatCard icon={<Zap size={22} />} label="Puzzles Solved" value={stats.correctAnswers || 0} color="#06b6d4" subtitle={`${stats.totalGames || 0} attempts`} />
        <StatCard
          icon={<span style={{ fontSize: '1.2rem' }}>🍌</span>}
          label="Last Played"
          value={stats.lastPlayed ? new Date(stats.lastPlayed).toLocaleDateString() : 'Never'}
          color="var(--text-secondary)"
        />
      </div>

      {/* History Performance Chart */}
      {profile?.recentGames?.length > 0 && (
        <div className="history-chart-card glass-card">
          <h2 className="section-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            📊 Recent Performance Trend (Score per game)
          </h2>
          <div className="history-chart-bars">
            {profile.recentGames.slice(0, 10).reverse().map((g, idx) => {
              const maxScore = 450;
              const barHeightPct = Math.max(10, Math.min(100, Math.round((g.scoreEarned / maxScore) * 100)));
              return (
                <div key={g.id || idx} className="chart-bar-col" title={`Game ${idx + 1}: ${g.scoreEarned} pts`}>
                  <span className="bar-label-top">+{g.scoreEarned}</span>
                  <div className="bar-track">
                    <motion.div
                      className={`bar-fill ${g.isCorrect ? 'bar-correct' : 'bar-wrong'}`}
                      initial={{ height: 0 }}
                      animate={{ height: `${barHeightPct}%` }}
                      transition={{ duration: 0.5, delay: idx * 0.05 }}
                    />
                  </div>
                  <span className="bar-label-bottom">G{idx + 1}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Achievements System */}
      <div className="achievements-card glass-card" style={{ marginTop: '1.5rem', padding: '1.5rem' }}>
        <h2 className="section-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          🏆 Achievements ({[
            (stats.bestStreak || 0) >= 10,
            (stats.avgTimeMs && stats.avgTimeMs <= 5000) || (profile.recentGames?.some(g => g.timeTakenMs && g.timeTakenMs <= 5000 && g.isCorrect)),
            (profile.recentGames?.some(g => g.scoreEarned >= 100)),
            (stats.totalGames || 0) >= 5,
          ].filter(Boolean).length} / 4 Unlocked)
        </h2>
        <div className="achievements-grid">
          <div className={`achievement-pill glass-card ${(stats.bestStreak || 0) >= 10 ? 'unlocked' : 'locked'}`}>
            <span className="ach-icon">🔥</span>
            <div>
              <div className="ach-title">10 in a Row</div>
              <div className="ach-desc">Reach a streak of 10 correct answers</div>
            </div>
            <span className="ach-status">{(stats.bestStreak || 0) >= 10 ? '✅ Unlocked' : `${stats.bestStreak || 0}/10`}</span>
          </div>

          <div className={`achievement-pill glass-card ${(stats.avgTimeMs && stats.avgTimeMs <= 5000) || (profile.recentGames?.some(g => g.timeTakenMs && g.timeTakenMs <= 5000 && g.isCorrect)) ? 'unlocked' : 'locked'}`}>
            <span className="ach-icon">⚡</span>
            <div>
              <div className="ach-title">Speed Demon (Under 5s)</div>
              <div className="ach-desc">Solve any puzzle correctly in under 5 seconds</div>
            </div>
            <span className="ach-status">{(stats.avgTimeMs && stats.avgTimeMs <= 5000) || (profile.recentGames?.some(g => g.timeTakenMs && g.timeTakenMs <= 5000 && g.isCorrect)) ? '✅ Unlocked' : 'Locked'}</span>
          </div>

          <div className={`achievement-pill glass-card ${profile.recentGames?.some(g => g.scoreEarned >= 100) ? 'unlocked' : 'locked'}`}>
            <span className="ach-icon">🧠</span>
            <div>
              <div className="ach-title">Pure Genius (No Hints)</div>
              <div className="ach-desc">Solve puzzles without using hints</div>
            </div>
            <span className="ach-status">{profile.recentGames?.some(g => g.scoreEarned >= 100) ? '✅ Unlocked' : 'Locked'}</span>
          </div>

          <div className={`achievement-pill glass-card ${(stats.totalGames || 0) >= 5 ? 'unlocked' : 'locked'}`}>
            <span className="ach-icon">🍌</span>
            <div>
              <div className="ach-title">Banana Veteran</div>
              <div className="ach-desc">Play 5 or more Banana puzzle games</div>
            </div>
            <span className="ach-status">{(stats.totalGames || 0) >= 5 ? '✅ Unlocked' : `${stats.totalGames || 0}/5`}</span>
          </div>
        </div>
      </div>

      {/* Recent Games */}
      {profile?.recentGames?.length > 0 && (
        <div className="recent-games glass-card">
          <h2 className="section-subtitle">Recent Games</h2>
          <div className="recent-table-wrap">
            <table className="recent-table">
              <thead>
                <tr>
                  <th>Result</th>
                  <th>Answer</th>
                  <th>Score</th>
                  <th>Time</th>
                  <th>When</th>
                </tr>
              </thead>
              <tbody>
                {profile.recentGames.map((g, i) => (
                  <motion.tr
                    key={g.id}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={g.isCorrect ? 'recent-correct' : 'recent-wrong'}
                  >
                    <td>
                      {g.isCorrect
                        ? <span className="result-icon correct"><CheckCircle size={16} /> Correct</span>
                        : <span className="result-icon wrong"><XCircle size={16} /> Wrong</span>}
                    </td>
                    <td><span className="answer-badge">{g.answerGiven ?? '—'}</span></td>
                    <td><span className="banana-text">+{g.scoreEarned}</span></td>
                    <td><span style={{ color: 'var(--text-secondary)' }}>{g.timeTakenMs ? `${(g.timeTakenMs / 1000).toFixed(1)}s` : '—'}</span></td>
                    <td><span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{new Date(g.playedAt).toLocaleString()}</span></td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Profile;
