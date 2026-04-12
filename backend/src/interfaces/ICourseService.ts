import { ICourse } from '../models/Course';
import { IPaginatedResult } from './IBaseRepository';
import { ICourseQuery } from './ICourseRepository';
export interface ICourseService {
  create(data: Partial<ICourse>): Promise<ICourse>;
  getAll(query: ICourseQuery): Promise<IPaginatedResult<ICourse>>;
  getById(id: string): Promise<ICourse>;
  update(id: string, teacherId: string, userRole: string, data: Partial<ICourse>): Promise<ICourse>;
  delete(id: string, teacherId: string, userRole: string): Promise<void>;
  getCategories(): Promise<string[]>;
}
