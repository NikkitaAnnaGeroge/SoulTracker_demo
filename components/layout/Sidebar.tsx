import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, MessageSquare, BarChart2, Trophy, LogOut, HeartPulse, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';

const Sidebar: React.FC = () => {
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { icon: Home, text: 'Dashboard', path: '/app/dashboard' },
    { icon: MessageSquare, text: 'Chat with Soul', path: '/app/chat' },
    { icon: BarChart2, text: 'Progress', path: '/app/progress' },
    { icon: Trophy, text: 'Leaderboard', path: '/app/leaderboard' },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 shadow-lg flex flex-col p-4">
      <div className="flex items-center mb-10 p-2">
        <HeartPulse className="h-8 w-8 text-warm-purple-500" />
        <h1 className="text-2xl font-bold ml-2 text-warm-purple-800 dark:text-warm-purple-300">SoulTracker</h1>
      </div>
      <nav className="flex-1">
        <ul>
          {navItems.map((item) => (
            <li key={item.text}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center p-3 my-2 rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-warm-purple-100 text-warm-purple-700 dark:bg-warm-purple-900 dark:text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-calm-blue-100 hover:text-calm-blue-800 dark:hover:bg-gray-700 dark:hover:text-white'
                  }`
                }
              >
                <item.icon className="h-5 w-5 mr-3" />
                <span>{item.text}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-auto">
        <div className="p-3 mb-2 bg-calm-blue-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-200 truncate">{user?.email}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Points: {user?.userPoints}</p>
        </div>
         <button
          onClick={toggleTheme}
          className="flex items-center w-full p-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-calm-blue-100 dark:hover:bg-gray-700 transition-colors duration-200"
          aria-label="Toggle theme"
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? <Moon className="h-5 w-5 mr-3" /> : <Sun className="h-5 w-5 mr-3" />}
          <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center w-full p-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-700 dark:hover:text-red-400 transition-colors duration-200"
        >
          <LogOut className="h-5 w-5 mr-3" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;