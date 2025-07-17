const express = require('express');
const router = express.Router();
const Entry = require('../models/Entry');
const auth = require('../middleware/auth');

// ✅ Monthly Emission Comparison
router.get('/monthly', auth, async (req, res) => {
  const userId = req.user.userId;
  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  try {
    const thisMonth = await Entry.aggregate([
      { $match: { user: userId, date: { $gte: startOfThisMonth } } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const lastMonth = await Entry.aggregate([
      { $match: { user: userId, date: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    res.json({
      thisMonth: thisMonth[0]?.total || 0,
      lastMonth: lastMonth[0]?.total || 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching monthly analytics' });
  }
});

// ✅ Category-wise Breakdown
router.get('/category-breakdown', auth, async (req, res) => {
  const userId = req.user.userId;

  try {
    const breakdown = await Entry.aggregate([
      { $match: { user: userId } },
      { $group: { _id: "$category", total: { $sum: "$amount" } } }
    ]);

    res.json(breakdown);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching category breakdown' });
  }
});

// ✅ Emission Intensity
router.get('/intensity', auth, async (req, res) => {
  const userId = req.user.userId;
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  try {
    const entries = await Entry.find({
      user: userId,
      date: { $gte: startOfMonth }
    });

    const total = entries.reduce((sum, e) => sum + e.amount, 0);
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const weeklyAverage = total / 4;
    const dailyAverage = total / daysInMonth;

    res.json({
      dailyAverage: dailyAverage.toFixed(2),
      weeklyAverage: weeklyAverage.toFixed(2),
      globalAvg: 4.5,    // Global per capita CO2/day (approx)
      nationalAvg: 1.9   // India per capita CO2/day (approx)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error calculating emission intensity' });
  }
});

module.exports = router;

