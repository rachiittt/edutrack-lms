import { IQuiz } from '../models/Quiz';
import { IResult } from '../models/Result';

/**
 * IQuizService — Quiz business logic contract
 */
export interface IQuizService {
  create(courseId: string, teacherId: string, data: Partial<IQuiz>): Promise<IQuiz>;
  getByCourse(courseId: string): Promise<IQuiz[]>;
  getById(quizId: string): Promise<IQuiz>;
  attempt(quizId: string, studentId: string, answers: number[]): Promise<IResult>;
  getResults(quizId: string, userId: string, userRole: string): Promise<IResult[]>;
  getStudentResults(studentId: string): Promise<IResult[]>;
}

/**
 * IQuizEvaluationStrategy — Strategy Pattern interface
 * 
 * Allows pluggable quiz scoring algorithms without modifying the QuizService.
 * Demonstrates Open/Closed Principle (OCP) — extend scoring by adding
 * new strategy classes, not modifying existing code.
 */
export interface IQuizEvaluationStrategy {
  evaluate(
    answers: number[],
    correctAnswers: number[]
  ): { score: number; totalQuestions: number; percentage: number };

  getStrategyName(): string;
}
