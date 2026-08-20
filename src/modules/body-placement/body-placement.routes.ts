import { Router } from 'express';
import { requireAuth } from '../../core/middleware/requireAuth';
import * as bodyPlacementController from './body-placement.controller';

const router = Router();

// Public Routes
router.get('/', bodyPlacementController.getList);
router.get('/:slug', bodyPlacementController.getBySlug);

// Admin Protected Routes
router.post('/', requireAuth, bodyPlacementController.create);
router.patch('/:id', requireAuth, bodyPlacementController.update);
router.delete('/:id', requireAuth, bodyPlacementController.deleteBodyPlacement);

export default router;
