import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Edit2, Save, X, CheckCircle, XCircle, Clock, Zap, Flame, Target, Trophy, Award, Calendar } from 'lucide-react';
import Mascot from '../components/Mascot';
import Button from '../components/Button';
import AvatarPicker from '../components/AvatarPicker';

const StatCard = ({ icon, label, value, color, subtitle }) => (
  <motion.div
    className="stat-card glass-card"
    whileHover={{ y: -3 }}
    initial={{ opacity: 0, y: 15 }}
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
  const [showPickerModal, setShowPickerModal] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [profileRes, avatarRes] = await Promise.all([
          api.get('/profile/me'),
          api.get('/profile/avatars'),
        ]);
        setProfile(profileRes.data);
        setAvatars(avatarRes.data.avatars);
        setForm({
          displayName: profileRes.data.displayName || '',
          avatar: profileRes.data.avatar || '🍌'
        });
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
      toast.success('Lab profile updated! 🍌');
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
        <Mascot state="thinking" size={90} />
        <p style={{ fontWeight: 700, marginTop: '1rem', color: 'var(--color-text)' }}>
          Loading your laboratory credentials...
        </p>
      </div>
    );
  }

  const stats = profile?.stats || {};
  const avgSecs = stats.avgTimeMs ? (stats.avgTimeMs / 1000).toFixed(1) : '—';
  const accuracy = stats.accuracy != null ? `${stats.accuracy}%` : '—';

  // Achievement progress calculations
  const achievementsList = [
    {
      id: 'streak-10',
      title: '10 in a Row',
      desc: 'Reach a streak of 10 consecutive correct equations',
      icon: '🔥',
      unlocked: (stats.bestStreak || 0) >= 10,
      current: Math.min(10, stats.bestStreak || 0),
      total: 10,
      progressLabel: `${Math.min(10, stats.bestStreak || 0)} / 10`,
    },
    {
      id: 'speed-demon',
      title: 'Speed Demon (<5s)',
      desc: 'Solve any puzzle correctly in under 5 seconds',
      icon: '⚡',
      unlocked: (stats.avgTimeMs && stats.avgTimeMs <= 5000) || profile?.recentGames?.some(g => g.timeTakenMs && g.timeTakenMs <= 5000 && g.isCorrect),
      current: ((stats.avgTimeMs && stats.avgTimeMs <= 5000) || profile?.recentGames?.some(g => g.timeTakenMs && g.timeTakenMs <= 5000 && g.isCorrect)) ? 1 : 0,
      total: 1,
      progressLabel: ((stats.avgTimeMs && stats.avgTimeMs <= 5000) || profile?.recentGames?.some(g => g.timeTakenMs && g.timeTakenMs <= 5000 && g.isCorrect)) ? '1 / 1' : '0 / 1',
    },
    {
      id: 'pure-genius',
      title: 'Pure Genius (No Hints)',
      desc: 'Score 100+ points on a puzzle without consulting hints',
      icon: '🧠',
      unlocked: profile?.recentGames?.some(g => g.scoreEarned >= 100),
      current: profile?.recentGames?.some(g => g.scoreEarned >= 100) ? 1 : 0,
      total: 1,
      progressLabel: profile?.recentGames?.some(g => g.scoreEarned >= 100) ? '1 / 1' : '0 / 1',
    },
    {
      id: 'veteran',
      title: 'Banana Veteran (5+ Games)',
      desc: 'Complete 5 or more Banana puzzle games in the lab',
      icon: '🍌',
      unlocked: (stats.totalGames || 0) >= 5,
      current: Math.min(5, stats.totalGames || 0),
      total: 5,
      progressLabel: `${Math.min(5, stats.totalGames || 0)} / 5`,
    },
  ];

  const unlockedCount = achievementsList.filter(a => a.unlocked).length;

  return (
    <motion.div
      className="profile-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* ── 1. Profile Header ──────────────────────────────────────── */}
      <div className="profile-header glass-card">
        <div className="profile-avatar-big" aria-label="Profile Avatar">
          {editing ? form.avatar : profile?.avatar}
        </div>

        {editing ? (
          <div className="profile-edit-form-wrap" style={{ width: '100%' }}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Avatar Character</span>
                <button
                  type="button"
                  className="btn btn-sm btn-ghost"
                  onClick={() => setShowPickerModal(true)}
                >
                  Browse All Avatars
                </button>
              </label>

              <div className="avatar-grid avatar-grid-profile">
                {avatars.slice(0, 10).map((av) => (
                  <button
                    key={av}
                    type="button"
                    className={`avatar-btn ${form.avatar === av ? 'selected' : ''}`}
                    onClick={() => setForm((p) => ({ ...p, avatar: av }))}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label htmlFor="profile-display-name" className="form-label">
                Display Name
              </label>
              <input
                id="profile-display-name"
                type="text"
                className="form-input"
                value={form.displayName}
                maxLength={50}
                onChange={(e) => setForm((p) => ({ ...p, displayName: e.target.value }))}
                placeholder="Your scientist display name"
              />
            </div>

            <div className="profile-edit-actions">
              <Button
                variant="primary"
                size="sm"
                onClick={handleSave}
                disabled={saving}
                icon={<Save size={15} />}
              >
                {saving ? 'Saving...' : 'Save Profile'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditing(false);
                  setForm({ displayName: profile.displayName || '', avatar: profile.avatar });
                }}
                icon={<X size={15} />}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="profile-info">
              <h1 className="profile-display-name">
                {profile?.displayName || profile?.username}
              </h1>
              <p className="profile-username">@{profile?.username}</p>
              <p className="profile-email" style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                {profile?.email}
              </p>
              <p className="profile-joined" style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginTop: '4px' }}>
                Lab Scientist since {new Date(profile?.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            <Button
              id="edit-profile-btn"
              variant="secondary"
              size="sm"
              className="edit-btn"
              onClick={() => setEditing(true)}
              icon={<Edit2 size={15} />}
            >
              Edit Profile
            </Button>
          </>
        )}
      </div>

      {/* ── 2. Stat Cards Grid ─────────────────────────────────────── */}
      <div className="stats-grid" aria-label="Laboratory Statistics">
        <StatCard
          icon={<Trophy size={24} />}
          label="Total Score"
          value={stats.totalScore?.toLocaleString() || '0'}
          color="var(--color-primary)"
        />
        <StatCard
          icon={<Target size={24} />}
          label="Accuracy"
          value={accuracy}
          color="var(--color-correct)"
          subtitle={`${stats.correctAnswers || 0} / ${stats.totalGames || 0} equations correct`}
        />
        <StatCard
          icon={<Flame size={24} />}
          label="Best Streak"
          value={stats.bestStreak || 0}
          color="var(--color-streak)"
          subtitle={`Current: ${stats.currentStreak || 0}`}
        />
        <StatCard
          icon={<Clock size={24} />}
          label="Avg Speed"
          value={`${avgSecs}s`}
          color="var(--color-bonus)"
          subtitle="per chalkboard equation"
        />
        <StatCard
          icon={<Zap size={24} />}
          label="Puzzles Solved"
          value={stats.correctAnswers || 0}
          color="var(--color-info)"
          subtitle={`${stats.totalGames || 0} attempts`}
        />
        <StatCard
          icon={<Calendar size={24} />}
          label="Last Session"
          value={stats.lastPlayed ? new Date(stats.lastPlayed).toLocaleDateString() : 'Never'}
          color="var(--color-text-secondary)"
        />
      </div>

      {/* ── 3. Performance Trend Bar Chart ─────────────────────────── */}
      {profile?.recentGames?.length > 0 && (
        <div className="history-chart-card glass-card">
          <h2 className="section-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            📊 Recent Performance (Leaf Green = Correct, Coral = Wrong)
          </h2>
          <div className="history-chart-bars" role="region" aria-label="Recent 10 games bar chart">
            {profile.recentGames.slice(0, 10).reverse().map((g, idx) => {
              const maxScore = 450;
              const barHeightPct = Math.max(12, Math.min(100, Math.round((g.scoreEarned / maxScore) * 100)));
              return (
                <div key={g.id || idx} className="chart-bar-col" title={`Game ${idx + 1}: ${g.scoreEarned} pts (${g.isCorrect ? 'Correct' : 'Wrong'})`}>
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

      {/* ── 4. Achievements as Badge Cards with Progress Bars ─────── */}
      <div className="achievements-card glass-card" style={{ marginTop: '1.5rem', padding: '1.5rem' }}>
        <h2 className="section-subtitle" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <span>🏆 Lab Achievements</span>
          <span style={{ fontSize: '0.9rem', color: 'var(--color-correct)', fontWeight: 800 }}>
            {unlockedCount} / {achievementsList.length} Unlocked
          </span>
        </h2>

        <div className="achievements-grid">
          {achievementsList.map((ach) => (
            <div
              key={ach.id}
              className={`achievement-pill glass-card ${ach.unlocked ? 'unlocked' : 'locked'}`}
            >
              <span className="ach-icon" aria-hidden="true">{ach.icon}</span>
              <div style={{ flex: 1 }}>
                <div className="ach-title">{ach.title}</div>
                <div className="ach-desc">{ach.desc}</div>

                {/* Progress bar */}
                <div className="ach-progress-bar-wrap">
                  <div
                    className="ach-progress-fill"
                    style={{
                      width: `${Math.round((ach.current / ach.total) * 100)}%`,
                      background: ach.unlocked ? 'var(--color-correct)' : 'var(--color-primary)'
                    }}
                  />
                </div>
              </div>
              <span className="ach-status">
                {ach.unlocked ? '✅ Done' : ach.progressLabel}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── 5. Recent Games Table ─────────────────────────────────── */}
      {profile?.recentGames?.length > 0 && (
        <div className="recent-games glass-card">
          <h2 className="section-subtitle">Recent Puzzles Solved</h2>
          <div className="recent-table-wrap">
            <table className="recent-table">
              <thead>
                <tr>
                  <th>Result</th>
                  <th>Answer Given</th>
                  <th>Score Earned</th>
                  <th>Time Taken</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {profile.recentGames.map((g, i) => (
                  <tr
                    key={g.id || i}
                    className={g.isCorrect ? 'recent-correct' : 'recent-wrong'}
                  >
                    <td>
                      {g.isCorrect ? (
                        <span className="result-icon correct"><CheckCircle size={16} /> Correct</span>
                      ) : (
                        <span className="result-icon wrong"><XCircle size={16} /> Wrong</span>
                      )}
                    </td>
                    <td><span className="answer-badge">{g.answerGiven ?? '—'}</span></td>
                    <td><span className="banana-text" style={{ fontWeight: 800 }}>+{g.scoreEarned}</span></td>
                    <td><span style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>{g.timeTakenMs ? `${(g.timeTakenMs / 1000).toFixed(1)}s` : '—'}</span></td>
                    <td><span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>{new Date(g.playedAt).toLocaleString()}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Avatar Picker Modal */}
      <AvatarPicker
        open={showPickerModal}
        onClose={() => setShowPickerModal(false)}
        avatars={avatars}
        selectedAvatar={form.avatar}
        onSelect={(av) => setForm((p) => ({ ...p, avatar: av }))}
      />
    </motion.div>
  );
};

export default Profile;
