
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { getCurrentUser, updateUserPoints } from '../services/mockApi';

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  loading: boolean;
  login: (user: User) => void;
  logout: () => void;
  addPoints: (points: number) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getCurrentUser();
    setUser(user);
    setLoading(false);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('loggedInUser');
    setUser(null);
  };

  const addPoints = async (points: number) => {
    if (user) {
        const updatedUser = await updateUserPoints(user.id, user.userPoints + points);
        setUser(updatedUser);
    }
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout, addPoints }}>
      {children}
    </AuthContext.Provider>
  );
};
