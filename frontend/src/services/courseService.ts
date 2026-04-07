import api from './api';
import { ApiResponse, CoursesResponse, Course } from '../types';

export const courseService = {
  getAll: async (params?: { page?: number; limit?: number; search?: string; category?: string }) => {
    const response = await api.get<ApiResponse<CoursesResponse>>('/courses', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<ApiResponse<{ course: Course }>>(`/courses/${id}`);
    return response.data;
  },

  create: async (data: { title: string; description: string; category: string; thumbnail?: string }) => {
    const response = await api.post<ApiResponse<{ course: Course }>>('/courses', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Course>) => {
    const response = await api.put<ApiResponse<{ course: Course }>>(`/courses/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete<ApiResponse<null>>(`/courses/${id}`);
    return response.data;
  },

  getCategories: async () => {
    const response = await api.get<ApiResponse<{ categories: string[] }>>('/courses/categories');
    return response.data;
  },
};
