import api from './api';
import { ApiResponse, Quiz, QuizResult } from '../types';
export const quizService = {
  getByCourse: async (courseId: string) => {
    const response = await api.get<ApiResponse<{ quizzes: Quiz[] }>>(
      `/quizzes/courses/${courseId}/quizzes`
    );
    return response.data.data.quizzes;
  },
  create: async (
    courseId: string,
    data: { title: string; duration: number; questions: Quiz['questions'] }
  ) => {
    const response = await api.post<ApiResponse<{ quiz: Quiz }>>(
      `/quizzes/courses/${courseId}/quizzes`,
      data
    );
    return response.data.data.quiz;
  },
  getById: async (quizId: string) => {
    const response = await api.get<ApiResponse<{ quiz: Quiz }>>(`/quizzes/${quizId}`);
    return response.data.data.quiz;
  },
  attempt: async (quizId: string, answers: number[]) => {
    const response = await api.post<ApiResponse<{ result: QuizResult }>>(
      `/quizzes/${quizId}/attempt`,
      { answers }
    );
    return response.data.data.result;
  },
  getResults: async (quizId: string) => {
    const response = await api.get<ApiResponse<{ results: QuizResult[] }>>(
      `/quizzes/${quizId}/results`
    );
    return response.data.data.results;
  },
  getMyResults: async () => {
    const response = await api.get<ApiResponse<{ results: QuizResult[] }>>(
      '/quizzes/my/results'
    );
    return response.data.data.results;
  },
};
