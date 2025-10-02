import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { loginUser } from '../services/mockApi';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { HeartPulse } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const { user, dailyCheckin } = await loginUser(email, password);
      login(user);
      if(dailyCheckin) {
        // Pass state to show streak modal on dashboard
        navigate('/app/dashboard', { state: { showStreakModal: true, streak: user.currentStreak } });
      } else {
        navigate('/app/dashboard');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-calm-blue-50 dark:bg-gray-900 flex flex-col">
      <main className="flex-grow flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center items-center">
              <HeartPulse className="h-12 w-12 text-warm-purple-600" />
              <h2 className="ml-4 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">Sign in to SoulTracker</h2>
          </div>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 animate-fade-in">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <Input id="email" label="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <Input id="password" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <div>
                <Button type="submit" isLoading={isLoading}>Sign in</Button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Don't have an account?</span>
                </div>
              </div>

              <div className="mt-6">
                <Link to="/signup" className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                  Create an account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <footer className="text-center text-xs text-gray-500 dark:text-gray-400 py-4">
        <p className="mb-1">
          <span className="font-semibold">About</span> &middot; Founded in Kerala, India
        </p>
        <p>&copy; {new Date().getFullYear()} SoulTracker. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default LoginPage;