import { IEnrollment } from '../models/Enrollment';
import { IEnrollmentRepository } from '../interfaces/IEnrollmentRepository';
import { ICourseRepository } from '../interfaces/ICourseRepository';
import { IEnrollmentService } from '../interfaces/IEnrollmentService';
import { eventBus, AppEvents } from '../patterns/EventBus';
import { ApiError } from '../utils/ApiError';
import { Logger } from '../utils/Logger';
export class EnrollmentService implements IEnrollmentService {
  private readonly enrollmentRepository: IEnrollmentRepository;
  private readonly courseRepository: ICourseRepository;
  private readonly logger: Logger;
  constructor(
    enrollmentRepository: IEnrollmentRepository,
    courseRepository: ICourseRepository
  ) {
    this.enrollmentRepository = enrollmentRepository;
    this.courseRepository = courseRepository;
    this.logger = Logger.createLogger('EnrollmentService');
  }
  async enroll(studentId: string, courseId: string): Promise<IEnrollment> {
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw ApiError.notFound('Course not found');
    }
    const existing = await this.enrollmentRepository.findByStudentAndCourse(
      studentId,
      courseId
    );
    if (existing) {
      throw ApiError.conflict('Already enrolled in this course');
    }
    const enrollment = await this.enrollmentRepository.create({
      student: studentId,
      course: courseId,
    } as unknown as Partial<IEnrollment>);
    await this.courseRepository.incrementEnrollmentCount(courseId);
    this.logger.info(`Student ${studentId} enrolled in course ${courseId}`);
    await eventBus.publish(AppEvents.STUDENT_ENROLLED, {
      studentId,
      courseId,
      courseName: course.title,
    });
    return enrollment;
  }
  async getMyEnrollments(studentId: string): Promise<IEnrollment[]> {
    return this.enrollmentRepository.findByStudent(studentId);
  }
  async getCourseEnrollments(
    courseId: string,
    teacherId: string,
    userRole: string
  ): Promise<IEnrollment[]> {
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw ApiError.notFound('Course not found');
    }
    if (
      userRole !== 'admin' &&
      course.teacher._id?.toString() !== teacherId &&
      course.teacher.toString() !== teacherId
    ) {
      throw ApiError.forbidden('You can only view enrollments for your own courses');
    }
    return this.enrollmentRepository.findByCourse(courseId);
  }
  async isEnrolled(studentId: string, courseId: string): Promise<boolean> {
    return this.enrollmentRepository.isEnrolled(studentId, courseId);
  }
}
