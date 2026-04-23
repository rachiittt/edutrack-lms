import { Router } from 'express';
import { UploadController } from '../controllers/uploadController';
import { authenticate } from '../middleware/auth';
import { uploadAvatar, uploadThumbnail } from '../middleware/upload';
const router = Router();
router.post('/avatar', authenticate, uploadAvatar, UploadController.uploadAvatar);
router.post('/thumbnail', authenticate, uploadThumbnail, UploadController.uploadThumbnail);
export default router;
