import { Enrollment, IEnrollment } from '../models/Enrollment';
import { Course } from '../models/Course';
import { eventBus, AppEvents } from '../utils/EventBus';
import { ApiError } from '../utils/ApiError';
import { Logger } from '../utils/Logger';

export class EnrollmentService {
  private readonly logger: Logger;

  constructor() {
    this.logger = Logger.createLogger('EnrollmentService');
  }

  async enroll(studentId: string, courseId: string): Promise<IEnrollment> {
    const course = await Course.findById(courseId);
    if (!course) {
      throw ApiError.notFound('Course not found');
    }

    const existing = await Enrollment.findOne({ student: studentId, course: courseId });
    if (existing) {
      throw ApiError.conflict('Already enrolled in this course');
    }

    const enrollment = new Enrollment({
      student: studentId,
      course: courseId,
    });

    await enrollment.save();
    await Course.findByIdAndUpdate(courseId, { $inc: { enrollmentCount: 1 } });

    this.logger.info(`Student ${studentId} enrolled in course ${courseId}`);
    
    await eventBus.publish(AppEvents.STUDENT_ENROLLED, {
      studentId,
      courseId,
      courseName: course.title,
    });

    return enrollment;
  }

  async unenroll(studentId: string, courseId: string): Promise<void> {
    const enrollment = await Enrollment.findOne({ student: studentId, course: courseId });
    if (!enrollment) {
      throw ApiError.notFound('Enrollment not found');
    }

    await Enrollment.findByIdAndDelete(enrollment._id).exec();
    await Course.findByIdAndUpdate(courseId, { $inc: { enrollmentCount: -1 } });
    
    this.logger.info(`Student ${studentId} unenrolled from course ${courseId}`);
  }

  async removeStudent(enrollmentId: string, teacherId: string, userRole: string): Promise<void> {
    const enrollment = await Enrollment.findById(enrollmentId);
    if (!enrollment) {
      throw ApiError.notFound('Enrollment not found');
    }

    const courseId = enrollment.course.toString();
    const course = await Course.findById(courseId);
    if (!course) {
      throw ApiError.notFound('Course not found');
    }

    const mainTeacherId = course.teacher._id?.toString() || course.teacher.toString();
    const isCollaborator = course.collaborators?.some(c => (c._id?.toString() || c.toString()) === teacherId);

    if (userRole !== 'admin' && mainTeacherId !== teacherId && !isCollaborator) {
      throw ApiError.forbidden('You can only remove students from courses you manage');
    }

    await Enrollment.findByIdAndDelete(enrollmentId).exec();
    await Course.findByIdAndUpdate(courseId, { $inc: { enrollmentCount: -1 } });
    
    this.logger.info(`Teacher ${teacherId} removed enrollment ${enrollmentId}`);
  }

  async getMyEnrollments(studentId: string): Promise<IEnrollment[]> {
    return Enrollment.find({ student: studentId })
      .populate({
        path: 'course',
        populate: { path: 'teacher', select: 'name email' },
      })
      .sort({ enrolledAt: -1 })
      .exec();
  }

  async getCourseEnrollments(courseId: string, teacherId: string, userRole: string): Promise<IEnrollment[]> {
    const course = await Course.findById(courseId);
    if (!course) {
      throw ApiError.notFound('Course not found');
    }

    const mainTeacherId = course.teacher._id?.toString() || course.teacher.toString();
    const isCollaborator = course.collaborators?.some(c => (c._id?.toString() || c.toString()) === teacherId);

    if (userRole !== 'admin' && mainTeacherId !== teacherId && !isCollaborator) {
      throw ApiError.forbidden('You can only view enrollments for courses you manage');
    }

    return Enrollment.find({ course: courseId })
      .populate('student', 'name email avatar')
      .sort({ enrolledAt: -1 })
      .exec();
  }

  async isEnrolled(studentId: string, courseId: string): Promise<boolean> {
    const enrollment = await Enrollment.findOne({ student: studentId, course: courseId });
    return enrollment !== null;
  }
}
