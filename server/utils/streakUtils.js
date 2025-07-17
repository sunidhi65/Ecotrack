const User = require('../models/user'); // Note: lowercase 'user' to match your import

const streakUtils = {
  // Check if two dates are consecutive days
  isConsecutiveDay: (lastDate, currentDate) => {
    if (!lastDate) return true; // First entry
    
    const last = new Date(lastDate);
    const current = new Date(currentDate);
    
    // Set to start of day for accurate comparison
    last.setHours(0, 0, 0, 0);
    current.setHours(0, 0, 0, 0);
    
    const diffTime = current - last;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    
    return diffDays === 1;
  },

  // Check if entry is for the same day
  isSameDay: (lastDate, currentDate) => {
    if (!lastDate) return false;
    
    const last = new Date(lastDate);
    const current = new Date(currentDate);
    
    return last.toDateString() === current.toDateString();
  },

  // Update user's streak
  updateStreak: async (userId, entryDate = new Date()) => {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');

      const today = new Date(entryDate);
      today.setHours(0, 0, 0, 0);

      // If entry is for the same day, don't update streak
      if (streakUtils.isSameDay(user.lastEntryDate, today)) {
        return user.currentStreak || 0;
      }

      let newStreak;
      
      if (streakUtils.isConsecutiveDay(user.lastEntryDate, today)) {
        // Consecutive day - increment streak
        newStreak = (user.currentStreak || 0) + 1;
      } else {
        // Skipped day(s) - reset streak
        newStreak = 1;
      }

      // Update user
      await User.findByIdAndUpdate(userId, {
        currentStreak: newStreak,
        lastEntryDate: today
      });

      return newStreak;
    } catch (error) {
      console.error('Error updating streak:', error);
      throw error;
    }
  }
};

module.exports = streakUtils;