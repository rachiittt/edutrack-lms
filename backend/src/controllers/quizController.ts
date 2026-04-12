import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { container } from '../config/container';
import { ApiResponse } from '../utils/ApiResponse';
export class QuizController {
  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const quiz = await container.quizService.create(
        req.params.id,
        req.user!._id.toString(),
        req.user!.role,
        req.body
      );
      ApiResponse.created(res, { quiz }, 'Quiz created successfully');
    } catch (error) {
      next(error);
    }
  }
  static async getByCourse(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const quizzes = await container.quizService.getByCourse(req.params.id);
      ApiResponse.success(res, { quizzes });
    } catch (error) {
      next(error);
    }
  }
  static async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const quiz = await container.quizService.getById(req.params.id);
      ApiResponse.success(res, { quiz });
    } catch (error) {
      next(error);
    }
  }
  static async attempt(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await container.quizService.attempt(
        req.params.id,
        req.user!._id.toString(),
        req.body.answers
      );
      ApiResponse.created(res, { result }, 'Quiz submitted successfully');
    } catch (error) {
      next(error);
    }
  }
  static async getResults(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const results = await container.quizService.getResults(
        req.params.id,
        req.user!._id.toString(),
        req.user!.role
      );
      ApiResponse.success(res, { results });
    } catch (error) {
      next(error);
    }
  }
  static async getMyResults(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const results = await container.quizService.getStudentResults(
        req.user!._id.toString()
      );
      ApiResponse.success(res, { results });
    } catch (error) {
      next(error);
    }
  }
}
