import api from './api';
import { ApiResponse, User } from '../types';

export const userService = {
  getProfile: async (userId: string) => {
    const response = await api.get<ApiResponse<{ user: User }>>(`/users/${userId}`);
    return response.data.data.user;
  },
  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await api.put<ApiResponse<{ user: User }>>('/users/profile', data);
    return response.data.data.user;
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<void> => {
    await api.put('/users/change-password', data);
  },

  uploadAvatar: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await api.post<ApiResponse<{ url: string }>>('/upload/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data.url;
  },
  uploadThumbnail: async (file: File) => {
    const formData = new FormData();
    formData.append('thumbnail', file);
    const response = await api.post<ApiResponse<{ url: string }>>('/upload/thumbnail', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data.url;
  },
};
