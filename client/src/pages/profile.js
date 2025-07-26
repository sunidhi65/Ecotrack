import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

function Profile() {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('https://ecotrack19.onrender.com/api/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data);
      setUsername(res.data.username || '');
    } catch (err) {
      console.error(err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfile({ ...profile, profilePicture: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const saveProfile = async () => {
    const token = localStorage.getItem('token');
    try {
      // Update general profile fields
      await axios.put('https://ecotrack19.onrender.com/api/profile', profile, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Update goal separately
      await axios.put(
        'https://ecotrack19.onrender.com/api/profile/goal',
        {
          goal: profile.goal,
          goalType: profile.goalType,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update username or password
      await axios.put(
        'https://ecotrack19.onrender.com/api/profile/update',
        {
          username,
          currentPassword,
          newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setEditing(false);
      setCurrentPassword('');
      setNewPassword('');
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update profile');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="profile-container">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <p className="error-msg">{error}</p>
          <button className="retry-btn" onClick={fetchProfile}>Try Again</button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-container">
        <div className="error-state">
          <div className="error-icon">❌</div>
          <p>Profile not found</p>
          <button className="back-btn" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-wrapper">
        <div className="profile-header">
          <div className="profile-header-content">
            <h1 className="profile-title">
              <span className="profile-icon">👤</span>
              My Profile
            </h1>
            <p className="profile-subtitle">Manage your account and carbon tracking preferences</p>
          </div>
          <button className="back-btn" onClick={() => navigate('/dashboard')}>
            <span className="back-icon">🔙</span>
            Back to Dashboard
          </button>
        </div>

        <div className="profile-content">
          {/* Profile Picture */}
          <div className="profile-section profile-picture-section">
            <div className="section-header">
              <h3>Profile Picture</h3>
            </div>
            <div className="profile-picture-container">
              <div className="profile-picture-wrapper">
                {profile.profilePicture ? (
                  <img src={profile.profilePicture} alt="Profile" className="profile-pic-preview" />
                ) : (
                  <div className="profile-pic-placeholder">
                    <span className="placeholder-icon">👤</span>
                  </div>
                )}
                {editing && (
                  <label className="upload-btn">
                    <input type="file" accept="image/*" onChange={handleImageUpload} />
                    <span className="upload-icon">📷</span>
                    Change Photo
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Personal Info */}
          <div className="profile-section">
            <div className="section-header">
              <h3>Personal Information</h3>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  name="name"
                  value={profile.name || ''}
                  disabled={!editing}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className={editing ? 'editable' : 'readonly'}
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  name="email"
                  value={profile.email || ''}
                  disabled
                  readOnly
                  className="readonly"
                />
              </div>

              <div className="form-group">
                <label>Username</label>
                <input
                  name="username"
                  value={username}
                  disabled={!editing}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className={editing ? 'editable' : 'readonly'}
                />
              </div>

              <div className="form-group full-width">
                <label>Bio</label>
                <textarea
                  name="bio"
                  value={profile.bio || ''}
                  disabled={!editing}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Tell us about yourself and your environmental goals..."
                  className={editing ? 'editable' : 'readonly'}
                />
              </div>
            </div>
          </div>

          {/* Carbon Goals */}
          <div className="profile-section goals-section">
            <div className="section-header">
              <h3><span className="goal-icon">🎯</span>Carbon Emission Goals</h3>
            </div>

            {!editing ? (
              <div className="current-goal-display">
                <div className="goal-card">
                  <div className="goal-info">
                    <div className="goal-amount">{profile.goal || 0} kg</div>
                    <div className="goal-type">
                      {profile.goalType?.charAt(0).toUpperCase() + profile.goalType?.slice(1)} Goal
                    </div>
                  </div>
                  <div className="goal-icon-large">🌱</div>
                </div>
                {(!profile.goal || profile.goal === 0) && (
                  <p className="no-goal-text">No carbon emission goal set yet. Set a goal to track your progress!</p>
                )}
              </div>
            ) : (
              <div className="goal-edit-form">
                <div className="form-group">
                  <label>CO₂ Goal (kg)</label>
                  <input
                    name="goal"
                    type="number"
                    value={profile.goal || ''}
                    onChange={handleChange}
                    placeholder="e.g. 50"
                    className="editable"
                    min="0"
                    step="0.1"
                  />
                </div>

                <div className="form-group">
                  <label>Goal Period</label>
                  <select
                    name="goalType"
                    value={profile.goalType || 'weekly'}
                    onChange={handleChange}
                    className="editable"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Password Change */}
          {editing && (
            <div className="profile-section">
              <div className="section-header">
                <h3>Change Password</h3>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="editable"
                  />
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="editable"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="profile-actions">
          {editing ? (
            <>
              <button className="save-btn" onClick={saveProfile}>
                <span className="btn-icon">💾</span>
                Save Changes
              </button>
              <button className="cancel-btn" onClick={() => setEditing(false)}>
                <span className="btn-icon">❌</span>
                Cancel
              </button>
            </>
          ) : (
            <button className="edit-btn" onClick={() => setEditing(true)}>
              <span className="btn-icon">✏️</span>
              Edit Profile
            </button>
          )}
        </div>

        {/* Status Messages */}
        {success && (
          <div className="status-message success-message">
            <span className="status-icon">✅</span>
            {success}
          </div>
        )}
        {error && (
          <div className="status-message error-message">
            <span className="status-icon">⚠️</span>
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
