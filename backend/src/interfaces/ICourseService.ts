import { ICourse } from '../models/Course';
import { IPaginatedResult } from './IBaseRepository';
import { ICourseQuery } from './ICourseRepository';

/**
 * ICourseService — Course business logic contract
 * 
 * Separates the business logic interface from the data access interface.
 * Controllers depend on this abstraction (DIP).
 */
export interface ICourseService {
  create(data: Partial<ICourse>): Promise<ICourse>;
  getAll(query: ICourseQuery): Promise<IPaginatedResult<ICourse>>;
  getById(id: string): Promise<ICourse>;
  update(id: string, teacherId: string, data: Partial<ICourse>): Promise<ICourse>;
  delete(id: string, teacherId: string): Promise<void>;
  getCategories(): Promise<string[]>;
}
