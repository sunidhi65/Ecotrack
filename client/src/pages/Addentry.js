import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddEntry.css';

const AddEntry = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    type: 'transport',
    activity: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const token = localStorage.getItem('token');

    if (!token) {
      setError('❌ You must be logged in to add an entry.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // ✅ Send token
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to add entry');
      }

      setSuccess('✅ Entry added successfully!');
      setFormData({
        type: 'transport',
        activity: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: ''
      });
    } catch (error) {
      setError(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const activityOptions = {
    transport: ['🚗 Car (Petrol) - per km', '🚌 Bus - per km'],
    energy: ['💡 Electricity usage'],
    food: ['🍗 Meat meal', '🥦 Vegetarian meal'],
    other: ['🛍️ Miscellaneous']
  };

  return (
    <div className="add-entry-container">
      <div className="add-entry-content">

        {/* 🔙 Back to Dashboard */}
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          🔙 Back to Dashboard
        </button>

        <div className="page-header">
          <h1>📋 Add New Entry</h1>
          <p>Track your CO₂ emissions by activity</p>
        </div>

        <form onSubmit={handleSubmit} className="entry-form">

          {/* Category Tabs */}
          <div className="category-tabs">
            {['transport', 'energy', 'food', 'other'].map((type) => (
              <div
                key={type}
                className={`category-tab ${formData.type === type ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, type, activity: '' })}
              >
                <div className="tab-icon">
                  {type === 'transport' ? '🚗' : type === 'energy' ? '⚡' : type === 'food' ? '🍽️' : '📦'}
                </div>
                <div className="tab-label">{type}</div>
              </div>
            ))}
          </div>

          {/* Activity */}
          <div className="form-group">
            <label>Activity *</label>
            <select
              name="activity"
              value={formData.activity}
              onChange={handleChange}
              required
            >
              <option value="">-- Select --</option>
              {activityOptions[formData.type].map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Quantity */}
          <div className="form-group">
            <label>Quantity (km/units) *</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              placeholder="e.g. 10"
            />
            {formData.amount && (
              <div className="carbon-preview">
                🌍 Estimated CO₂: <strong>{(parseFloat(formData.amount) * 0.21).toFixed(2)} kg</strong>
              </div>
            )}
          </div>

          {/* Date */}
          <div className="form-group">
            <label>Date *</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label>Description (Optional)</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="💬 Add notes (e.g. trip to college)"
            ></textarea>
          </div>

          {/* Error & Success */}
          {error && <div className="error-message">{error}</div>}
          {success && <div className="carbon-preview">{success}</div>}

          {/* Buttons */}
          <div className="form-actions">
            <button
              type="button"
              className="secondary-btn"
              onClick={() =>
                setFormData({
                  type: 'transport',
                  activity: '',
                  amount: '',
                  date: new Date().toISOString().split('T')[0],
                  description: ''
                })
              }
            >
              🔄 Cancel
            </button>
            <button type="submit" disabled={loading} className="primary-btn">
              {loading ? 'Adding...' : '✅ Add Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEntry;
