import { Router } from 'express';
import { createMedia, updateMedia, deleteMedia } from './media.controller';
import { validateRequest } from '../../core/middleware/validateRequest';
import { requireAuth } from '../../core/middleware/requireAuth';
import {
  createMediaSchema,
  updateMediaSchema,
  mediaIdParamSchema,
} from './media.validation';

const router = Router();

// All Media reference APIs are ADMIN ONLY
router.use(requireAuth);

router.post('/', validateRequest(createMediaSchema), createMedia);

router.patch('/:id', validateRequest(mediaIdParamSchema), validateRequest(updateMediaSchema), updateMedia);

router.delete('/:id', validateRequest(mediaIdParamSchema), deleteMedia);

export default router;
