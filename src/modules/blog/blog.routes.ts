import { Router } from 'express';
import { requireAuth } from '../../core/middleware/requireAuth';
import { validateRequest } from '../../core/middleware/validateRequest';
import {
  create,
  getList,
  getBySlug,
  updateBasic,
  deleteBlog,
  updateStatus,
  updateSeo,
  updateMedia,
} from './blog.controller';
import {
  createBlogSchema,
  blogQuerySchema,
  blogSlugParamSchema,
  blogIdParamSchema,
  updateBlogBasicSchema,
  updateBlogStatusSchema,
  updateBlogSeoSchema,
  updateBlogMediaSchema,
} from './blog.validation';

const router = Router();

// Public Routes
router.get('/', validateRequest(blogQuerySchema), getList);
router.get('/:slug', validateRequest(blogSlugParamSchema), getBySlug);

// Admin Routes
router.use(requireAuth); // All routes below require authentication

router.post('/', validateRequest(createBlogSchema), create);
router.patch('/:id', validateRequest(blogIdParamSchema), validateRequest(updateBlogBasicSchema), updateBasic);
router.delete('/:id', validateRequest(blogIdParamSchema), deleteBlog);

router.patch('/:id/status', validateRequest(blogIdParamSchema), validateRequest(updateBlogStatusSchema), updateStatus);
router.patch('/:id/seo', validateRequest(blogIdParamSchema), validateRequest(updateBlogSeoSchema), updateSeo);
router.patch('/:id/media', validateRequest(blogIdParamSchema), validateRequest(updateBlogMediaSchema), updateMedia);

export default router;
