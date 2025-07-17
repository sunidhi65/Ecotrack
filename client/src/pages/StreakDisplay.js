

// Streak Display Component
const StreakDisplay = ({ streak, loading, error }) => {
  if (loading) {
    return (
      <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-xl p-6 text-white animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-white/20 rounded w-32"></div>
          <div className="h-12 w-12 bg-white/20 rounded-full"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-300 rounded-xl p-6 text-red-700">
        <p>Unable to load streak data: {error}</p>
      </div>
    );
  }

  const days = streak?.currentStreak || 0;
  
  const getStreakColor = (days) => {
    if (days >= 30) return 'from-yellow-400 to-orange-500';
    if (days >= 14) return 'from-purple-400 to-pink-500';
    if (days >= 7) return 'from-blue-400 to-indigo-500';
    if (days >= 3) return 'from-green-400 to-emerald-500';
    return 'from-gray-400 to-gray-500';
  };

  const getStreakEmoji = (days) => {
    if (days >= 100) return '🏆';
    if (days >= 30) return '⭐';
    if (days >= 14) return '💪';
    if (days >= 7) return '🔥';
    if (days >= 3) return '🌱';
    return '🌟';
  };

  const getMotivationalMessage = (days) => {
    if (days >= 100) return "Legend! You're an eco warrior!";
    if (days >= 30) return "Amazing! You're on fire!";
    if (days >= 14) return "Great job! Keep it up!";
    if (days >= 7) return "One week strong!";
    if (days >= 3) return "Building momentum!";
    if (days >= 1) return "Great start!";
    return "Start your eco journey!";
  };

  const nextMilestone = days < 3 ? 3 : days < 7 ? 7 : days < 14 ? 14 : days < 30 ? 30 : days < 100 ? 100 : null;
  const progress = nextMilestone ? ((days % nextMilestone) / nextMilestone) * 100 : 100;

  return (
    <div className={`bg-gradient-to-r ${getStreakColor(days)} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-2xl font-bold">{days} Day Streak</h3>
          <p className="text-white/80">{getMotivationalMessage(days)}</p>
        </div>
        <div className="text-4xl animate-bounce">
          {getStreakEmoji(days)}
        </div>
      </div>
      
      {nextMilestone && (
        <div className="mb-2">
          <div className="flex justify-between text-sm mb-1">
            <span>Next milestone: {nextMilestone} days</span>
            <span>{nextMilestone - days} days to go</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-white rounded-full h-2 transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}
      
      <div className="flex justify-between text-sm text-white/80">
        <span>Longest: {streak?.longestStreak || 0} days</span>
        <span>Total entries: {streak?.totalEntries || 0}</span>
      </div>
    </div>
  );
};

export default StreakDisplay;