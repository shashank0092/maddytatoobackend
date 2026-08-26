import { Router } from 'express';
import { queryController } from './query.controller';
import { requireAuth } from '../../core/middleware/requireAuth';

const router = Router();

// Public routes
router.post('/', queryController.create);

// Admin routes
router.use(requireAuth);
router.get('/', queryController.list);
router.get('/:id', queryController.getById);
router.patch('/:id', queryController.update);
router.patch('/:id/status', queryController.updateStatus);
router.delete('/:id', queryController.delete);

export default router;
