import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { container } from '../config/container';
import { ApiResponse } from '../utils/ApiResponse';

export class CourseController {
  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const course = await container.courseService.create(
        req.user!._id.toString(),
        req.body
      );
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
      ApiResponse.success(res, { courses: result.courses, pagination: result.pagination });
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
        req.user!.role,
        req.body
      );
      ApiResponse.success(res, { course }, 'Course updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await container.courseService.delete(
        req.params.id,
        req.user!._id.toString(),
        req.user!.role
      );
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

  static async addCollaborator(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { identifier } = req.body;
      const course = await container.courseService.addCollaborator(
        req.params.id,
        req.user!._id.toString(),
        identifier
      );
      ApiResponse.success(res, { course }, 'Collaboration request sent successfully');
    } catch (error) {
      next(error);
    }
  }

  static async removeCollaborator(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { collaboratorId } = req.body;
      const course = await container.courseService.removeCollaborator(
        req.params.id,
        req.user!._id.toString(),
        collaboratorId
      );
      ApiResponse.success(res, { course }, 'Collaborator removed successfully');
    } catch (error) {
      next(error);
    }
  }

  static async acceptCollaboration(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const course = await container.courseService.acceptCollaboration(
        req.params.id,
        req.user!._id.toString()
      );
      ApiResponse.success(res, { course }, 'Collaboration request accepted');
    } catch (error) {
      next(error);
    }
  }

  static async rejectCollaboration(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const course = await container.courseService.rejectCollaboration(
        req.params.id,
        req.user!._id.toString()
      );
      ApiResponse.success(res, { course }, 'Collaboration request rejected');
    } catch (error) {
      next(error);
    }
  }
}
