import { IMaterial } from '../models/Material';
import { IBaseRepository } from './IBaseRepository';

/**
 * IMaterialRepository — Material-specific data access contract
 */
export interface IMaterialRepository extends IBaseRepository<IMaterial> {
  findByCourse(courseId: string): Promise<IMaterial[]>;
  findLastOrder(courseId: string): Promise<number>;
}
