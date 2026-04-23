import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User, IUser } from '../models/User';
import { eventBus, AppEvents } from '../utils/EventBus';
import { config } from '../config/env';
import { ApiError } from '../utils/ApiError';
import { Logger } from '../utils/Logger';

export class AuthService {
  private readonly logger: Logger;

  constructor() {
    this.logger = Logger.createLogger('AuthService');
  }

  async register(
    name: string,
    email: string,
    password: string,
    role: 'student' | 'teacher' = 'student'
  ): Promise<{ user: IUser; token: string }> {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw ApiError.conflict('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role
    });

    await user.save();
    
    const token = this.generateToken(user._id.toString());
    const userObj = user.toObject();
    delete (userObj as any).password;

    this.logger.info(`User registered: ${email} (${role})`);
    
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
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.password);
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
    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    return user;
  }
}
