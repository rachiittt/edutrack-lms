import { IQuiz } from '../models/Quiz';
import { IResult } from '../models/Result';
export interface IQuizService {
  create(courseId: string, teacherId: string, userRole: string, data: Partial<IQuiz>): Promise<IQuiz>;
  getByCourse(courseId: string): Promise<IQuiz[]>;
  getById(quizId: string): Promise<IQuiz>;
  attempt(quizId: string, studentId: string, answers: number[]): Promise<IResult>;
  getResults(quizId: string, userId: string, userRole: string): Promise<IResult[]>;
  getStudentResults(studentId: string): Promise<IResult[]>;
}
export interface IQuizEvaluationStrategy {
  evaluate(
    answers: number[],
    correctAnswers: number[]
  ): { score: number; totalQuestions: number; percentage: number };
  getStrategyName(): string;
}
