import { IEnrollment } from '../models/Enrollment';
import { IBaseRepository } from './IBaseRepository';

/**
 * IEnrollmentRepository — Enrollment-specific data access contract
 */
export interface IEnrollmentRepository extends IBaseRepository<IEnrollment> {
  findByStudentAndCourse(studentId: string, courseId: string): Promise<IEnrollment | null>;
  findByStudent(studentId: string): Promise<IEnrollment[]>;
  findByCourse(courseId: string): Promise<IEnrollment[]>;
  isEnrolled(studentId: string, courseId: string): Promise<boolean>;
}
