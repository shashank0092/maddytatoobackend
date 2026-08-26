import { Router } from 'express';
import { getDashboardStats } from './dashboard.controller';
import { requireAuth } from '../../core/middleware/requireAuth';

const router = Router();

// Protect all dashboard routes
router.use(requireAuth);

router.get('/', getDashboardStats);

export default router;
