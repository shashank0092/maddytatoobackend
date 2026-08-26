import { Router } from 'express';
import { requireAuth } from '../../core/middleware/requireAuth';
import { optionalAuth } from '../../core/middleware/optionalAuth';
import * as contentTypeController from './content-type.controller';

const router = Router();

// Public Routes
router.get('/', optionalAuth, contentTypeController.getList);
router.get('/:slug', optionalAuth, contentTypeController.getBySlug);

// Admin Protected Routes
router.post('/', requireAuth, contentTypeController.create);
router.patch('/:id', requireAuth, contentTypeController.update);
router.delete('/:id', requireAuth, contentTypeController.deleteContentType);

export default router;
