import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const MainLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-calm-blue-100 dark:bg-gray-900">
      <Sidebar />
      <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="animate-fade-in flex-grow">
          <Outlet />
        </div>
        <footer className="text-center text-xs text-gray-500 dark:text-gray-400 mt-8 py-2">
          <p className="mb-1">
            <span className="font-semibold">About</span> &middot; Founded in Kerala, India
          </p>
          <p>&copy; {new Date().getFullYear()} SoulTracker. All Rights Reserved.</p>
        </footer>
      </main>
    </div>
  );
};

export default MainLayout;