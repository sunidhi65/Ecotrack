const express = require('express');
const router = express.Router();

// GET /api/dashboard - Return dashboard data
router.get('/', async (req, res) => {
  try {
    // You can aggregate data from different sources here
    const dashboardData = {
      success: true,
      data: {
        message: "Welcome to your dashboard!",
        // Add any dashboard-specific data you need
        stats: {
          totalEntries: 0,
          currentStreak: 0,
          carbonSaved: 0
        }
      }
    };
    
    res.json(dashboardData);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;