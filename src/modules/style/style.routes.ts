import { Router } from 'express';
import { requireAuth } from '../../core/middleware/requireAuth';
import * as styleController from './style.controller';

const router = Router();

// Public Routes
router.get('/', styleController.getList);
router.get('/:slug', styleController.getBySlug);

// Admin Protected Routes
router.post('/', requireAuth, styleController.create);
router.patch('/:id', requireAuth, styleController.update);
router.delete('/:id', requireAuth, styleController.deleteStyle);

export default router;
