import React from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse, MessageSquare, BarChart2, Trophy, Users, Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

const FeatureCard: React.FC<{ icon: React.ElementType, title: string, children: React.ReactNode }> = ({ icon: Icon, title, children }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300">
        <div className="flex items-center justify-center w-12 h-12 bg-warm-purple-100 text-warm-purple-600 rounded-full mb-4">
            <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">{title}</h3>
        <p className="text-gray-600 dark:text-gray-300">{children}</p>
    </div>
);

const FounderCard: React.FC<{ name: string, role: string }> = ({ name, role }) => (
    <div className="text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-calm-blue-200 to-warm-purple-200 rounded-full mx-auto mb-2 flex items-center justify-center">
            <Users className="w-12 h-12 text-white" />
        </div>
        <h4 className="font-bold text-gray-800 dark:text-gray-100">{name}</h4>
        <p className="text-sm text-warm-purple-800 dark:text-warm-purple-300">{role}</p>
    </div>
);

const LandingPage: React.FC = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="bg-calm-blue-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300">
            {/* Header */}
            <header className="container mx-auto px-6 py-4 flex justify-between items-center">
                <div className="flex items-center">
                    <HeartPulse className="h-8 w-8 text-warm-purple-500" />
                    <h1 className="text-2xl font-bold ml-2 text-warm-purple-800 dark:text-warm-purple-300">SoulTracker</h1>
                </div>
                <nav className="flex items-center space-x-2">
                    <Link to="/login" className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-warm-purple-600 dark:hover:text-warm-purple-400">Login</Link>
                    <Link to="/signup" className="px-4 py-2 text-sm font-semibold text-white bg-warm-purple-600 rounded-full hover:bg-warm-purple-700 transition-colors">Sign Up</Link>
                     <button 
                        onClick={toggleTheme}
                        className="p-2 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        aria-label="Toggle theme"
                        title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                    >
                        {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                    </button>
                </nav>
            </header>

            {/* Hero Section */}
            <main className="container mx-auto px-6 py-20 text-center animate-fade-in-slow">
                <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight">
                    Your Personal Guide to <span className="text-warm-purple-600 dark:text-warm-purple-400">Emotional Wellness</span>
                </h2>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-300">
                    Chat with Soul, track your moods, and build positive habits through a gamified experience designed to brighten your day.
                </p>
                <Link to="/signup" className="mt-8 inline-block px-8 py-4 text-lg font-bold text-white bg-warm-purple-600 rounded-full hover:bg-warm-purple-700 transition-transform transform hover:scale-105">
                    Get Started for Free
                </Link>
            </main>

            {/* Features Section */}
            <section id="features" className="py-20 bg-white dark:bg-gray-800">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-12 animate-slide-in-up-slow">
                        <h3 className="text-3xl font-bold text-gray-800 dark:text-white">Everything You Need to Flourish</h3>
                        <p className="text-gray-600 dark:text-gray-300 mt-2">Discover features that make emotional wellness engaging and accessible.</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <FeatureCard icon={MessageSquare} title="AI-Powered Chat">
                            Talk with Soul, your supportive AI companion, available 24/7 to listen and help you reflect.
                        </FeatureCard>
                        <FeatureCard icon={Trophy} title="Gamified Journey">
                            Earn points, maintain streaks, and level up as you make progress on your wellness journey.
                        </FeatureCard>
                        <FeatureCard icon={BarChart2} title="Track Your Moods">
                            Visualize your emotional trends over time to gain valuable insights into your mental well-being.
                        </FeatureCard>
                        <FeatureCard icon={Users} title="Community Leaderboard">
                            Get motivated by seeing how you rank among other users on their own paths to wellness.
                        </FeatureCard>
                    </div>
                </div>
            </section>
            
            {/* Founders Section */}
            <section id="founders" className="py-20 bg-calm-blue-100 dark:bg-gray-900">
                 <div className="container mx-auto px-6 text-center">
                    <h3 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">Meet the Founders</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                        <FounderCard name="Joshwin" role="Founder" />
                        <FounderCard name="Nikkita" role="Co-Founder" />
                        <FounderCard name="Adithya" role="Co-Founder" />
                        <FounderCard name="Noel" role="Co-Founder" />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white dark:bg-gray-800">
                <div className="container mx-auto px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    <p className="mb-1">
                      <span className="font-semibold">About</span> &middot; Founded in Kerala, India
                    </p>
                    <p>&copy; {new Date().getFullYear()} SoulTracker. All Rights Reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;