import { Router } from 'express';
import healthRoutes from '../modules/health/health.routes';
import authRoutes from '../modules/auth/auth.routes';
import contentRoutes from '../modules/content/content.routes';
import blogRoutes from '../modules/blog/blog.routes';
import feedbackRoutes from '../modules/feedback/feedback.routes';
import queriesRoutes from '../modules/queries/queries.routes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/content', contentRoutes);
router.use('/blog', blogRoutes);
router.use('/feedback', feedbackRoutes);
router.use('/queries', queriesRoutes);

export default router;
