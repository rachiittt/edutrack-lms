import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { container } from '../config/container';
import { ApiResponse } from '../utils/ApiResponse';
import { Result } from '../models/Result';
import { Quiz } from '../models/Quiz';
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
  static async unenroll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await container.enrollmentService.unenroll(
        req.user!._id.toString(),
        req.params.id
      );
      ApiResponse.success(res, null, 'Unenrolled successfully');
    } catch (error) {
      next(error);
    }
  }
  static async removeStudent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await container.enrollmentService.removeStudent(
        req.params.enrollmentId,
        req.user!._id.toString(),
        req.user!.role
      );
      ApiResponse.success(res, null, 'Student removed successfully');
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
  /** GET /api/enrollments/courses/:id/students/:studentId/progress */
  static async getStudentProgress(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id: courseId, studentId } = req.params;
      // Get all quizzes for this course
      const quizzes = await Quiz.find({ course: courseId }).select('title questions').exec();
      // Get all results for this student in this course
      const results = await Result.find({ student: studentId, course: courseId })
        .populate('quiz', 'title')
        .exec();
      const progress = quizzes.map((quiz) => {
        const result = results.find(
          (r) => r.quiz?._id?.toString() === quiz._id.toString()
        );
        return {
          quizId: quiz._id,
          quizTitle: quiz.title,
          totalQuestions: quiz.questions.length,
          score: result ? result.score : null,
          percentage: result
            ? Math.round((result.score / result.totalQuestions) * 100)
            : null,
          attempted: !!result,
          submittedAt: result?.submittedAt || null,
        };
      });
      const attempted = progress.filter((p) => p.attempted).length;
      const avgScore =
        attempted > 0
          ? Math.round(
              progress
                .filter((p) => p.attempted)
                .reduce((sum, p) => sum + (p.percentage || 0), 0) / attempted
            )
          : 0;
      ApiResponse.success(res, {
        progress,
        summary: {
          totalQuizzes: quizzes.length,
          attempted,
          averageScore: avgScore,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
