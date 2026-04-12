import { IEnrollment } from '../models/Enrollment';
export interface IEnrollmentService {
  enroll(studentId: string, courseId: string): Promise<IEnrollment>;
  getMyEnrollments(studentId: string): Promise<IEnrollment[]>;
  getCourseEnrollments(courseId: string, teacherId: string, userRole: string): Promise<IEnrollment[]>;
  isEnrolled(studentId: string, courseId: string): Promise<boolean>;
}
