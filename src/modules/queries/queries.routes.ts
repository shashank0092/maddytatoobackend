import { Router } from 'express';
import { queryController } from './query.controller';

const router = Router();

// Public routes
router.post('/', queryController.create);

// The following routes will be implemented later and should be protected by authentication
router.get('/', queryController.list);
router.get('/:id', queryController.getById);
router.patch('/:id', queryController.update);
router.patch('/:id/status', queryController.updateStatus);
router.delete('/:id', queryController.delete);

export default router;
