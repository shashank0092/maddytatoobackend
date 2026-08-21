import { Router } from 'express';
import { requireAuth } from '../../core/middleware/requireAuth';
import * as contentController from './content.controller';

const router = Router();

// PUBLIC
router.get('/', contentController.getList);
router.get('/:slug', contentController.getBySlug);

// ADMIN
router.post('/', requireAuth, contentController.create);
router.patch('/:id', requireAuth, contentController.updateBasic);
router.delete('/:id', requireAuth, contentController.deleteContent);
router.patch('/:id/media', requireAuth, contentController.updateMedia);
router.patch('/:id/taxonomy', requireAuth, contentController.updateTaxonomy);
router.patch('/:id/display', requireAuth, contentController.updateDisplay);
router.patch('/:id/seo', requireAuth, contentController.updateSeo);
router.patch('/:id/status', requireAuth, contentController.updateStatus);

export default router;
