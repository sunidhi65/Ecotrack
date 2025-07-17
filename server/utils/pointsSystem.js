const User = require('../models/user');
const Entry = require('../models/Entry');

const POINTS_CONFIG = {
  RECYCLING: 10,
  TRANSPORT: 15,
  ENERGY_SAVING: 20,
  WATER_CONSERVATION: 8,
  WASTE_REDUCTION: 12,
  GREEN_PURCHASE: 5
};

class PointsManager {
  static async awardPoints(userId, activityType, description = '') {
    try {
      const points = POINTS_CONFIG[activityType] || 5;
      
      await User.findByIdAndUpdate(userId, {
        $inc: {
          totalPoints: points,
          weeklyPoints: points,
          monthlyPoints: points
        }
      });
      
      // Update streak logic here
      await this.updateStreak(userId);
      
      return points;
    } catch (error) {
      console.error('Error awarding points:', error);
      return 0;
    }
  }
  
  static async updateStreak(userId) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const todayEntry = await Entry.findOne({
      userId,
      date: {
        $gte: today.setHours(0,0,0,0),
        $lt: today.setHours(23,59,59,999)
      }
    });
    
    const yesterdayEntry = await Entry.findOne({
      userId,
      date: {
        $gte: yesterday.setHours(0,0,0,0),
        $lt: yesterday.setHours(23,59,59,999)
      }
    });
    
    const user = await User.findById(userId);
    
    if (todayEntry) {
      if (yesterdayEntry || user.currentStreak === 0) {
        const newStreak = user.currentStreak + 1;
        await User.findByIdAndUpdate(userId, {
          currentStreak: newStreak,
          longestStreak: Math.max(user.longestStreak, newStreak)
        });
      }
    }
  }
}

module.exports = PointsManager;