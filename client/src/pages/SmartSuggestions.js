import { useEffect, useState } from 'react';
import axios from 'axios';
import './SmartSuggestions.css';

function SmartSuggestions() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuggestions = async () => {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');

      if (!userId || !token) {
        setSuggestions(["🔒 Please log in to view personalized suggestions."]);
        setLoading(false);
        return;
      }

      try {
        console.log("📡 Fetching suggestions for user:", userId);
        const res = await axios.get(`http://localhost:5000/api/suggestions/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setSuggestions(res.data.suggestions || []);
      } catch (err) {
        console.error("Error fetching suggestions:", err);
        setSuggestions(["❌ Failed to load smart suggestions. Try again later."]);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, []);

  return (
    <div className="smart-suggestions-container">
      <h2>🌿 Personalized Eco Suggestions</h2>
      {loading ? (
        <p>Loading smart insights...</p>
      ) : suggestions.length === 0 ? (
        <p>No suggestions found.</p>
      ) : (
        <ul className="suggestion-list">
          {suggestions.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SmartSuggestions;
