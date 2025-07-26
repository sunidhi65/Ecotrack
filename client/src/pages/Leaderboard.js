import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Medal, Award, Leaf, TrendingUp } from 'lucide-react';
import './Leaderboard.css';

const EcoTrackLeaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('weekly');
  const navigate = useNavigate();

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://ecotrack19.onrender.com/api/leaderboard';

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/leaderboard/${activeTab}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setLeaderboardData(data.leaderboard || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [activeTab, API_BASE_URL]);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <Trophy className="rank-icon gold" />;
      case 2: return <Medal className="rank-icon silver" />;
      case 3: return <Award className="rank-icon bronze" />;
      default: return <div className="rank-number">#{rank}</div>;
    }
  };

  if (loading) {
    return <div className="loading">Loading leaderboard...</div>;
  }

  if (error) {
    return (
      <div className="loading">
        <p>Error: {error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="leaderboard-container">
      {/* Header */}
      <div className="leaderboard-header">
        <h1><Leaf className="header-icon" />EcoTrack Leaderboard</h1>
        <p>Top 10 eco-conscious users making a difference!</p>
      </div>

      {/* Stats */}
      <div className="user-stats-card">
        <h3>Stats Overview</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-value">{leaderboardData.length}</span>
            <span className="stat-label">Total Participants</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">
              {leaderboardData.reduce((sum, user) => sum + (user.totalCO2Saved || 0), 0).toFixed(1)} kg
            </span>
            <span className="stat-label">Total CO₂ Saved</span>
          </div>
        </div>
      </div>

      {/* Period Selector */}
      <div className="period-selector">
        {['weekly', 'monthly', 'allTime'].map(tab => (
          <button
            key={tab}
            className={activeTab === tab ? 'active' : ''}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'allTime' ? 'All Time' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Leaderboard */}
      <div className="leaderboard-list">
        <div className="leaderboard-header-row">
          <TrendingUp className="trending-icon" />
          <h2>{activeTab === 'allTime' ? 'All Time' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Rankings</h2>
        </div>

        {leaderboardData.length === 0 ? (
          <div className="loading">No data available</div>
        ) : (
          leaderboardData.map((user, index) => (
            <div
              key={user._id}
              className={`leaderboard-item ${index < 3 ? 'top-three' : ''}`}
            >
              <div className="user-info">
                {getRankIcon(index + 1)}
                <div className="user-avatar">
                  {user.username?.[0]?.toUpperCase() || "?"}
                </div>
                <div className="user-details">
                  <span className="username">{user.username}</span>
                  <span className="user-title">{(user.totalCO2Saved || 0).toFixed(1)} kg CO₂ saved</span>
                </div>
              </div>
              <div className="user-points">
                <span className="points-value">{user.points || 0}</span>
                <span className="points-label">Points</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Buttons */}
      <div className="leaderboard-actions">
        <button
          onClick={() => window.location.reload()}
          className="leaderboard-button refresh"
        >
          🔄 Refresh Leaderboard
        </button>
        <button
          onClick={() => navigate('/dashboard')}
          className="leaderboard-button back"
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default EcoTrackLeaderboard;


