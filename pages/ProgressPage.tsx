import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Award, Star } from 'lucide-react';

const levels = [
    { name: "Novice Soul", minPoints: 0 },
    { name: "Mindful Apprentice", minPoints: 100 },
    { name: "Emotion Navigator", minPoints: 250 },
    { name: "Serenity Seeker", minPoints: 500 },
    { name: "Emotional Master", minPoints: 1000 },
    { name: "Zen Grandmaster", minPoints: 2000 },
];

const ProgressPage: React.FC = () => {
  const { user } = useAuth();
  const userPoints = user?.userPoints || 0;

  const currentLevelIndex = levels.findIndex((level, index) => {
    const nextLevel = levels[index + 1];
    return userPoints >= level.minPoints && (!nextLevel || userPoints < nextLevel.minPoints);
  });
  
  const currentLevel = levels[currentLevelIndex] || levels[0];
  const nextLevel = levels[currentLevelIndex + 1];
  
  const pointsInCurrentLevel = userPoints - currentLevel.minPoints;
  const pointsForNextLevel = nextLevel ? nextLevel.minPoints - currentLevel.minPoints : 0;
  const progressPercentage = nextLevel ? (pointsInCurrentLevel / pointsForNextLevel) * 100 : 100;

  return (
    <div className="space-y-6 animate-slide-in-up">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Your Progress</h1>
      
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center">
        <div className="flex justify-center items-center mb-4">
            <Award className="w-12 h-12 text-yellow-500" />
            <div className="ml-4 text-left">
                <p className="text-gray-500 dark:text-gray-400">Current Level</p>
                <h2 className="text-3xl font-bold text-warm-purple-700 dark:text-warm-purple-300">{currentLevel.name}</h2>
            </div>
        </div>
        
        <div className="mt-8">
            <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-300 mb-2">
                <span>{currentLevel.minPoints} pts</span>
                <span className="font-semibold">{userPoints} / {nextLevel ? nextLevel.minPoints : 'Max'} pts</span>
                <span>{nextLevel ? nextLevel.minPoints : ''} pts</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                <div className="bg-gradient-to-r from-calm-blue-400 to-warm-purple-500 h-4 rounded-full relative" style={{ width: `${progressPercentage}%`, transition: 'width 0.5s ease-in-out' }}>
                    <Star className="w-5 h-5 text-white absolute top-1/2 -right-2 -translate-y-1/2" />
                </div>
            </div>
        </div>

        {nextLevel ? (
            <p className="mt-4 text-gray-500 dark:text-gray-400">
                You need <span className="font-bold text-warm-purple-600 dark:text-warm-purple-400">{nextLevel.minPoints - userPoints}</span> more points to reach {nextLevel.name}.
            </p>
        ) : (
            <p className="mt-4 text-green-600 font-semibold">You've reached the highest level! Congratulations!</p>
        )}
      </div>

       <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">All Levels</h3>
            <ul className="space-y-3">
                {levels.map((level, index) => (
                    <li key={level.name} className={`flex items-center p-3 rounded-lg ${index === currentLevelIndex ? 'bg-warm-purple-100 dark:bg-warm-purple-900/50 ring-2 ring-warm-purple-300 dark:ring-warm-purple-700' : 'bg-gray-50 dark:bg-gray-700'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${index <= currentLevelIndex ? 'bg-warm-purple-500 text-white' : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'}`}>
                            <Star className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-semibold text-gray-800 dark:text-gray-200">{level.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Requires {level.minPoints} points</p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>

    </div>
  );
};

export default ProgressPage;