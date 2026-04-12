import api from './api';
import { ApiResponse, Material } from '../types';
export const materialService = {
  getByCourse: async (courseId: string) => {
    const response = await api.get<ApiResponse<{ materials: Material[] }>>(
      `/materials/courses/${courseId}/materials`
    );
    return response.data.data.materials;
  },
  create: async (
    courseId: string,
    data: { title: string; type: Material['type']; content: string }
  ) => {
    const response = await api.post<ApiResponse<{ material: Material }>>(
      `/materials/courses/${courseId}/materials`,
      data
    );
    return response.data.data.material;
  },
  delete: async (materialId: string) => {
    await api.delete<ApiResponse<null>>(`/materials/${materialId}`);
  },
};
