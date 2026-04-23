import { Router } from 'express';
import { NotificationController } from '../controllers/notificationController';
import { authenticate } from '../middleware/auth';
const router = Router();
router.get('/', authenticate, NotificationController.getMyNotifications);
router.put('/read-all', authenticate, NotificationController.markAllAsRead);
router.put('/:id/read', authenticate, NotificationController.markAsRead);
export default router;
