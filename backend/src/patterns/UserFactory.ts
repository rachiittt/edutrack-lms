import bcrypt from 'bcryptjs';
import { IUser } from '../models/User';

/**
 * ============================================================
 * FACTORY PATTERN — User Creation
 * ============================================================
 * 
 * The Factory Pattern encapsulates object creation logic and
 * decouples the client from the concrete class being instantiated.
 * 
 * WHY: Different user roles (Student, Teacher, Admin) may require
 * different initialization logic (e.g., default avatar, role-specific
 * defaults). The factory centralizes and encapsulates this logic.
 * 
 * SOLID:
 * - SRP: Creation logic is separated from business logic.
 * - OCP: Adding a new role (e.g., "moderator") only requires
 *   adding a new case — no modification to existing cases.
 * - LSP: All created users conform to the IUser interface,
 *   so they are interchangeable.
 * 
 * OOP:
 * - Abstraction: Hides the complexity of user creation.
 * - Polymorphism: Different roles get different default properties,
 *   but all share the same interface.
 */

interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'teacher' | 'admin';
}

/**
 * BaseUserBuilder — Abstract base for user construction
 * Demonstrates Inheritance & Abstraction
 */
abstract class BaseUserBuilder {
  protected name: string;
  protected email: string;
  protected hashedPassword: string;

  constructor(name: string, email: string, hashedPassword: string) {
    this.name = name;
    this.email = email;
    this.hashedPassword = hashedPassword;
  }

  abstract getRole(): 'student' | 'teacher' | 'admin';
  abstract getDefaultAvatar(): string;

  /**
   * Build the user data object.
   * LSP — all subclass products are valid IUser partials.
   */
  build(): Partial<IUser> {
    return {
      name: this.name,
      email: this.email,
      password: this.hashedPassword,
      role: this.getRole(),
      avatar: this.getDefaultAvatar(),
    };
  }
}

/**
 * StudentBuilder — Constructs student user data
 * Inherits from BaseUserBuilder
 */
class StudentBuilder extends BaseUserBuilder {
  getRole(): 'student' {
    return 'student';
  }

  getDefaultAvatar(): string {
    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(this.name)}&backgroundColor=4f46e5`;
  }
}

/**
 * TeacherBuilder — Constructs teacher user data
 * Inherits from BaseUserBuilder
 */
class TeacherBuilder extends BaseUserBuilder {
  getRole(): 'teacher' {
    return 'teacher';
  }

  getDefaultAvatar(): string {
    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(this.name)}&backgroundColor=059669`;
  }
}

/**
 * AdminBuilder — Constructs admin user data
 * Inherits from BaseUserBuilder
 */
class AdminBuilder extends BaseUserBuilder {
  getRole(): 'admin' {
    return 'admin';
  }

  getDefaultAvatar(): string {
    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(this.name)}&backgroundColor=dc2626`;
  }
}

/**
 * UserFactory — The Factory itself
 * 
 * Encapsulates:
 * 1. Password hashing logic
 * 2. Role-based builder selection
 * 3. User data construction
 */
export class UserFactory {
  private static readonly SALT_ROUNDS = 12;

  /**
   * Create a user data object for the given role.
   * The factory selects the appropriate builder based on role.
   */
  static async createUserData(dto: CreateUserDTO): Promise<Partial<IUser>> {
    // Encapsulated password hashing
    const salt = await bcrypt.genSalt(UserFactory.SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(dto.password, salt);

    // Select builder based on role (Factory logic)
    const builder = UserFactory.getBuilder(dto.role, dto.name, dto.email, hashedPassword);
    return builder.build();
  }

  /**
   * Factory method — returns the appropriate builder for the role.
   * OCP: To add a new role, add a new Builder class and a new case here.
   */
  private static getBuilder(
    role: string,
    name: string,
    email: string,
    hashedPassword: string
  ): BaseUserBuilder {
    switch (role) {
      case 'student':
        return new StudentBuilder(name, email, hashedPassword);
      case 'teacher':
        return new TeacherBuilder(name, email, hashedPassword);
      case 'admin':
        return new AdminBuilder(name, email, hashedPassword);
      default:
        return new StudentBuilder(name, email, hashedPassword);
    }
  }

  /**
   * Verify a plain-text password against a hashed password.
   */
  static async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
