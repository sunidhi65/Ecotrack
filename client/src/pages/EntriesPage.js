import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function EntriesPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEntries = async () => {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/login');

      try {
        // Validate token by decoding it
        jwtDecode(token);
        
        const res = await axios.get('https://ecotrack19.onrender.com/api/entries', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEntries(res.data);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, [navigate]);

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="text-center text-gray-600 mt-10 text-lg">Loading entries...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container relative px-4 sm:px-8 py-6">
      {/* Floating Back Button */}
      <button
        onClick={() => navigate('/dashboard')}
        className="fixed top-5 left-5 bg-indigo-600 text-white px-4 py-2 rounded-xl shadow-lg hover:bg-indigo-700 transition-all duration-200 z-50"
      >
        🔙 Back
      </button>

      <div className="dashboard-content max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">📋 All Entries</h2>

        {entries.length === 0 ? (
          <p className="text-gray-600">No entries found.</p>
        ) : (
          <div className="entries-list space-y-4">
            {entries.map(entry => (
              <div
                key={entry._id}
                className="entry-item flex items-center justify-between p-4 bg-white rounded-xl shadow-md"
              >
                <div className="entry-icon text-2xl">📝</div>
                <div className="entry-content flex-1 ml-4">
                  <h4 className="font-bold text-lg">{entry.activity}</h4>
                  <p className="text-sm text-gray-500">
                    {new Date(entry.date).toLocaleDateString()}
                  </p>
                  {entry.description && (
                    <p className="text-sm mt-1 text-gray-600">{entry.description}</p>
                  )}
                </div>
                <div className="entry-amount font-semibold text-green-600">
                  {entry.amount} kg CO₂
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default EntriesPage;