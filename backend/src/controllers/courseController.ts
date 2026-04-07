import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { container } from '../config/container';
import { ApiResponse } from '../utils/ApiResponse';

/**
 * CourseController — HTTP Layer for Courses
 * SRP: Only handles HTTP request/response. Business logic in CourseService.
 */
export class CourseController {
  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const course = await container.courseService.create({
        ...req.body,
        teacher: req.user!._id,
      });
      ApiResponse.created(res, { course }, 'Course created successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, search, category, teacher } = req.query;
      const result = await container.courseService.getAll({
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        search: search as string,
        category: category as string,
        teacher: teacher as string,
      });
      ApiResponse.paginated(res, result.data, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const course = await container.courseService.getById(req.params.id);
      ApiResponse.success(res, { course });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const course = await container.courseService.update(
        req.params.id,
        req.user!._id.toString(),
        req.body
      );
      ApiResponse.success(res, { course }, 'Course updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await container.courseService.delete(req.params.id, req.user!._id.toString());
      ApiResponse.success(res, null, 'Course deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getCategories(_req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await container.courseService.getCategories();
      ApiResponse.success(res, { categories });
    } catch (error) {
      next(error);
    }
  }
}
