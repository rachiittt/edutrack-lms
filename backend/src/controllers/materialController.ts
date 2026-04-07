import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { container } from '../config/container';
import { ApiResponse } from '../utils/ApiResponse';

/**
 * MaterialController — HTTP Layer for Materials
 * SRP: Only handles HTTP request/response. Business logic in MaterialService.
 */
export class MaterialController {
  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const material = await container.materialService.create(
        req.params.id,
        req.user!._id.toString(),
        req.body
      );
      ApiResponse.created(res, { material }, 'Material added successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getByCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const materials = await container.materialService.getByCourse(req.params.id);
      ApiResponse.success(res, { materials });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await container.materialService.delete(req.params.id, req.user!._id.toString());
      ApiResponse.success(res, null, 'Material deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}
