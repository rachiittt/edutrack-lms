import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { container } from '../config/container';
import { ApiResponse } from '../utils/ApiResponse';
export class EnrollmentController {
  static async enroll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const enrollment = await container.enrollmentService.enroll(
        req.user!._id.toString(),
        req.params.id
      );
      ApiResponse.created(res, { enrollment }, 'Enrolled successfully');
    } catch (error) {
      next(error);
    }
  }
  static async getMyEnrollments(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const enrollments = await container.enrollmentService.getMyEnrollments(
        req.user!._id.toString()
      );
      ApiResponse.success(res, { enrollments });
    } catch (error) {
      next(error);
    }
  }
  static async getCourseEnrollments(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const enrollments = await container.enrollmentService.getCourseEnrollments(
        req.params.id,
        req.user!._id.toString(),
        req.user!.role
      );
      ApiResponse.success(res, { enrollments });
    } catch (error) {
      next(error);
    }
  }
  static async checkEnrollment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const isEnrolled = await container.enrollmentService.isEnrolled(
        req.user!._id.toString(),
        req.params.id
      );
      ApiResponse.success(res, { isEnrolled });
    } catch (error) {
      next(error);
    }
  }
}
