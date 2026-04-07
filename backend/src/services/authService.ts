import jwt from 'jsonwebtoken';
import { IUser } from '../models/User';
import { IUserRepository } from '../interfaces/IUserRepository';
import { IAuthService } from '../interfaces/IAuthService';
import { UserFactory } from '../patterns/UserFactory';
import { eventBus, AppEvents } from '../patterns/EventBus';
import { config } from '../config/env';
import { ApiError } from '../utils/ApiError';
import { Logger } from '../utils/Logger';

/**
 * AuthService — Authentication Business Logic
 * 
 * SOLID PRINCIPLES APPLIED:
 * - SRP: Only handles authentication (register, login, tokens).
 * - DIP: Depends on IUserRepository interface (injected), not User model directly.
 * - OCP: Uses UserFactory, so adding new roles doesn't modify this class.
 * 
 * DESIGN PATTERNS:
 * - Factory Pattern: Delegates user creation to UserFactory.
 * - Observer Pattern: Publishes events on registration/login.
 * - Dependency Injection: Repository is injected via constructor.
 */
export class AuthService implements IAuthService {
  private readonly userRepository: IUserRepository;
  private readonly logger: Logger;

  /**
   * DIP: Service depends on the IUserRepository abstraction.
   * Constructor Injection makes dependencies explicit and testable.
   */
  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
    this.logger = Logger.createLogger('AuthService');
  }

  async register(
    name: string,
    email: string,
    password: string,
    role: 'student' | 'teacher' = 'student'
  ): Promise<{ user: IUser; token: string }> {
    // Check if user exists (using repository, not model)
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw ApiError.conflict('User with this email already exists');
    }

    // Use Factory Pattern to create user data
    const userData = await UserFactory.createUserData({ name, email, password, role });

    // Persist via repository
    const user = await this.userRepository.create(userData);

    // Generate token
    const token = this.generateToken(user._id.toString());

    // Remove password from response (encapsulation)
    const userObj = user.toObject();
    delete (userObj as any).password;

    this.logger.info(`User registered: ${email} (${role})`);

    // Publish event (Observer Pattern)
    await eventBus.publish(AppEvents.USER_REGISTERED, {
      userId: user._id,
      email,
      role,
    });

    return { user: userObj as IUser, token };
  }

  async login(
    email: string,
    password: string
  ): Promise<{ user: IUser; token: string }> {
    // Find user with password via repository
    const user = await this.userRepository.findByEmailWithPassword(email);
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Verify password via Factory utility
    const isMatch = await UserFactory.verifyPassword(password, user.password);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const token = this.generateToken(user._id.toString());

    const userObj = user.toObject();
    delete (userObj as any).password;

    this.logger.info(`User logged in: ${email}`);

    await eventBus.publish(AppEvents.USER_LOGGED_IN, {
      userId: user._id,
      email,
    });

    return { user: userObj as IUser, token };
  }

  generateToken(userId: string): string {
    return jwt.sign({ id: userId }, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn,
    } as jwt.SignOptions);
  }

  async getProfile(userId: string): Promise<IUser> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    return user;
  }
}
