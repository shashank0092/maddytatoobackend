import { Router } from 'express';
import { requireAuth } from '../../core/middleware/requireAuth';
import * as categoryController from './category.controller';

const router = Router();

// Public Routes
router.get('/', categoryController.getList);
router.get('/:slug', categoryController.getBySlug);

// Admin Protected Routes
router.post('/', requireAuth, categoryController.create);
router.patch('/:id', requireAuth, categoryController.update);
router.delete('/:id', requireAuth, categoryController.deleteCategory);

export default router;
