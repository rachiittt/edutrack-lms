import { Router } from 'express';
import { EnrollmentController } from '../controllers/enrollmentController';
import { authenticate } from '../middleware/auth';
import { roleGuard } from '../middleware/roleGuard';
const router = Router();
router.post(
  '/courses/:id/enroll',
  authenticate,
  roleGuard('student'),
  EnrollmentController.enroll
);
router.delete(
  '/courses/:id/enroll',
  authenticate,
  roleGuard('student'),
  EnrollmentController.unenroll
);
router.delete(
  '/:enrollmentId',
  authenticate,
  roleGuard('teacher', 'admin'),
  EnrollmentController.removeStudent
);
router.get(
  '/courses/:id/enrollment-status',
  authenticate,
  EnrollmentController.checkEnrollment
);
router.get(
  '/my',
  authenticate,
  roleGuard('student'),
  EnrollmentController.getMyEnrollments
);
router.get(
  '/courses/:id/students',
  authenticate,
  roleGuard('teacher', 'admin'),
  EnrollmentController.getCourseEnrollments
);
router.get(
  '/courses/:id/students/:studentId/progress',
  authenticate,
  roleGuard('teacher', 'admin'),
  EnrollmentController.getStudentProgress
);
export default router;
