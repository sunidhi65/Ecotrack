import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './PersonalAnalytics.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function PersonalAnalytics() {
  const [user, setUser] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('30'); // days
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return false;
      }

      try {
        const tokenPayload = jwtDecode(token);
        const username = tokenPayload.email?.split('@')[0] || 'User';
        setUser({ username });
        return true;
      } catch (error) {
        console.error('Token decode error:', error);
        localStorage.removeItem('token');
        navigate('/login');
        return false;
      }
    };

    const fetchData = async () => {
      if (!checkAuth()) return;

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

        console.log('Fetched entries:', userEntries);
        setEntries(userEntries);
      } catch (error) {
        console.error('Failed to fetch entries:', error);
        setError('Failed to load data');
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // Filter entries based on time range
  const getFilteredEntries = () => {
    const now = new Date();
    const daysAgo = new Date(now.getTime() - parseInt(timeRange) * 24 * 60 * 60 * 1000);
    
    return entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= daysAgo;
    });
  };

  // Calculate statistics
  const getStatistics = () => {
    const filteredEntries = getFilteredEntries();
    
    const totalEmissions = filteredEntries.reduce((sum, entry) => sum + parseFloat(entry.amount || 0), 0);
    const avgDaily = filteredEntries.length > 0 ? totalEmissions / parseInt(timeRange) : 0;
    
    const byType = filteredEntries.reduce((acc, entry) => {
      acc[entry.type] = (acc[entry.type] || 0) + parseFloat(entry.amount || 0);
      return acc;
    }, {});

    return {
      totalEmissions: totalEmissions.toFixed(2),
      avgDaily: avgDaily.toFixed(2),
      entryCount: filteredEntries.length,
      byType
    };
  };

  // Generate daily emissions data for line chart
  const getDailyEmissionsData = () => {
    const filteredEntries = getFilteredEntries();
    const dailyData = {};
    
    // Initialize all days in range with 0
    for (let i = parseInt(timeRange) - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dailyData[dateStr] = 0;
    }
    
    // Add actual data
    filteredEntries.forEach(entry => {
      const dateStr = entry.date.split('T')[0];
      if (dailyData.hasOwnProperty(dateStr)) {
        dailyData[dateStr] += parseFloat(entry.amount || 0);
      }
    });

    const labels = Object.keys(dailyData).map(date => {
      const d = new Date(date);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    
    const data = Object.values(dailyData);

    return {
      labels,
      datasets: [
        {
          label: 'Daily CO₂ Emissions (kg)',
          data,
          borderColor: '#22C55E',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
        },
      ],
    };
  };

  // Generate emissions by type data for doughnut chart
  const getEmissionsByTypeData = () => {
    const stats = getStatistics();
    const types = Object.keys(stats.byType);
    const values = Object.values(stats.byType);
    
    const colors = {
      transport: '#EF4444',
      energy: '#F59E0B',
      food: '#10B981',
      waste: '#8B5CF6',
    };

    return {
      labels: types.map(type => type.charAt(0).toUpperCase() + type.slice(1)),
      datasets: [
        {
          data: values,
          backgroundColor: types.map(type => colors[type] || '#6B7280'),
          borderColor: '#ffffff',
          borderWidth: 2,
        },
      ],
    };
  };

  // Generate weekly comparison data
  const getWeeklyComparisonData = () => {
    const now = new Date();
    const weeks = [];
    
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now.getTime() - (i * 7 + 7) * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      
      const weekEntries = entries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= weekStart && entryDate < weekEnd;
      });
      
      const weekTotal = weekEntries.reduce((sum, entry) => sum + parseFloat(entry.amount || 0), 0);
      
      weeks.push({
        label: i === 0 ? 'This Week' : `${i} Week${i > 1 ? 's' : ''} Ago`,
        value: weekTotal
      });
    }

    return {
      labels: weeks.map(week => week.label),
      datasets: [
        {
          label: 'Weekly CO₂ Emissions (kg)',
          data: weeks.map(week => week.value),
          backgroundColor: '#22C55E',
          borderColor: '#16A34A',
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    };
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="analytics-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading your analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-container">
        <div className="error">
          <h2>❌ Error</h2>
          <p>{error}</p>
          <button onClick={handleBack} className="back-btn">
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const stats = getStatistics();
  const dailyData = getDailyEmissionsData();
  const typeData = getEmissionsByTypeData();
  const weeklyData = getWeeklyComparisonData();

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <button onClick={handleBack} className="back-btn">
          ← Back to Dashboard
        </button>
        <h1>📊 Personal Analytics</h1>
        <div className="time-range-selector">
          <label>Time Range:</label>
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="time-range-select"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>
      </div>

      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-icon">🌍</div>
          <div className="stat-content">
            <h3>{stats.totalEmissions} kg</h3>
            <p>Total CO₂ Emissions</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>{stats.avgDaily} kg</h3>
            <p>Average Daily</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <h3>{stats.entryCount}</h3>
            <p>Total Entries</p>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>📈 Daily Emissions Trend</h3>
          <div className="chart-container">
            <Line 
              data={dailyData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'CO₂ Emissions (kg)'
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="chart-card">
          <h3>🥧 Emissions by Category</h3>
          <div className="chart-container">
            <Doughnut 
              data={typeData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom'
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="chart-card full-width">
          <h3>📊 Weekly Comparison</h3>
          <div className="chart-container">
            <Bar 
              data={weeklyData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'CO₂ Emissions (kg)'
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {entries.length === 0 && (
        <div className="no-data">
          <h3>📭 No Data Available</h3>
          <p>Start tracking your carbon footprint to see analytics here!</p>
          <button onClick={() => navigate('/add-entry')} className="add-entry-btn">
            Add Your First Entry
          </button>
        </div>
      )}
    </div>
  );
}

export default PersonalAnalytics;