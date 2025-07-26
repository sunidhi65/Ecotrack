import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './EditEntry.css';

function EditEntry() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    type: '',
    activity: '',
    amount: '',
    date: '',
    description: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchEntry = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`https://ecotrack19.onrender.com/api/entries/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFormData(res.data);
    } catch (err) {
      console.error(err);
      showToast('⚠️ Failed to load entry', 'error');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEntry();
  }, [fetchEntry]);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`https://ecotrack19.onrender.com/api/entries/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast('✅ Entry updated successfully!', 'success');
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (err) {
      console.error(err);
      showToast('❌ Failed to update entry', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="edit-entry-container"><p>Loading entry...</p></div>;

  return (
    <div className="edit-entry-container">
      <h2>✏️ Edit Entry</h2>
      <div className="edit-form">
        <label>Type</label>
        <select name="type" value={formData.type} onChange={handleChange}>
          <option value="transport">🚗 Transport</option>
          <option value="energy">⚡ Energy</option>
          <option value="food">🍽️ Food</option>
          <option value="waste">🗑️ Waste</option>
        </select>

        <label>Activity</label>
        <input
          type="text"
          name="activity"
          value={formData.activity}
          onChange={handleChange}
          required
        />

        <label>CO₂ Amount (kg)</label>
        <input
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          required
        />

        <label>Date</label>
        <input
          type="date"
          name="date"
          value={formData.date?.split('T')[0]}
          onChange={handleChange}
          required
        />

        <label>Description (optional)</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
        />

        <div className="form-buttons">
          <button className="cancel-btn" onClick={() => navigate(-1)}>← Cancel</button>
          <button className="save-btn" onClick={() => setShowConfirm(true)} disabled={saving}>
            {saving ? 'Saving...' : '💾 Save Changes'}
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Confirm Save</h3>
            <p>Are you sure you want to update this entry?</p>
            <div className="modal-actions">
              <button onClick={() => setShowConfirm(false)}>Cancel</button>
              <button onClick={handleSubmit} className="confirm-btn">Yes, Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.type}`}>{toast.message}</div>
      )}
    </div>
  );
}

export default EditEntry;

