import { Request, Response, NextFunction } from 'express';
import { queryService } from './query.service';
import { successResponse, listResponse } from '../../core/utils/responseFormat';
import { 
  createQuerySchema, 
  queryQuerySchema, 
  queryIdParamSchema, 
  updateQueryStatusSchema,
  updateQuerySchema
} from './query.validation';
import { QueryQueryDTO } from './query.validation';

export class QueryController {
  /**
   * 1. Create Query
   * POST /api/v1/queries
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = createQuerySchema.parse({ body: req.body });
      const result = await queryService.createQuery(validatedData.body);
      res.status(201).json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/queries
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = queryQuerySchema.parse(req);
      const result = await queryService.getAll(validated.query as QueryQueryDTO);
      res.status(200).json(listResponse(result.data, result.meta));
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/queries/:id
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = queryIdParamSchema.parse(req);
      const result = await queryService.getById(validated.params.id);
      res.status(200).json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/v1/queries/:id
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = updateQuerySchema.parse(req);
      const userId = req.user!.userId; // Authenticated
      const result = await queryService.update(validated.params.id, validated.body, userId);
      res.status(200).json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/v1/queries/:id/status
  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = updateQueryStatusSchema.parse(req);
      const userId = req.user!.userId; // Authenticated
      const result = await queryService.updateStatus(validated.params.id, validated.body, userId);
      res.status(200).json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/v1/queries/:id
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = queryIdParamSchema.parse(req);
      const result = await queryService.delete(validated.params.id);
      res.status(200).json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }
}

export const queryController = new QueryController();
