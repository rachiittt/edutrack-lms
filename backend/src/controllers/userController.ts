import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { User } from '../models/User';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';

export class UserController {
  /** GET /api/users/:id — public profile */
  static async getPublicProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await User.findById(req.params.id).select('name email role avatar createdAt');
      if (!user) throw ApiError.notFound('User not found');
      ApiResponse.success(res, { user });
    } catch (error) {
      next(error);
    }
  }

  /** PUT /api/users/profile — update own profile fields */
  static async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { name, avatar, bio, socialLinks, preferences } = req.body;
      const updates: Record<string, any> = {};
      if (name !== undefined) updates.name = name;
      if (avatar !== undefined) updates.avatar = avatar;
      if (bio !== undefined) updates.bio = bio;
      if (socialLinks !== undefined) updates.socialLinks = socialLinks;
      if (preferences !== undefined) updates.preferences = preferences;

      const user = await User.findByIdAndUpdate(req.user!._id, updates, {
        new: true,
        runValidators: true,
      }).select('-password');

      if (!user) throw ApiError.notFound('User not found');
      ApiResponse.success(res, { user }, 'Profile updated successfully');
    } catch (error) {
      next(error);
    }
  }
}
