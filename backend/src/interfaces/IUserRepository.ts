import { IUser } from '../models/User';
import { IBaseRepository } from './IBaseRepository';

/**
 * IUserRepository — User-specific data access contract
 * 
 * Extends the generic repository with user-specific query methods.
 * Demonstrates Interface Segregation — only user-relevant operations.
 */
export interface IUserRepository extends IBaseRepository<IUser> {
  findByEmail(email: string): Promise<IUser | null>;
  findByEmailWithPassword(email: string): Promise<IUser | null>;
  findByRole(role: string): Promise<IUser[]>;
}
