import { Router } from 'express';
import { body } from 'express-validator';
import { CourseController } from '../controllers/courseController';
import { authenticate } from '../middleware/auth';
import { roleGuard } from '../middleware/roleGuard';
import { validate } from '../middleware/validate';
const router = Router();
router.get('/', authenticate, CourseController.getAll);
router.get('/categories', authenticate, CourseController.getCategories);
router.get('/:id', authenticate, CourseController.getById);
router.post(
  '/',
  authenticate,
  roleGuard('teacher', 'admin'),
  validate([
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('category').trim().notEmpty().withMessage('Category is required'),
  ]),
  CourseController.create
);
router.put(
  '/:id',
  authenticate,
  roleGuard('teacher', 'admin'),
  CourseController.update
);
router.delete(
  '/:id',
  authenticate,
  roleGuard('teacher', 'admin'),
  CourseController.delete
);
router.post('/:id/collaborators', authenticate, roleGuard('teacher', 'admin'), CourseController.addCollaborator);
router.delete('/:id/collaborators', authenticate, roleGuard('teacher', 'admin'), CourseController.removeCollaborator);
export default router;
