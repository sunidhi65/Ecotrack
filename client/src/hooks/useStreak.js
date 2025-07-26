import { useState, useEffect } from 'react';

const useStreak = () => {
  const [streak, setStreak] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStreak = async () => {
    try {
      setLoading(true);
      // Replace with your actual API endpoint
      const response = await fetch('https://ecotrack19.onrender.com/api/streak');
      if (response.ok) {
        const data = await response.json();
        setStreak(data);
      } else {
        throw new Error('Failed to fetch streak');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStreak = async () => {
    await fetchStreak();
  };

  useEffect(() => {
    fetchStreak();
  }, []);

  return { streak, loading, error, updateStreak };
};

export default useStreak;