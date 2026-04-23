import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { ApiResponse } from '../utils/ApiResponse';

export class UploadController {
  /** POST /api/upload/avatar — upload an avatar image */
  static async uploadAvatar(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }
      const filePath = `/uploads/${req.file.filename}`;
      ApiResponse.success(res, { url: filePath }, 'Avatar uploaded successfully');
    } catch (error) {
      next(error);
    }
  }

  /** POST /api/upload/thumbnail — upload a course thumbnail */
  static async uploadThumbnail(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }
      const filePath = `/uploads/${req.file.filename}`;
      ApiResponse.success(res, { url: filePath }, 'Thumbnail uploaded successfully');
    } catch (error) {
      next(error);
    }
  }
}
