import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Emotion } from '../types';
import { Flame, Award, HeartPulse } from 'lucide-react';

const EmotionalHealthGauge: React.FC<{ score: number }> = ({ score }) => {
    const { theme } = useTheme();
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (score / 100) * circumference;
    const scoreColor = score > 70 ? 'text-green-500' : score > 40 ? 'text-yellow-500' : 'text-red-500';

    return (
        <div className="relative w-48 h-48 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
                <circle cx="50%" cy="50%" r="45%" strokeWidth="10%" stroke="currentColor" className="text-gray-200 dark:text-gray-700" fill="transparent"/>
                <circle cx="50%" cy="50%" r="45%" strokeWidth="10%" stroke="currentColor" className={scoreColor} fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
                />
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className={`text-4xl font-bold ${scoreColor}`}>{score}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">Health Score</span>
            </div>
        </div>
    );
};

const StreakStarburst: React.FC<{ streak: number }> = ({ streak }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex justify-center items-center">
            <div className="relative">
                <div className="absolute inset-0 animate-starburst">
                    {[...Array(12)].map((_, i) => (
                        <div key={i} className="absolute w-2 h-16 bg-yellow-400" style={{ transform: `rotate(${i * 30}deg) translateY(-50px)`, transformOrigin: 'center' }}></div>
                    ))}
                </div>
                <div className="relative bg-white p-8 rounded-full shadow-2xl flex flex-col items-center text-center">
                    <Flame className="w-16 h-16 text-orange-500 mb-2"/>
                    <h2 className="text-2xl font-bold text-gray-800">{streak} Day Streak!</h2>
                    <p className="text-gray-600">You've earned +5 points!</p>
                </div>
            </div>
        </div>
    );
};

const DashboardPage: React.FC = () => {
    const { user } = useAuth();
    const { theme } = useTheme();
    const location = useLocation();
    const [showStreak, setShowStreak] = useState(false);

    useEffect(() => {
        if (location.state?.showStreakModal) {
            setShowStreak(true);
            const timer = setTimeout(() => setShowStreak(false), 3000);
            // Clean up state to prevent modal from reappearing on navigation
            window.history.replaceState({}, document.title)
            return () => clearTimeout(timer);
        }
    }, [location.state]);


    const emotionalHealthScore = 78; // Mock data

    const emotionTrendData = user?.emotionalHistory
        .slice(-30) // last 30 entries
        .reduce((acc, log) => {
            const found = acc.find(item => item.name === log.emotion);
            if (found) {
                found.count++;
            } else {
                acc.push({ name: log.emotion, count: 1 });
            }
            return acc;
        }, [] as { name: Emotion; count: number }[])
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);

  return (
    <div className="space-y-6 animate-slide-in-up">
        {showStreak && user && <StreakStarburst streak={user.currentStreak} />}
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Welcome back, {user?.email.split('@')[0]}!</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex flex-col items-center justify-center">
                <EmotionalHealthGauge score={emotionalHealthScore} />
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex flex-col items-center justify-center space-y-2">
                <Flame className="w-12 h-12 text-orange-500"/>
                <p className="text-4xl font-bold text-gray-800 dark:text-gray-100">{user?.currentStreak}</p>
                <p className="text-gray-500 dark:text-gray-400">Day Streak</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex flex-col items-center justify-center space-y-2">
                <Award className="w-12 h-12 text-yellow-500"/>
                <p className="text-4xl font-bold text-gray-800 dark:text-gray-100">{user?.userPoints}</p>
                <p className="text-gray-500 dark:text-gray-400">Total Points</p>
            </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Your Recent Emotions</h2>
            {emotionTrendData && emotionTrendData.length > 0 ? (
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <BarChart data={emotionTrendData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#4A5568' : '#E2E8F0'}/>
                            <XAxis dataKey="name" tick={{ fill: theme === 'dark' ? '#A0AEC0' : '#4A5568' }} />
                            <YAxis allowDecimals={false} tick={{ fill: theme === 'dark' ? '#A0AEC0' : '#4A5568' }} />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: theme === 'dark' ? '#2D3748' : '#FFFFFF',
                                    borderColor: theme === 'dark' ? '#4A5568' : '#E2E8F0'
                                }}
                                labelStyle={{ color: theme === 'dark' ? '#FFFFFF' : '#000000' }}
                            />
                            <Bar dataKey="count" fill="#8b5cf6" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                    <HeartPulse className="w-12 h-12 mx-auto mb-2 text-gray-400"/>
                    <p>No emotional history yet. Start chatting with Soul to see your trends!</p>
                </div>
            )}
        </div>
    </div>
  );
};

export default DashboardPage;