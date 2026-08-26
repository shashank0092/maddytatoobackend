import { Router } from 'express';
import { requireAuth } from '../../core/middleware/requireAuth';
import { optionalAuth } from '../../core/middleware/optionalAuth';
import { validateRequest } from '../../core/middleware/validateRequest';
import { feedbackController } from './feedback.controller';
import {
  createFeedbackSchema,
  updateFeedbackSchema,
  updateFeedbackStatusSchema,
  updateFeedbackMediaSchema,
  feedbackListQuerySchema,
  feedbackIdParamSchema,
} from './feedback.validation';

const router = Router();

// Public/Optional Admin Routes
router.post('/', validateRequest(createFeedbackSchema), feedbackController.create);
router.get('/', optionalAuth, validateRequest(feedbackListQuerySchema), feedbackController.getAll);
router.get('/:id', optionalAuth, validateRequest(feedbackIdParamSchema), feedbackController.getById);

// Admin Routes
router.use(requireAuth);

router.patch('/:id', validateRequest(feedbackIdParamSchema), validateRequest(updateFeedbackSchema), feedbackController.update);
router.delete('/:id', validateRequest(feedbackIdParamSchema), feedbackController.delete);

router.patch('/:id/status', validateRequest(feedbackIdParamSchema), validateRequest(updateFeedbackStatusSchema), feedbackController.updateStatus);
router.patch('/:id/media', validateRequest(feedbackIdParamSchema), validateRequest(updateFeedbackMediaSchema), feedbackController.updateMedia);

export default router;
