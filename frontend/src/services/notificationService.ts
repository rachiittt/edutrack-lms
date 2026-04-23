import api from './api';
import { ApiResponse } from '../types';

export interface Notification {
  _id: string;
  recipient: string;
  type: 'new_material' | 'new_quiz' | 'enrollment' | 'general';
  title: string;
  message: string;
  courseId?: string;
  read: boolean;
  createdAt: string;
}

interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}

export const notificationService = {
  getNotifications: async () => {
    const response = await api.get<ApiResponse<NotificationsResponse>>('/notifications');
    return response.data.data;
  },
  markAsRead: async (id: string) => {
    await api.put(`/notifications/${id}/read`);
  },
  markAllAsRead: async () => {
    await api.put('/notifications/read-all');
  },
};
