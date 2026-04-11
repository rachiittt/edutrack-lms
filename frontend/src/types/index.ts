export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}
export interface Course {
  _id: string;
  title: string;
  description: string;
  category: string;
  thumbnail: string;
  teacher: User;
  enrollmentCount: number;
  createdAt: string;
  updatedAt: string;
}
export interface Enrollment {
  _id: string;
  student: User;
  course: Course;
  enrolledAt: string;
  progress: number;
}
export interface Material {
  _id: string;
  course: string;
  title: string;
  type: 'pdf' | 'link' | 'text';
  content: string;
  order: number;
  createdAt: string;
}
export interface Question {
  questionText: string;
  options: string[];
  correctAnswer: number;
}
export interface Quiz {
  _id: string;
  course: string;
  title: string;
  questions: Question[];
  duration: number;
  createdAt: string;
}
export interface QuizResult {
  _id: string;
  student: User | string;
  quiz: Quiz | string;
  course: Course | string;
  answers: number[];
  score: number;
  totalQuestions: number;
  submittedAt: string;
}
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: PaginationInfo;
}
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}
export interface CoursesResponse {
  courses: Course[];
  pagination: PaginationInfo;
}
export interface AuthResponse {
  user: User;
  token: string;
}
export interface StudentEnrollment {
  _id: string;
  student: User;
  course: string | Course;
  enrolledAt: string;
  progress: number;
}
