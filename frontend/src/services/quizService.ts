import api from './api';
import { ApiResponse, Quiz, QuizResult } from '../types';

export const quizService = {
  getByCourse: async (courseId: string) => {
    const response = await api.get<ApiResponse<{ quizzes: Quiz[] }>>(
      `/quizzes/courses/${courseId}/quizzes`
    );
    return response.data;
  },

  getById: async (quizId: string) => {
    const response = await api.get<ApiResponse<{ quiz: Quiz }>>(`/quizzes/${quizId}`);
    return response.data;
  },

  attempt: async (quizId: string, answers: number[]) => {
    const response = await api.post<ApiResponse<{ result: QuizResult }>>(
      `/quizzes/${quizId}/attempt`,
      { answers }
    );
    return response.data;
  },

  getResults: async (quizId: string) => {
    const response = await api.get<ApiResponse<{ results: QuizResult[] }>>(
      `/quizzes/${quizId}/results`
    );
    return response.data;
  },

  getMyResults: async () => {
    const response = await api.get<ApiResponse<{ results: QuizResult[] }>>(
      '/quizzes/my/results'
    );
    return response.data;
  },
};
