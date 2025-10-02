import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getLeaderboard } from '../services/mockApi';
import { LeaderboardEntry } from '../types';
import Spinner from '../components/common/Spinner';
import { Crown } from 'lucide-react';

const LeaderboardPage: React.FC = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (user) {
        try {
          const { top10, currentUserEntry } = await getLeaderboard(user.id);
          setLeaderboard(top10);
          setCurrentUserRank(currentUserEntry);
        } catch (error) {
          console.error("Failed to fetch leaderboard", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchLeaderboard();
  }, [user]);

  if (loading) {
    return <div className="flex justify-center items-center h-full"><Spinner /></div>;
  }

  const rankColors: { [key: number]: string } = {
    1: 'text-yellow-500',
    2: 'text-gray-400 dark:text-gray-300',
    3: 'text-yellow-600 dark:text-amber-600',
  };

  const rankIcons: { [key: number]: React.ReactNode } = {
    1: <Crown className="w-5 h-5 text-yellow-500"/>,
  };


  return (
    <div className="space-y-6 animate-slide-in-up">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Leaderboard</h1>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rank</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Points</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {leaderboard.map((entry) => (
                <tr key={entry.rank} className={entry.isCurrentUser ? 'bg-warm-purple-50 dark:bg-warm-purple-900/50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`flex items-center text-lg font-bold ${rankColors[entry.rank] || 'text-gray-900 dark:text-gray-200'}`}>
                      {rankIcons[entry.rank]}
                      <span className="ml-2">{entry.rank}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">
                    {entry.email} {entry.isCurrentUser && '(You)'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-semibold">{entry.userPoints}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {currentUserRank && !leaderboard.some(e => e.isCurrentUser) && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">Your Position</h2>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border-2 border-warm-purple-500 flex items-center justify-between">
              <div className="flex items-center">
                  <span className="text-lg font-bold text-warm-purple-700 dark:text-warm-purple-400 mr-4">{currentUserRank.rank}</span>
                  <p className="font-medium text-gray-800 dark:text-gray-200">{currentUserRank.email} (You)</p>
              </div>
              <p className="font-bold text-warm-purple-700 dark:text-warm-purple-400">{currentUserRank.userPoints} pts</p>
          </div>
        </div>
      )}

    </div>
  );
};

export default LeaderboardPage;