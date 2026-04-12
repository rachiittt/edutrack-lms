import api from './api';
import { ApiResponse, AuthResponse } from '../types';
export const authService = {
  register: async (name: string, email: string, password: string, role: string) => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', {
      name,
      email,
      password,
      role,
    });
    return response.data.data;
  },
  login: async (email: string, password: string) => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', {
      email,
      password,
    });
    return response.data.data;
  },
  getProfile: async () => {
    const response = await api.get<ApiResponse<{ user: AuthResponse['user'] }>>('/auth/me');
    return response.data.data.user;
  },
};
