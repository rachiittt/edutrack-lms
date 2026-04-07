import { ICourse } from '../models/Course';
import { IBaseRepository, IPaginatedResult } from './IBaseRepository';

/**
 * ICourseRepository — Course-specific data access contract
 */
export interface ICourseQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  teacher?: string;
}

export interface ICourseRepository extends IBaseRepository<ICourse> {
  findPaginated(query: ICourseQuery): Promise<IPaginatedResult<ICourse>>;
  findDistinctCategories(): Promise<string[]>;
  incrementEnrollmentCount(courseId: string): Promise<void>;
}
