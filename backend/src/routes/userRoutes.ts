import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authenticate } from '../middleware/auth';
const router = Router();
router.get('/:id', authenticate, UserController.getPublicProfile);
router.put('/profile', authenticate, UserController.updateProfile);
export default router;
