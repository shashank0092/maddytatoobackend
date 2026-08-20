import { Router } from 'express';
import { requireAuth } from '../../core/middleware/requireAuth';
import * as tagController from './tag.controller';

const router = Router();

// Public Routes
router.get('/', tagController.getList);
router.get('/:slug', tagController.getBySlug);

// Admin Protected Routes
router.post('/', requireAuth, tagController.create);
router.patch('/:id', requireAuth, tagController.update);
router.delete('/:id', requireAuth, tagController.deleteTag);

export default router;
