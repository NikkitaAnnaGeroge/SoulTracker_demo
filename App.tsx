import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/utility/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import DashboardPage from './pages/DashboardPage';
import ChatPage from './pages/ChatPage';
import ProgressPage from './pages/ProgressPage';
import LeaderboardPage from './pages/LeaderboardPage';
import LandingPage from './pages/LandingPage';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <HashRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/" element={<LandingPage />} />
            
            <Route 
              path="/app"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="chat" element={<ChatPage />} />
              <Route path="progress" element={<ProgressPage />} />
              <Route path="leaderboard" element={<LeaderboardPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </HashRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;