import { Request, Response, NextFunction } from 'express';
import { feedbackService } from './feedback.service';
import { successResponse, listResponse } from '../../core/utils/responseFormat';
import {
  createFeedbackSchema,
  updateFeedbackSchema,
  updateFeedbackStatusSchema,
  updateFeedbackMediaSchema,
  feedbackListQuerySchema,
  feedbackIdParamSchema,
} from './feedback.validation';

export class FeedbackController {
  /**
   * 1. Create Feedback
   * POST /api/v1/feedback
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = createFeedbackSchema.parse({ body: req.body });
      const result = await feedbackService.create(validatedData.body);
      res.status(201).json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 2. List Feedback
   * GET /api/v1/feedback
   */
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = feedbackListQuerySchema.parse({ query: req.query });
      const isAdmin = !!(req as any).user && req.query.isAdmin === 'true';
      const result = await feedbackService.getAll(validatedData.query, isAdmin);
      res.json(listResponse(result.data as any[], result.pagination));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 3. Get Feedback by ID
   * GET /api/v1/feedback/:id
   */
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { params } = feedbackIdParamSchema.parse({ params: req.params });
      const isAdmin = !!(req as any).user && req.query.isAdmin === 'true';
      const language = (req.query.language as string) || 'en';
      
      const result = await feedbackService.getById(params.id, isAdmin, language);
      if (!result) {
        res.status(404).json({
          success: false,
          error: { code: 'FEEDBACK_NOT_FOUND', message: 'Feedback not found' },
        });
        return;
      }
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 4. Update Feedback
   * PATCH /api/v1/feedback/:id
   */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = updateFeedbackSchema.parse({
        params: req.params,
        body: req.body,
      });
      const result = await feedbackService.update(validatedData.params.id, validatedData.body);
      res.json(successResponse(result));
    } catch (error: any) {
      if (error.message === 'FEEDBACK_NOT_FOUND') {
        res.status(404).json({
          success: false,
          error: { code: 'FEEDBACK_NOT_FOUND', message: 'Feedback not found' },
        });
        return;
      }
      if (error.message === 'CONSENT_REQUIRED_FOR_FEATURED') {
        res.status(400).json({
          success: false,
          error: { code: 'CONSENT_REQUIRED', message: 'Feedback must be APPROVED and have consent to publish before being featured' },
        });
        return;
      }
      next(error);
    }
  }

  /**
   * 5. Moderate Feedback Status
   * PATCH /api/v1/feedback/:id/status
   */
  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { params } = feedbackIdParamSchema.parse({ params: req.params });
      const { body } = updateFeedbackStatusSchema.parse({ body: req.body });
      
      const result = await feedbackService.updateStatus(params.id, body);
      res.json(successResponse(result));
    } catch (error: any) {
      if (error.message === 'FEEDBACK_NOT_FOUND') {
        res.status(404).json({
          success: false,
          error: { code: 'FEEDBACK_NOT_FOUND', message: 'Feedback not found' },
        });
        return;
      }
      if (error.message === 'CONSENT_REQUIRED') {
        res.status(400).json({
          success: false,
          error: { code: 'CONSENT_REQUIRED', message: 'Cannot approve feedback without consent' },
        });
        return;
      }
      next(error);
    }
  }

  /**
   * 6. Manage Media
   * PATCH /api/v1/feedback/:id/media
   */
  async updateMedia(req: Request, res: Response, next: NextFunction) {
    try {
      const { params } = feedbackIdParamSchema.parse({ params: req.params });
      const { body } = updateFeedbackMediaSchema.parse({ body: req.body });
      
      const result = await feedbackService.updateMedia(params.id, body);
      res.json(successResponse(result));
    } catch (error: any) {
      if (error.message === 'FEEDBACK_NOT_FOUND') {
        res.status(404).json({
          success: false,
          error: { code: 'FEEDBACK_NOT_FOUND', message: 'Feedback not found' },
        });
        return;
      }
      next(error);
    }
  }

  /**
   * 7. Delete Feedback
   * DELETE /api/v1/feedback/:id
   */
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { params } = feedbackIdParamSchema.parse({ params: req.params });
      await feedbackService.delete(params.id);
      res.json(successResponse({ message: 'Feedback deleted successfully.' }));
    } catch (error: any) {
      if (error.message === 'FEEDBACK_NOT_FOUND') {
        res.status(404).json({
          success: false,
          error: { code: 'FEEDBACK_NOT_FOUND', message: 'Feedback not found' },
        });
        return;
      }
      next(error);
    }
  }
}

export const feedbackController = new FeedbackController();
