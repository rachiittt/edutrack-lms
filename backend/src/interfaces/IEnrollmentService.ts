import { IEnrollment } from '../models/Enrollment';

/**
 * IEnrollmentService — Enrollment business logic contract
 */
export interface IEnrollmentService {
  enroll(studentId: string, courseId: string): Promise<IEnrollment>;
  getMyEnrollments(studentId: string): Promise<IEnrollment[]>;
  getCourseEnrollments(courseId: string, teacherId: string): Promise<IEnrollment[]>;
  isEnrolled(studentId: string, courseId: string): Promise<boolean>;
}
