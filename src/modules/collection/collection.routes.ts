import { Router } from 'express';
import { requireAuth } from '../../core/middleware/requireAuth';
import * as collectionController from './collection.controller';

const router = Router();

// Public Routes
router.get('/', collectionController.getList);
router.get('/:slug', collectionController.getBySlug);

// Admin Protected Routes
router.post('/', requireAuth, collectionController.create);
router.patch('/:id', requireAuth, collectionController.update);
router.delete('/:id', requireAuth, collectionController.deleteCollection);

export default router;
