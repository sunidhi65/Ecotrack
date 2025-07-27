const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user.js');

const router = express.Router();

// ✅ Test route
router.get('/test', (_req, res) => {
  res.json({
    message: 'Backend connected successfully!',
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// ✅ Register route
router.post('/register', async (req, res) => {
  console.log('Register endpoint hit');
  console.log('Request body:', req.body);

  try {
    const { name, username, email, password } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, username, email, and password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address'
      });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email or username already exists'
      });
    }

    const newUser = new User({
      name: name.trim(),
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password
    });

    await newUser.save();

    // 🔧 Fixed: Make payload consistent with login route
    const payload = {
      userId: newUser._id,
      email: newUser.email,
      role: newUser.role
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'fallback-secret-key', {
      expiresIn: '24h'
    });

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        username: newUser.username,
        role: newUser.role,
        createdAt: newUser.createdAt
      }
    });

  } catch (err) {
    console.error('❌ Server error during registration:', err);

    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email or username already exists'
      });
    }

    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: errors.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// ✅ Login route
router.post('/login', async (req, res) => {
  console.log('Login endpoint hit');

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (!user.isUserActive()) {
      return res.status(401).json({
        success: false,
        message: 'Account is inactive. Please contact support.'
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    await user.updateLastLogin();

    const payload = {
      userId: user._id,
      email: user.email,
      role: user.role
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'fallback-secret-key', {
      expiresIn: '24h'
    });

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username, // 🔧 Added username for consistency
        role: user.role,
        lastLogin: user.lastLogin
      }
    });

  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// ✅ Token verification route (helpful for dashboard)
router.get('/verify-token', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Bearer token
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    return res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        lastLogin: user.lastLogin
      }
    });

  } catch (err) {
    console.error('❌ Token verification error:', err);
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

// ✅ Logout route
router.post('/logout', (_req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

module.exports = router;