import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

const token = localStorage.getItem('token');
let loggedInUserId = null;

if (token) {
  const decoded = jwtDecode(token);
  loggedInUserId = decoded.userId || decoded.id; // use the key you encoded in backend
}


function App() {
  const isAuthenticated = !!localStorage.getItem('token');

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




