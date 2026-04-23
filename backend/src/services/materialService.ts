import { Material, IMaterial } from '../models/Material';
import { Course } from '../models/Course';
import { eventBus, AppEvents } from '../utils/EventBus';
import { ApiError } from '../utils/ApiError';
import { Logger } from '../utils/Logger';

export class MaterialService {
  private readonly logger: Logger;

  constructor() {
    this.logger = Logger.createLogger('MaterialService');
  }

  async getByCourse(courseId: string): Promise<IMaterial[]> {
    return Material.find({ course: courseId }).sort({ createdAt: 1 }).exec();
  }

  async create(courseId: string, teacherId: string, userRole: string, data: Partial<IMaterial>): Promise<IMaterial> {
    const course = await Course.findById(courseId);
    if (!course) {
      throw ApiError.notFound('Course not found');
    }

    const mainTeacherId = course.teacher._id?.toString() || course.teacher.toString();
    const isCollaborator = course.collaborators?.some(c => (c._id?.toString() || c.toString()) === teacherId);

    if (userRole !== 'admin' && mainTeacherId !== teacherId && !isCollaborator) {
      throw ApiError.forbidden('You are not authorized to add materials to this course');
    }

    const material = new Material({
      ...data,
      course: courseId,
    });

    await material.save();
    this.logger.info(`Material created: ${data.title} for course ${courseId}`);
    
    await eventBus.publish(AppEvents.MATERIAL_ADDED, {
      materialId: material._id,
      courseId,
      materialTitle: data.title,
      courseName: course.title,
    });

    return material;
  }

  async delete(id: string, teacherId: string, userRole: string): Promise<void> {
    const material = await Material.findById(id);
    if (!material) {
      throw ApiError.notFound('Material not found');
    }

    const course = await Course.findById(material.course.toString());
    if (!course) {
      throw ApiError.notFound('Course not found');
    }

    const mainTeacherId = course.teacher._id?.toString() || course.teacher.toString();
    const isCollaborator = course.collaborators?.some(c => (c._id?.toString() || c.toString()) === teacherId);

    if (userRole !== 'admin' && mainTeacherId !== teacherId && !isCollaborator) {
      throw ApiError.forbidden('You are not authorized to delete materials from this course');
    }

    await Material.findByIdAndDelete(id).exec();
    this.logger.info(`Material deleted: ${id}`);
  }
}
