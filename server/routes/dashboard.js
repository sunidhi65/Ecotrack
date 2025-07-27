const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user.js'); // Adjust path as needed
const router = express.Router();

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer token

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access denied. No token provided.' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
    req.user = decoded; // Contains userId, email, role
    next();
  } catch (err) {
    console.error('❌ Token verification failed:', err);
    return res.status(403).json({ 
      success: false, 
      message: 'Invalid token.' 
    });
  }
};

// GET /api/dashboard - Return dashboard data (Protected Route)
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Get user information from the token
    const userId = req.user.userId;
    const userEmail = req.user.email;
    const userRole = req.user.role;

    // Fetch complete user data from database
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is active
    if (!user.isUserActive()) {
      return res.status(401).json({
        success: false,
        message: 'Account is inactive. Please contact support.'
      });
    }

    // You can aggregate data from different sources here
    // For now, I'll show how to access user data and add placeholder calculations
    const dashboardData = {
      success: true,
      data: {
        message: `Welcome to your dashboard, ${user.name}!`,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          username: user.username,
          role: user.role,
          memberSince: user.createdAt,
          lastLogin: user.lastLogin
        },
        stats: {
          totalEntries: 0, // You can calculate this from your database
          currentStreak: 0, // Calculate based on user activity
          carbonSaved: 0,   // Calculate based on user's eco-friendly actions
          accountAge: Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)) // Days since registration
        },
        // Add more dashboard sections as needed
        recentActivity: [],
        notifications: [],
        quickActions: [
          { name: 'View Profile', url: '/profile' },
          { name: 'Settings', url: '/settings' },
          { name: 'Help', url: '/help' }
        ]
      }
    };
    
    res.json(dashboardData);
  } catch (error) {
    console.error('❌ Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard data'
    });
  }
});

// GET /api/dashboard/stats - Get user statistics (Protected Route)
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Here you would typically query your database for user-specific stats
    // This is just an example structure
    const stats = {
      success: true,
      data: {
        totalEntries: 0,
        currentStreak: 0,
        carbonSaved: 0,
        weeklyActivity: [
          { day: 'Mon', count: 0 },
          { day: 'Tue', count: 0 },
          { day: 'Wed', count: 0 },
          { day: 'Thu', count: 0 },
          { day: 'Fri', count: 0 },
          { day: 'Sat', count: 0 },
          { day: 'Sun', count: 0 }
        ]
      }
    };
    
    res.json(stats);
  } catch (error) {
    console.error('❌ Stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching statistics'
    });
  }
});

// GET /api/dashboard/profile - Get user profile (Protected Route)
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('❌ Profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
});

module.exports = router;