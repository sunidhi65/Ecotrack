import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import EntriesPage from './pages/EntriesPage';
import AddEntry from './pages/Addentry';
import Home from './pages/Home';
import EditEntry from './pages/EditEntry';
import Profile from './pages/profile';
import PersonalAnalytics from './pages/PersonalAnalytics';
import Leaderboard from './pages/Leaderboard';
import SmartSuggestions from './pages/SmartSuggestions';
import { jwtDecode } from 'jwt-decode';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loggedInUserId, setLoggedInUserId] = useState(null);

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          const decoded = jwtDecode(token);
          const currentTime = Date.now() / 1000;
          
          // Check if token is expired
          if (decoded.exp > currentTime) {
            setIsAuthenticated(true);
            setLoggedInUserId(decoded.userId || decoded.id);
          } else {
            // Token expired, remove it
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            localStorage.removeItem('user');
            setIsAuthenticated(false);
            setLoggedInUserId(null);
          }
        } catch (error) {
          console.error('Invalid token:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          localStorage.removeItem('user');
          setIsAuthenticated(false);
          setLoggedInUserId(null);
        }
      } else {
        setIsAuthenticated(false);
        setLoggedInUserId(null);
      }
    };

    // Check auth on mount
    checkAuth();

    // Listen for storage changes (when token is added/removed)
    const handleStorageChange = (e) => {
      if (e.key === 'token') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Custom event for same-tab token changes
    const handleTokenChange = () => {
      checkAuth();
    };
    
    window.addEventListener('tokenChanged', handleTokenChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('tokenChanged', handleTokenChange);
    };
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/entries" element={isAuthenticated ? <EntriesPage /> : <Navigate to="/login" />} />
        <Route path="/add-entry" element={isAuthenticated ? <AddEntry /> : <Navigate to="/login" />} />
        <Route path="/edit-entry/:id" element={isAuthenticated ? <EditEntry /> : <Navigate to="/login" />} />
        <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
        <Route path="/analytics" element={<PersonalAnalytics />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/smart-suggestions" element={<SmartSuggestions userId={loggedInUserId} />} />
      </Routes>
    </Router>
  );
}

export default App;