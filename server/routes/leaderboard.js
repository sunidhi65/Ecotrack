const express = require('express');
const mongoose = require('mongoose'); // needed for $toObjectId
const router = express.Router();      // ✅ This line defines 'router'
const Entry = require('../models/Entry');
const User = require('../models/user');

router.get('/:period', async (req, res) => {
  try {
    const { period } = req.params;
    const { limit = 50 } = req.query;

    let startDate;
    const now = new Date();

    if (period === 'weekly') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
    } else if (period === 'monthly') {
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
    } else {
      startDate = new Date(0); // allTime
    }

    const leaderboard = await Entry.aggregate([
      {
        $match: {
          date: { $gte: startDate }
        }
      },
      {
        $addFields: {
          userObjId: { $toObjectId: "$userId" }  // 👈 convert string to ObjectId
        }
      },
      {
        $group: {
          _id: "$userObjId",
          totalCO2Saved: { $sum: "$amount" }
        }
      },
      {
        $lookup: {
          from: "users", // collection name (lowercase plural)
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      {
        $project: {
          username: "$user.username",
          totalCO2Saved: 1,
          points: { $multiply: ["$totalCO2Saved", 10] }
        }
      },
      { $sort: { points: -1 } },
      { $limit: parseInt(limit) }
    ]);

    const leaderboardWithRank = leaderboard.map((user, index) => ({
      ...user,
      rank: index + 1
    }));

    res.json({ leaderboard: leaderboardWithRank, period });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});


module.exports = router;
