import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy} from 'lucide-react';
import axios from 'axios';
import './Dashboard.css';

// Updated Stats Section Component to match the existing stats grid style
const StatsSection = ({ stats, goalInfo }) => {
  const getStreakData = () => {
    // Calculate streak from total entries (simplified)
    return {
      currentStreak: Math.min(stats.thisWeekEntries, 7),
      longestStreak: Math.min(stats.totalEntries, 30),
      totalEntries: stats.totalEntries
    };
  };

  const streakData = getStreakData();

  return (
    <div className="overview-section fade-in">
      <h3 className="overview-title">📊 Your Impact Overview</h3>
      <div className="stats-grid">
        <StatCard 
          icon="🔥" 
          value={streakData.currentStreak} 
          label="Current Streak"
          unit="Days"
        />
        <StatCard 
          icon="🏆" 
          value={streakData.longestStreak} 
          label="Best Streak"
          unit="Personal Record"
        />
        <StatCard 
          icon="📝" 
          value={streakData.totalEntries} 
          label="Total Activities"
          unit="Logged"
        />
        <StatCard 
          icon="📅" 
          value={`${stats.weeklyCarbon}kg`} 
          label="This Week"
          unit="CO₂ Emissions"
        />
        <StatCard 
          icon="🗓️" 
          value={`${stats.monthlyCarbon}kg`} 
          label="This Month"
          unit="CO₂ Emissions"
        />
      </div>
    </div>
  );
};

// StatCard component for the streak cards
const StatCard = ({ icon, value, label, unit }) => {
  return (
    <div className="stat-card smooth-hover">
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <h3>{value}</h3>
        <p>{label}</p>
        {unit && <span className="stat-unit">{unit}</span>}
      </div>
    </div>
  );
};

// Analytics Card Component
const AnalyticsCard = ({ onClick }) => {
  const [isNavigating, setIsNavigating] = useState(false);

  const handleClick = () => {
    setIsNavigating(true);
    // Add a small delay for visual feedback
    setTimeout(() => {
      onClick();
    }, 150);
  };

  return (
    <div className="analytics-card-section fade-in">
      <div 
        className={`analytics-card smooth-hover ${isNavigating ? 'navigating' : ''}`} 
        onClick={handleClick}
      >
        <div className="analytics-icon">📈</div>
        <div className="analytics-content">
          <h3>Personal Analytics</h3>
          <p>View detailed insights and trends</p>
          <div className="analytics-features">
            <span>📊 Charts & Graphs</span>
            <span>📈 Trend Analysis</span>
            <span>🎯 Goal Tracking</span>
          </div>
        </div>
        <div className="analytics-arrow">→</div>
      </div>
    </div>
  );
};

const LeaderboardWidget = ({ userStats, smoothNavigate, userId }) => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [userPoints, setUserPoints] = useState(0);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://ecotrack19.onrender.com/api';

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/leaderboard/weekly?limit=50`);
        const data = await res.json();
        if (data.leaderboard) {
          setLeaderboardData(data.leaderboard);

          // Find the logged-in user's rank
          const foundUser = data.leaderboard.find((u) => u._id === userId);
          if (foundUser) {
            setUserPoints(foundUser.weeklyPoints || foundUser.points || 0);
            setUserRank(foundUser.rank);
          } else {
            setUserPoints(0);
            setUserRank(null);
          }
        }
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
      }
    };

    fetchLeaderboard();
  }, [userId, API_BASE_URL]);

  return (
    <div className="leaderboard-widget fade-in">
      <div className="widget-header">
        <div className="widget-title">
          <Trophy className="widget-icon" size={20} />
          <h3>Leaderboard</h3>
        </div>
        <button
          className="view-all-link smooth-hover"
          onClick={() => smoothNavigate('/leaderboard')}
        >
          View All
        </button>
      </div>

      <div className="user-rank-section">
        <div className="user-rank-card">
          <div className="rank-info">
            <span className="rank-number">{userRank ? `#${userRank}` : 'N/A'}</span>
            <span className="rank-label">Your Rank</span>
          </div>
          <div className="points-info">
            <span className="points-number">{userPoints.toLocaleString()}</span>
            <span className="points-label">Points</span>
          </div>
        </div>
      </div>

      <div className="top-users">
        {leaderboardData.slice(0, 3).map((user) => (
          <div key={user._id} className={`leaderboard-item rank-${user.rank} smooth-hover`}>
            <span className="user-badge">
              {user.rank === 1 ? '🏆' : user.rank === 2 ? '🥈' : user.rank === 3 ? '🥉' : '🌱'}
            </span>
            <span className="username">{user.username}</span>
            <span className="user-points">{(user.points || user.weeklyPoints || 0).toLocaleString()} pts</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Badge definitions
const BADGES = [
  {
    id: 'first_entry',
    title: 'Getting Started',
    description: 'Logged your first carbon entry',
    icon: '🌱',
    condition: (stats) => stats.totalEntries >= 1,
    rarity: 'common'
  },
  {
    id: 'week_tracker',
    title: 'Weekly Warrior',
    description: 'Tracked emissions for 7 consecutive days',
    icon: '📅',
    condition: (stats) => stats.thisWeekEntries >= 7,
    rarity: 'rare'
  },
  {
    id: 'low_carbon_week',
    title: 'Eco Champion',
    description: 'Kept weekly emissions under 10kg CO₂',
    icon: '🏆',
    condition: (stats) => parseFloat(stats.weeklyCarbon) < 10 && stats.thisWeekEntries >= 3,
    rarity: 'epic'
  },
  {
    id: 'transport_saver',
    title: 'Green Commuter',
    description: 'Used low-carbon transport 5 times',
    icon: '🚲',
    condition: (stats, entries) => {
      const lowCarbonTransport = entries.filter(e => 
        e.type === 'transport' && parseFloat(e.amount) < 3
      ).length;
      return lowCarbonTransport >= 5;
    },
    rarity: 'rare'
  },
  {
    id: 'consistent_tracker',
    title: 'Consistency King',
    description: 'Logged entries for 30 days',
    icon: '👑',
    condition: (stats) => stats.totalEntries >= 30,
    rarity: 'legendary'
  },
  {
    id: 'goal_achiever',
    title: 'Goal Crusher',
    description: 'Met your weekly CO₂ goal',
    icon: '🎯',
    condition: (stats, entries, goalInfo) => {
      if (goalInfo.goal <= 0) return false;
      const currentEmissions = parseFloat(stats.weeklyCarbon);
      return currentEmissions <= goalInfo.goal;
    },
    rarity: 'epic'
  },
  {
    id: 'waste_warrior',
    title: 'Waste Warrior',
    description: 'Logged 10 waste reduction activities',
    icon: '♻️',
    condition: (stats, entries) => {
      return entries.filter(e => e.type === 'waste').length >= 10;
    },
    rarity: 'rare'
  },
  {
    id: 'carbon_saver',
    title: 'Carbon Saver',
    description: 'Total emissions under 50kg CO₂',
    icon: '🌍',
    condition: (stats) => parseFloat(stats.totalCarbon) < 50 && stats.totalEntries >= 10,
    rarity: 'epic'
  }
];

function Dashboard() {
  const [user, setUser] = useState(null);
  const [entries, setEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [stats, setStats] = useState({
    totalEntries: 0,
    thisWeekEntries: 0,
    totalCarbon: 0,
    weeklyCarbon: 0,
    monthlyCarbon: 0,
  });
  const [goalInfo, setGoalInfo] = useState({ goal: 0, goalType: 'weekly' });
  const [loading, setLoading] = useState(true);
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [newBadges, setNewBadges] = useState([]);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [sortBy, setSortBy] = useState('date_desc');
  const [filterType, setFilterType] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);
  const navigate = useNavigate();

  // Enhanced navigation function with smooth transitions
  const smoothNavigate = useCallback((path, delay = 200) => {
    setIsPageTransitioning(true);
    setTimeout(() => {
      navigate(path);
    }, delay);
  }, [navigate]);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      smoothNavigate('/login');
      return;
    }

    try {
      const res = await axios.get('https://ecotrack19.onrender.com/api/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser({
        username: res.data.username || res.data.name || 'User',
        email: res.data.email,
      });
      setGoalInfo({ goal: res.data.goal || 0, goalType: res.data.goalType || 'weekly' });
    } catch (err) {
      console.error('Auth/Profile load failed:', err);
      localStorage.removeItem('token');
      smoothNavigate('/login');
    }
  }, [smoothNavigate]);

  const fetchDashboardData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://ecotrack19.onrender.com/api/entries', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = response.data;
      const userEntries = Array.isArray(data)
        ? data
        : Array.isArray(data.entries)
        ? data.entries
        : Array.isArray(data.data)
        ? data.data
        : [];

      setEntries(userEntries);
    } catch (error) {
      console.error('Error fetching entries:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        smoothNavigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [smoothNavigate]);

  // Fixed badge checking function
  const checkBadges = useCallback((calculatedStats, currentEntries, currentGoalInfo, currentEarnedBadges) => {
    const newlyEarned = [];
    
    BADGES.forEach(badge => {
      // Check if badge is already earned
      const alreadyEarned = currentEarnedBadges.some(b => b.id === badge.id);
      
      if (!alreadyEarned) {
        const achieved = badge.condition(calculatedStats, currentEntries, currentGoalInfo);
        if (achieved) {
          newlyEarned.push(badge);
        }
      }
    });

    if (newlyEarned.length > 0) {
      console.log('New badges earned:', newlyEarned); // Debug log
      setEarnedBadges(prevEarned => [...prevEarned, ...newlyEarned]);
      setNewBadges(newlyEarned);
      setShowBadgeModal(true);
    }
  }, []);

  // Stats calculation function - simplified to prevent infinite loops
  const calculateStats = useCallback((userEntries) => {
    const now = new Date();
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const weeklyEntries = userEntries.filter(entry => new Date(entry.date) >= weekStart);
    const monthlyEntries = userEntries.filter(entry => new Date(entry.date) >= monthStart);
    
    const periodEntries = userEntries.filter(entry => {
      const date = new Date(entry.date);
      return goalInfo.goalType === 'weekly'
        ? date >= weekStart
        : date >= monthStart;
    });

    const totalCarbon = userEntries.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    const weeklyCarbon = weeklyEntries.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    const monthlyCarbon = monthlyEntries.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

    const newStats = {
      totalEntries: userEntries.length,
      thisWeekEntries: periodEntries.length,
      totalCarbon: totalCarbon.toFixed(1),
      weeklyCarbon: weeklyCarbon.toFixed(1),
      monthlyCarbon: monthlyCarbon.toFixed(1),
    };

    return newStats;
  }, [goalInfo]);

  // Filter application function
  const applyFilters = useCallback(() => {
    let filtered = [...entries];
    
    if (filterType !== 'all') {
      filtered = filtered.filter(e => e.type === filterType);
    }
    
    if (startDate) {
      filtered = filtered.filter(e => new Date(e.date) >= new Date(startDate));
    }
    
    if (endDate) {
      filtered = filtered.filter(e => new Date(e.date) <= new Date(endDate));
    }

    // Sort the filtered entries
    switch (sortBy) {
      case 'date_asc':
        filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case 'date_desc':
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case 'co2_asc':
        filtered.sort((a, b) => parseFloat(a.amount) - parseFloat(b.amount));
        break;
      case 'co2_desc':
        filtered.sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount));
        break;
      default:
        break;
    }

    setFilteredEntries(filtered);
  }, [entries, sortBy, filterType, startDate, endDate]);

  const resetFilters = () => {
    setSortBy('date_desc');
    setFilterType('all');
    setStartDate('');
    setEndDate('');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    smoothNavigate('/login');
  };

  const handleEdit = (id) => smoothNavigate(`/edit-entry/${id}`);
  
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://ecotrack19.onrender.com/api/entries/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEntries(prevEntries => prevEntries.filter(entry => entry._id !== id));
    } catch (error) {
      console.error('Error deleting entry:', error);
      alert('Failed to delete entry. Please try again.');
    }
  };

  const handleAddEntry = () => {
    smoothNavigate('/add-entry');
  };

  const handleViewAllEntries = () => {
    smoothNavigate('/entries');
  };

  const getEntryIcon = (type) => {
    const icons = {
      transport: '🚗',
      energy: '💡',
      food: '🥗',
      waste: '🗑️',
      default: '📋'
    };
    return icons[type] || icons.default;
  };

  const getRarityColor = (rarity) => ({
    common: '#22C55E',
    rare: '#16A34A',
    epic: '#15803D',
    legendary: '#166534'
  }[rarity] || '#22C55E');

  const getRarityGlow = (rarity) => ({
    common: '0 0 10px rgba(34, 197, 94, 0.3)',
    rare: '0 0 15px rgba(22, 163, 74, 0.4)',
    epic: '0 0 20px rgba(21, 128, 61, 0.5)',
    legendary: '0 0 25px rgba(22, 101, 52, 0.6)'
  }[rarity] || '0 0 10px rgba(34, 197, 94, 0.3)');

  const getPeriodEmissions = () => {
    const now = new Date();
    const startDate = goalInfo.goalType === 'weekly'
      ? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      : new Date(now.getFullYear(), now.getMonth(), 1);
    
    return entries
      .filter(e => new Date(e.date) >= startDate)
      .reduce((total, e) => total + (parseFloat(e.amount) || 0), 0);
  };

  const goalPercent = goalInfo.goal > 0 ? (getPeriodEmissions() / goalInfo.goal) * 100 : 0;

  // Main useEffect for initial data loading
  useEffect(() => {
    checkAuth();
    fetchDashboardData();
  }, [checkAuth, fetchDashboardData]);

  // Separate useEffect for stats calculation and badge checking
  useEffect(() => {
    if (entries.length >= 0) {
      const newStats = calculateStats(entries);
      setStats(newStats);
      
      // Check badges after stats are calculated
      checkBadges(newStats, entries, goalInfo, earnedBadges);
    }
  }, [entries, goalInfo, calculateStats, checkBadges, earnedBadges]);

  // Apply filters when filter dependencies change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Add page entrance animation
  useEffect(() => {
    setIsPageTransitioning(false);
  }, []);

  if (loading) {
    return (
      <div className="dashboard-container loading-state">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`dashboard-container ${isPageTransitioning ? 'page-exit' : 'page-enter'}`}>
      <div className="dashboard-header fade-in">
        <div className="welcome-section">
          <h1>🌿 Welcome back, {user?.username || 'User'}!</h1>
          <p>Track your carbon footprint and make a difference</p>
        </div>
        <div className="header-buttons">
          <button onClick={() => smoothNavigate('/profile')} className="profile-btn smooth-hover">
            👤 Profile
          </button>
          <button onClick={handleLogout} className="logout-btn smooth-hover">
            Logout
          </button>
        </div>
      </div>

      <StatsSection stats={stats} goalInfo={goalInfo} />
      <AnalyticsCard onClick={() => smoothNavigate('/analytics')} />

      {/* Leaderboard Widget */}
      <LeaderboardWidget userStats={stats} smoothNavigate={smoothNavigate} />

      {/* Badge Showcase Section */}
      <div className="badge-showcase fade-in">
        <h3 className="badge-title">🏅 Your Achievements ({earnedBadges.length}/{BADGES.length})</h3>
        <div className="badges-grid">
          {BADGES.map((badge, index) => {
            const isEarned = earnedBadges.find(b => b.id === badge.id);
            return (
              <div
                key={badge.id}
                className={`badge-card ${isEarned ? 'earned' : 'locked'} rarity-${badge.rarity} smooth-hover`}
                style={{
                  boxShadow: isEarned ? getRarityGlow(badge.rarity) : 'none',
                  borderColor: isEarned ? getRarityColor(badge.rarity) : '#ddd',
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <div className="badge-icon">{badge.icon}</div>
                <div className="badge-title-small">{badge.title}</div>
                <div className="badge-description">{badge.description}</div>
                {isEarned && (
                  <div className="badge-rarity" style={{ backgroundColor: getRarityColor(badge.rarity) }}>
                    {badge.rarity}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Goal Progress Section */}
      <div className="goal-progress fade-in">
        <h3>🎯 {goalInfo.goalType.charAt(0).toUpperCase() + goalInfo.goalType.slice(1)} CO₂ Goal</h3>
        {goalInfo.goal > 0 ? (
          <>
            <p>{getPeriodEmissions().toFixed(1)} / {goalInfo.goal} kg CO₂ ({goalPercent.toFixed(1)}%)</p>
            <div className="progress-bar">
              <div
                className="progress-bar-fill smooth-fill"
                style={{
                  width: `${Math.min(goalPercent, 100)}%`,
                  backgroundColor: goalPercent <= 100 ? '#22C55E' : '#EF4444'
                }}
              />
            </div>
          </>
        ) : (
          <>
            <p style={{ fontStyle: 'italic' }}>No goal set yet</p>
            <button className="set-goal-btn smooth-hover" onClick={() => smoothNavigate('/profile')}>
              ➕ Set Goal
            </button>
          </>
        )}
      </div>

      {/* Filters Section */}
      <div className="filters enhanced-filters green-filters fade-in">
        <div className="filter-row">
          <div className="filter-group">
            <label>Sort By:</label>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="smooth-input">
              <option value="date_desc">Date (Newest)</option>
              <option value="date_asc">Date (Oldest)</option>
              <option value="co2_desc">CO₂ (High to Low)</option>
              <option value="co2_asc">CO₂ (Low to High)</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Filter Type:</label>
            <select value={filterType} onChange={e => setFilterType(e.target.value)} className="smooth-input">
              <option value="all">All Types</option>
              <option value="transport">Transport</option>
              <option value="energy">Energy</option>
              <option value="food">Food</option>
              <option value="waste">Waste</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Start Date:</label>
            <input 
              type="date" 
              value={startDate} 
              onChange={e => setStartDate(e.target.value)} 
              className="smooth-input" 
            />
          </div>

          <div className="filter-group">
            <label>End Date:</label>
            <input 
              type="date" 
              value={endDate} 
              onChange={e => setEndDate(e.target.value)} 
              className="smooth-input" 
            />
          </div>

          <button className="reset-filters-btn smooth-hover" onClick={resetFilters}>
            Reset Filters 🔄
          </button>
        </div>

        <div className="action-row">
          <button className="add-entry-btn smooth-hover" onClick={handleAddEntry}>
            Add New Entry ➕
          </button>
          <button className="view-all-btn smooth-hover" onClick={handleViewAllEntries}>
            View All Entries 📋
          </button>
          <button className="smart-suggestions-btn" onClick={() => navigate('/smart-suggestions')}>
            🌿 View Smart Suggestions
          </button>
        </div>
      </div>

      {/* Recent Entries Section */}
      <div className="recent-section list-style fade-in">
        <div className="section-header">
          <h2>📝 Recent Entries</h2>
        </div>
        <div className="entries-list">
          {filteredEntries.length > 0 ? (
            filteredEntries.slice(0, 5).map((entry, index) => (
              <div 
                className={`entry-list-item ${index % 2 === 1 ? 'alternate' : ''} smooth-hover`} 
                key={entry._id}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="entry-main-info">
                  <div className="entry-activity">
                    <span className="activity-icon">{getEntryIcon(entry.type)}</span>
                    <span className="activity-name">{entry.activity}</span>
                  </div>
                  <div className="entry-date">
                    {new Date(entry.date).toLocaleDateString()}
                  </div>
                </div>
                <div className="entry-amount-large">
                  {entry.amount} kg CO₂
                </div>
                <div className="entry-actions-compact">
                  <button 
                    className="edit-btn-small smooth-hover" 
                    onClick={() => handleEdit(entry._id)}
                    title="Edit entry"
                  >
                    ✏️
                  </button>
                  <button 
                    className="delete-btn-small smooth-hover" 
                    onClick={() => handleDelete(entry._id)}
                    title="Delete entry"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-entries fade-in">
              <p>No entries found. Start tracking your carbon footprint!</p>
            </div>
          )}
        </div>
      </div>

      {/* Badge Achievement Modal */}
      {showBadgeModal && (
        <div className="badge-modal-overlay modal-enter" onClick={() => setShowBadgeModal(false)}>
          <div className="badge-modal modal-content" onClick={e => e.stopPropagation()}>
            <h2>🎉 New Achievement Unlocked!</h2>
            {newBadges.map(badge => (
              <div key={badge.id} className="new-badge-display">
                <div className="new-badge-icon">{badge.icon}</div>
                <h3 
                  className="new-badge-title"
                  style={{ color: getRarityColor(badge.rarity) }}
                >
                  {badge.title}
                </h3>
                <p className="new-badge-description">{badge.description}</p>
                <div 
                  className="new-badge-rarity"
                  style={{ 
                    backgroundColor: getRarityColor(badge.rarity),
                    boxShadow: getRarityGlow(badge.rarity)
                  }}
                >
                  {badge.rarity.toUpperCase()}
                </div>
              </div>
            ))}
            <button 
              className="badge-modal-close smooth-hover"
              onClick={() => setShowBadgeModal(false)}
            >
              Awesome! 🚀
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;