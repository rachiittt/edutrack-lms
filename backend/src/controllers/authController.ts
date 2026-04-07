import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { container } from '../config/container';
import { ApiResponse } from '../utils/ApiResponse';

/**
 * AuthController — HTTP Layer for Authentication
 * 
 * SRP: Only handles HTTP request/response concerns.
 * All business logic is delegated to AuthService.
 * Uses ApiResponse for standardized response formatting.
 */
export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password, role } = req.body;
      const result = await container.authService.register(name, email, password, role);
      ApiResponse.created(res, result, 'Registration successful');
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await container.authService.login(email, password);
      ApiResponse.success(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  static async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await container.authService.getProfile(req.user!._id.toString());
      ApiResponse.success(res, { user });
    } catch (error) {
      next(error);
    }
  }
}
