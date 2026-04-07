import api from './api';
import { ApiResponse, Material } from '../types';

export const materialService = {
  getByCourse: async (courseId: string) => {
    const response = await api.get<ApiResponse<{ materials: Material[] }>>(
      `/materials/courses/${courseId}/materials`
    );
    return response.data;
  },

  create: async (courseId: string, data: { title: string; type: string; content: string }) => {
    const response = await api.post<ApiResponse<{ material: Material }>>(
      `/materials/courses/${courseId}/materials`,
      data
    );
    return response.data;
  },

  delete: async (materialId: string) => {
    const response = await api.delete<ApiResponse<null>>(`/materials/${materialId}`);
    return response.data;
  },
};
