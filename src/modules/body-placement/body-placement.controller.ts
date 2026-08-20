import { Request, Response, NextFunction } from 'express';
import { bodyPlacementService } from './body-placement.service';
import { successResponse, listResponse } from '../../core/utils/responseFormat';
import {
  createBodyPlacementSchema,
  updateBodyPlacementSchema,
  bodyPlacementQuerySchema,
  bodyPlacementIdParamSchema,
  bodyPlacementSlugParamSchema,
} from './body-placement.validation';
import { SupportedLanguage, BodyPlacementQueryDTO } from './body-placement.types';

export const getList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = bodyPlacementQuerySchema.parse(req);
    const isAdmin = !!req.user;
    
    const result = await bodyPlacementService.getAll(validated.query as BodyPlacementQueryDTO, isAdmin);
    
    res.json(listResponse(result.data, result.meta));
  } catch (error) {
    next(error);
  }
};

export const getBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = bodyPlacementSlugParamSchema.parse(req);
    const isAdmin = !!req.user;

    const result = await bodyPlacementService.getBySlug(
      validated.params.slug,
      validated.query.lang as SupportedLanguage,
      isAdmin
    );

    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = createBodyPlacementSchema.parse(req);
    
    const result = await bodyPlacementService.create(validated.body);
    
    res.status(201).json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedParams = bodyPlacementIdParamSchema.parse(req);
    const validatedBody = updateBodyPlacementSchema.parse(req);
    
    const result = await bodyPlacementService.update(validatedParams.params.id, validatedBody.body);
    
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

export const deleteBodyPlacement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedParams = bodyPlacementIdParamSchema.parse(req);
    
    await bodyPlacementService.delete(validatedParams.params.id);
    
    res.json(successResponse({ message: 'Body Placement deleted successfully.' }));
  } catch (error) {
    next(error);
  }
};
