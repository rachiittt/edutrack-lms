import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';
import api from '../services/api';
import { Enrollment } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
  enrollments: Enrollment[];
  refreshEnrollments: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);

  useEffect(() => {
    const storedToken = localStorage.getItem('edutrack_token');
    const storedUser = localStorage.getItem('edutrack_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (user && user.role === 'student') {
      refreshEnrollments();
    }
  }, [user]);

  const refreshEnrollments = async () => {
    try {
      const response = await api.get('/enrollments/my');
      setEnrollments(response.data.data.enrollments);
    } catch {
      // silently fail
    }
  };

  const login = async (email: string, password: string) => {
    const response = await authService.login(email, password);
    const { user: userData, token: authToken } = response.data;
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('edutrack_token', authToken);
    localStorage.setItem('edutrack_user', JSON.stringify(userData));
  };

  const register = async (name: string, email: string, password: string, role: string) => {
    const response = await authService.register(name, email, password, role);
    const { user: userData, token: authToken } = response.data;
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('edutrack_token', authToken);
    localStorage.setItem('edutrack_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setEnrollments([]);
    localStorage.removeItem('edutrack_token');
    localStorage.removeItem('edutrack_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        register,
        logout,
        enrollments,
        refreshEnrollments,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
