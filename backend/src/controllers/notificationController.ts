import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Notification } from '../models/Notification';
import { ApiResponse } from '../utils/ApiResponse';

export class NotificationController {
  /** GET /api/notifications — get current user's notifications */
  static async getMyNotifications(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const notifications = await Notification.find({ recipient: req.user!._id })
        .sort({ createdAt: -1 })
        .limit(50)
        .exec();
      const unreadCount = await Notification.countDocuments({
        recipient: req.user!._id,
        read: false,
      });
      ApiResponse.success(res, { notifications, unreadCount });
    } catch (error) {
      next(error);
    }
  }

  /** PUT /api/notifications/:id/read — mark one as read */
  static async markAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await Notification.findOneAndUpdate(
        { _id: req.params.id, recipient: req.user!._id },
        { read: true }
      );
      ApiResponse.success(res, null, 'Notification marked as read');
    } catch (error) {
      next(error);
    }
  }

  /** PUT /api/notifications/read-all — mark all as read */
  static async markAllAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await Notification.updateMany(
        { recipient: req.user!._id, read: false },
        { read: true }
      );
      ApiResponse.success(res, null, 'All notifications marked as read');
    } catch (error) {
      next(error);
    }
  }
}
