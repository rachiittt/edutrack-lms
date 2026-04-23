import api from './api';
import { ApiResponse, CoursesResponse, Course } from '../types';
export const courseService = {
  getAll: async (params?: { page?: number; limit?: number; search?: string; category?: string; teacher?: string }) => {
    const response = await api.get<ApiResponse<CoursesResponse>>('/courses', { params });
    return response.data.data;
  },
  getById: async (id: string) => {
    const response = await api.get<ApiResponse<{ course: Course }>>(`/courses/${id}`);
    return response.data.data.course;
  },
  create: async (data: { title: string; description: string; category: string; thumbnail?: string }) => {
    const response = await api.post<ApiResponse<{ course: Course }>>('/courses', data);
    return response.data.data.course;
  },
  update: async (id: string, data: Partial<Course>) => {
    const response = await api.put<ApiResponse<{ course: Course }>>(`/courses/${id}`, data);
    return response.data.data.course;
  },
  delete: async (id: string) => {
    await api.delete<ApiResponse<null>>(`/courses/${id}`);
  },
  getCategories: async () => {
    const response = await api.get<ApiResponse<{ categories: string[] }>>('/courses/categories');
    return response.data.data.categories;
  },
  addCollaborator: async (courseId: string, identifier: string) => {
    const response = await api.post<ApiResponse<{ course: Course }>>(`/courses/${courseId}/collaborators`, { identifier });
    return response.data.data.course;
  },
  removeCollaborator: async (courseId: string, collaboratorId: string) => {
    const response = await api.delete<ApiResponse<{ course: Course }>>(`/courses/${courseId}/collaborators`, { data: { collaboratorId } });
    return response.data.data.course;
  },
};
