import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

function Register() {
  const [form, setForm] = useState({ 
    name: '', 
    username: '', 
    email: '', 
    password: '', 
    confirmPassword: '' 
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();

    // Validation
    if (!form.name.trim()) {
      setMessage('Full name is required!');
      return;
    }

    if (!form.username.trim()) {
      setMessage('Username is required!');
      return;
    }

    if (!form.email.trim()) {
      setMessage('Email is required!');
      return;
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(form.email)) {
      setMessage('Please enter a valid email address!');
      return;
    }

    if (form.password.length < 6) {
      setMessage('Password must be at least 6 characters long!');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setMessage('Passwords do not match!');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', {
        name: form.name.trim(),
        username: form.username.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password
      });

      console.log('✅ Registration successful:', res.data);
      setMessage('Registration successful! Redirecting to login...');

      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      console.error('❌ Registration error:', err);
      if (err.response) {
        const errorMsg = err.response.data?.error || err.response.data?.message || 'Registration failed';
        setMessage(errorMsg);
      } else if (err.request) {
        setMessage('Cannot connect to server. Please check if the server is running.');
      } else {
        setMessage('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>📝 Register for EcoTrack</h2>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Full Name:</label>
            <input 
              name="name" 
              type="text"
              placeholder="Enter your full name" 
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Username:</label>
            <input 
              name="username" 
              type="text"
              placeholder="Choose a username" 
              value={form.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email:</label>
            <input 
              name="email" 
              type="email"
              placeholder="Enter your email address" 
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Password:</label>
            <input 
              name="password" 
              type="password" 
              placeholder="Create a password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Confirm Password:</label>
            <input 
              name="confirmPassword" 
              type="password" 
              placeholder="Confirm your password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        {message && (
          <div className={`message ${message.includes('successful') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <p className="auth-link">
          Already have an account? <Link to="/login">Login here</Link>
        </p>

        <p className="auth-link">
          <Link to="/">← Back to Home</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
