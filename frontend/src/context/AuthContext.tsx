/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
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

const getStoredSession = () => {
  if (typeof window === 'undefined') {
    return { user: null as User | null, token: null as string | null };
  }

  const storedToken = localStorage.getItem('edutrack_token');
  const storedUser = localStorage.getItem('edutrack_user');

  if (!storedToken || !storedUser || storedUser === 'undefined') {
    return { user: null as User | null, token: null as string | null };
  }

  try {
    return {
      token: storedToken,
      user: JSON.parse(storedUser) as User,
    };
  } catch {
    localStorage.removeItem('edutrack_token');
    localStorage.removeItem('edutrack_user');
    return { user: null as User | null, token: null as string | null };
  }
};

const fetchStudentEnrollments = async () => {
  const response = await api.get('/enrollments/my');
  return response.data.data.enrollments as Enrollment[];
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const storedSession = getStoredSession();
  const [user, setUser] = useState<User | null>(storedSession.user);
  const [token, setToken] = useState<string | null>(storedSession.token);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const refreshEnrollments = useCallback(async () => {
    if (!user || user.role !== 'student') {
      return;
    }
    try {
      const nextEnrollments = await fetchStudentEnrollments();
      setEnrollments(nextEnrollments);
    } catch (error) {
      console.error('Failed to refresh enrollments:', error);
    }
  }, [user]);

  useEffect(() => {
    if (user?.role !== 'student') {
      return;
    }

    let isActive = true;

    const loadEnrollments = async () => {
      try {
        const nextEnrollments = await fetchStudentEnrollments();
        if (isActive) {
          setEnrollments(nextEnrollments);
        }
      } catch (error) {
        console.error('Failed to refresh enrollments:', error);
      }
    };

    void loadEnrollments();

    return () => {
      isActive = false;
    };
  }, [user]);

  const login = async (email: string, password: string) => {
    const { user: userData, token: authToken } = await authService.login(email, password);
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('edutrack_token', authToken);
    localStorage.setItem('edutrack_user', JSON.stringify(userData));

    if (userData.role === 'student') {
      try {
        const nextEnrollments = await fetchStudentEnrollments();
        setEnrollments(nextEnrollments);
      } catch (error) {
        console.error('Failed to refresh enrollments after login:', error);
      }
    } else {
      setEnrollments([]);
    }
  };
  const register = async (name: string, email: string, password: string, role: string) => {
    const { user: userData, token: authToken } = await authService.register(name, email, password, role);
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('edutrack_token', authToken);
    localStorage.setItem('edutrack_user', JSON.stringify(userData));

    if (userData.role === 'student') {
      try {
        const nextEnrollments = await fetchStudentEnrollments();
        setEnrollments(nextEnrollments);
      } catch (error) {
        console.error('Failed to refresh enrollments after registration:', error);
      }
    } else {
      setEnrollments([]);
    }
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
        isLoading: false,
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
