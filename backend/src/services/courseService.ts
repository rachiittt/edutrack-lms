import { Course, ICourse } from '../models/Course';
import { eventBus, AppEvents } from '../utils/EventBus';
import { ApiError } from '../utils/ApiError';
import { Logger } from '../utils/Logger';

export interface ICourseQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  teacher?: string;
}

export class CourseService {
  private readonly logger: Logger;

  constructor() {
    this.logger = Logger.createLogger('CourseService');
  }

  async getAll(query: ICourseQuery) {
    const { page = 1, limit = 12, search, category, teacher } = query;
    const filter: any = {};

    if (search) {
      filter.$text = { $search: search };
    }
    if (category) {
      filter.category = category;
    }
    if (teacher) {
      filter.teacher = teacher;
    }

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      Course.find(filter)
        .populate('teacher', 'name email avatar bio')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      Course.countDocuments(filter).exec(),
    ]);

    return {
      courses: data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id: string): Promise<ICourse> {
    const course = await Course.findById(id)
      .populate('teacher', 'name email avatar bio')
      .populate('collaborators', 'name email avatar')
      .exec();
    
    if (!course) {
      throw ApiError.notFound('Course not found');
    }
    return course;
  }

  async create(teacherId: string, data: Partial<ICourse>): Promise<ICourse> {
    const course = new Course({
      ...data,
      teacher: teacherId,
    });

    await course.save();
    this.logger.info(`Course created: ${course.title} by ${teacherId}`);
    
    await eventBus.publish(AppEvents.COURSE_CREATED, {
      courseId: course._id,
      teacherId,
      title: course.title,
    });

    return course;
  }

  async update(id: string, teacherId: string, userRole: string, data: Partial<ICourse>): Promise<ICourse> {
    const course = await this.getById(id);

    const mainTeacherId = course.teacher._id?.toString() || course.teacher.toString();
    const isCollaborator = course.collaborators?.some(c => (c._id?.toString() || c.toString()) === teacherId);

    if (userRole !== 'admin' && mainTeacherId !== teacherId && !isCollaborator) {
      throw ApiError.forbidden('You are not authorized to update this course');
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    ).populate('teacher', 'name email avatar').exec();

    if (!updatedCourse) {
      throw ApiError.notFound('Course not found');
    }

    return updatedCourse;
  }

  async delete(id: string, teacherId: string, userRole: string): Promise<void> {
    const course = await this.getById(id);
    
    const mainTeacherId = course.teacher._id?.toString() || course.teacher.toString();
    if (userRole !== 'admin' && mainTeacherId !== teacherId) {
      throw ApiError.forbidden('Only the primary teacher or an admin can delete this course');
    }

    await Course.findByIdAndDelete(id).exec();
    this.logger.info(`Course deleted: ${id}`);
    
    await eventBus.publish(AppEvents.COURSE_DELETED, { courseId: id });
  }

  async getCategories(): Promise<string[]> {
    return Course.distinct('category').exec();
  }

  async addCollaborator(courseId: string, teacherId: string, identifier: string): Promise<ICourse> {
    const course = await this.getById(courseId);
    
    const mainTeacherId = course.teacher._id?.toString() || course.teacher.toString();
    if (mainTeacherId !== teacherId) {
      throw ApiError.forbidden('Only the primary teacher can add collaborators');
    }

    const { User } = require('../models/User');
    const collaborator = await User.findOne({ 
      $or: [{ email: identifier }, { username: identifier }],
      role: 'teacher' 
    });
    
    if (!collaborator) {
      throw ApiError.notFound('Teacher not found with this email or username');
    }

    if (mainTeacherId === collaborator._id.toString()) {
      throw ApiError.badRequest('You are already the primary teacher of this course');
    }

    if (course.collaborators?.some(c => (c._id?.toString() || c.toString()) === collaborator._id.toString())) {
      throw ApiError.conflict('Teacher is already a collaborator');
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      { $addToSet: { collaborators: collaborator._id } },
      { new: true }
    ).populate('teacher', 'name email avatar')
     .populate('collaborators', 'name email avatar')
     .exec();

    return updatedCourse!;
  }

  async removeCollaborator(courseId: string, teacherId: string, collaboratorId: string): Promise<ICourse> {
    const course = await this.getById(courseId);
    
    const mainTeacherId = course.teacher._id?.toString() || course.teacher.toString();
    if (mainTeacherId !== teacherId) {
      throw ApiError.forbidden('Only the primary teacher can remove collaborators');
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      { $pull: { collaborators: collaboratorId } },
      { new: true }
    ).populate('teacher', 'name email avatar')
     .populate('collaborators', 'name email avatar')
     .exec();

    return updatedCourse!;
  }
}
