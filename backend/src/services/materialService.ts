import { IMaterial } from '../models/Material';
import { IMaterialRepository } from '../interfaces/IMaterialRepository';
import { ICourseRepository } from '../interfaces/ICourseRepository';
import { eventBus, AppEvents } from '../patterns/EventBus';
import { ApiError } from '../utils/ApiError';
import { Logger } from '../utils/Logger';
export class MaterialService {
  private readonly materialRepository: IMaterialRepository;
  private readonly courseRepository: ICourseRepository;
  private readonly logger: Logger;
  constructor(
    materialRepository: IMaterialRepository,
    courseRepository: ICourseRepository
  ) {
    this.materialRepository = materialRepository;
    this.courseRepository = courseRepository;
    this.logger = Logger.createLogger('MaterialService');
  }
  async create(
    courseId: string,
    teacherId: string,
    userRole: string,
    data: Partial<IMaterial>
  ): Promise<IMaterial> {
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw ApiError.notFound('Course not found');
    }
    if (
      userRole !== 'admin' &&
      course.teacher._id?.toString() !== teacherId &&
      course.teacher.toString() !== teacherId
    ) {
      throw ApiError.forbidden('You can only add materials to your own courses');
    }
    const lastOrder = await this.materialRepository.findLastOrder(courseId);
    const order = lastOrder + 1;
    const material = await this.materialRepository.create({
      ...data,
      course: courseId,
      order,
    } as unknown as Partial<IMaterial>);
    this.logger.info(`Material added to course ${courseId}: ${data.title}`);
    await eventBus.publish(AppEvents.MATERIAL_ADDED, {
      courseId,
      title: data.title,
    });
    return material;
  }
  async getByCourse(courseId: string): Promise<IMaterial[]> {
    return this.materialRepository.findByCourse(courseId);
  }
  async delete(materialId: string, teacherId: string, userRole: string): Promise<void> {
    const material = await this.materialRepository.findById(materialId);
    if (!material) {
      throw ApiError.notFound('Material not found');
    }
    const course = await this.courseRepository.findById(material.course.toString());
    if (
      !course ||
      (
        userRole !== 'admin' &&
        course.teacher._id?.toString() !== teacherId &&
        course.teacher.toString() !== teacherId
      )
    ) {
      throw ApiError.forbidden('You can only delete materials from your own courses');
    }
    await this.materialRepository.delete(materialId);
    this.logger.info(`Material deleted: ${materialId}`);
  }
}
