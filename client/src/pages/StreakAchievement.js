import { Flame, Trophy, Star, Target, Calendar } from 'lucide-react';

// Achievement Component
const Achievement = ({ title, days, isUnlocked, icon: Icon }) => (
  <div className={`p-4 rounded-lg border-2 transition-all duration-300 ${
    isUnlocked 
      ? 'bg-gradient-to-r from-yellow-100 to-orange-100 border-yellow-300 shadow-md' 
      : 'bg-gray-100 border-gray-300 opacity-50'
  }`}>
    <div className="flex items-center space-x-3">
      <Icon className={`w-8 h-8 ${isUnlocked ? 'text-yellow-600' : 'text-gray-400'}`} />
      <div>
        <h4 className={`font-semibold ${isUnlocked ? 'text-gray-800' : 'text-gray-500'}`}>
          {title}
        </h4>
        <p className={`text-sm ${isUnlocked ? 'text-gray-600' : 'text-gray-400'}`}>
          {days} day streak
        </p>
      </div>
    </div>
  </div>
);


// Achievements Section Component
const StreakAchievements = ({ currentStreak }) => {
  const achievements = [
    { title: 'Getting Started', days: 3, icon: Target },
    { title: 'Week Warrior', days: 7, icon: Calendar },
    { title: 'Two Week Champion', days: 14, icon: Flame },
    { title: 'Monthly Master', days: 30, icon: Star },
    { title: 'Century Club', days: 100, icon: Trophy }
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <h3 className="text-xl font-bold text-gray-800 mb-4">🏆 Achievements</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((achievement) => (
          <Achievement
            key={achievement.days}
            title={achievement.title}
            days={achievement.days}
            isUnlocked={currentStreak >= achievement.days}
            icon={achievement.icon}
          />
        ))}
      </div>
    </div>
  );
};

export default StreakAchievements;
