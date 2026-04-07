import { IUser } from '../models/User';

/**
 * IAuthService — Authentication service contract
 * 
 * Defines the contract for authentication operations.
 * Follows ISP — only auth-related operations, no user CRUD.
 */
export interface IAuthService {
  register(
    name: string,
    email: string,
    password: string,
    role: 'student' | 'teacher'
  ): Promise<{ user: IUser; token: string }>;

  login(
    email: string,
    password: string
  ): Promise<{ user: IUser; token: string }>;

  getProfile(userId: string): Promise<IUser>;
  generateToken(userId: string): string;
}
