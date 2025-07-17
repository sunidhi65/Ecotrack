const express = require('express');
const router = express.Router();
const Entry = require('../models/Entry');
const mongoose = require('mongoose');

router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Get current time in UTC midnight
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const oneWeekAgo = new Date(today);
    oneWeekAgo.setUTCDate(today.getUTCDate() - 7);

    const oneMonthAgo = new Date(today);
    oneMonthAgo.setUTCDate(today.getUTCDate() - 30);

    // Log date ranges
    console.log(`🕒 Week range: ${oneWeekAgo.toISOString()} -> ${today.toISOString()}`);
    console.log(`🕒 Month range: ${oneMonthAgo.toISOString()} -> ${oneWeekAgo.toISOString()}`);

    // Recent entries (last 7 days)
    const recentUsage = await Entry.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: { $gte: oneWeekAgo, $lt: today }
        }
      },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" }
        }
      }
    ]);

    // Historical entries (7–30 days ago)
    const historicalUsage = await Entry.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: { $gte: oneMonthAgo, $lt: oneWeekAgo }
        }
      },
      {
        $group: {
          _id: "$type",
          avgTotal: { $avg: "$amount" }
        }
      }
    ]);

    console.log("📈 Recent Usage:", recentUsage);
    console.log("📉 Historical Usage:", historicalUsage);

    const suggestions = [];

    recentUsage.forEach(recent => {
      const hist = historicalUsage.find(h => h._id === recent._id);
      if (!hist) return;

      const diff = recent.total - hist.avgTotal;
      if (diff > 0) {
        suggestions.push(`⚠️ Your ${recent._id} emissions increased by ${diff.toFixed(2)} kg CO₂ compared to the previous weeks.`);
      } else if (diff < 0) {
        suggestions.push(`✅ Great! Your ${recent._id} emissions dropped by ${Math.abs(diff).toFixed(2)} kg CO₂.`);
      } else {
        suggestions.push(`📊 Your ${recent._id} emissions remained the same.`);
      }
    });

    if (recentUsage.length === 0) {
      suggestions.push("📭 No recent entries found in the last 7 days. Log your emissions to get personalized insights!");
    }

    res.json({ suggestions });
  } catch (error) {
    console.error("❌ Error generating suggestions:", error);
    res.status(500).json({ error: 'Failed to generate suggestions' });
  }
});

module.exports = router;



