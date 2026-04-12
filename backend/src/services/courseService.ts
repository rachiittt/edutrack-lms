import { ICourse } from '../models/Course';
import { ICourseRepository, ICourseQuery } from '../interfaces/ICourseRepository';
import { ICourseService } from '../interfaces/ICourseService';
import { IPaginatedResult } from '../interfaces/IBaseRepository';
import { eventBus, AppEvents } from '../patterns/EventBus';
import { ApiError } from '../utils/ApiError';
import { Logger } from '../utils/Logger';
export class CourseService implements ICourseService {
  private readonly courseRepository: ICourseRepository;
  private readonly logger: Logger;
  constructor(courseRepository: ICourseRepository) {
    this.courseRepository = courseRepository;
    this.logger = Logger.createLogger('CourseService');
  }
  async create(data: Partial<ICourse>): Promise<ICourse> {
    const course = await this.courseRepository.create(data);
    const populated = await this.courseRepository.findById(course._id.toString());
    this.logger.info(`Course created: ${data.title}`);
    await eventBus.publish(AppEvents.COURSE_CREATED, {
      courseId: course._id,
      title: data.title,
      teacher: data.teacher,
    });
    return populated!;
  }
  async getAll(query: ICourseQuery): Promise<IPaginatedResult<ICourse>> {
    return this.courseRepository.findPaginated(query);
  }
  async getById(id: string): Promise<ICourse> {
    const course = await this.courseRepository.findById(id);
    if (!course) {
      throw ApiError.notFound('Course not found');
    }
    return course;
  }
  async update(
    id: string,
    teacherId: string,
    userRole: string,
    data: Partial<ICourse>
  ): Promise<ICourse> {
    const course = await this.courseRepository.findById(id);
    if (!course) {
      throw ApiError.notFound('Course not found');
    }
    if (
      userRole !== 'admin' &&
      course.teacher._id?.toString() !== teacherId &&
      course.teacher.toString() !== teacherId
    ) {
      throw ApiError.forbidden('You can only update your own courses');
    }
    const updated = await this.courseRepository.update(id, data);
    this.logger.info(`Course updated: ${id}`);
    return updated!;
  }
  async delete(id: string, teacherId: string, userRole: string): Promise<void> {
    const course = await this.courseRepository.findById(id);
    if (!course) {
      throw ApiError.notFound('Course not found');
    }
    if (
      userRole !== 'admin' &&
      course.teacher._id?.toString() !== teacherId &&
      course.teacher.toString() !== teacherId
    ) {
      throw ApiError.forbidden('You can only delete your own courses');
    }
    await this.courseRepository.delete(id);
    this.logger.info(`Course deleted: ${id}`);
    await eventBus.publish(AppEvents.COURSE_DELETED, { courseId: id });
  }
  async getCategories(): Promise<string[]> {
    return this.courseRepository.findDistinctCategories();
  }
}
