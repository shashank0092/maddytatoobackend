import { Request, Response, NextFunction } from 'express';
import { styleService } from './style.service';
import { successResponse, listResponse } from '../../core/utils/responseFormat';
import {
  createStyleSchema,
  updateStyleSchema,
  styleQuerySchema,
  styleIdParamSchema,
  styleSlugParamSchema,
} from './style.validation';
import { SupportedLanguage, StyleQueryDTO } from './style.types';

export const getList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = styleQuerySchema.parse(req);
    const isAdmin = !!req.user;
    
    const result = await styleService.getAll(validated.query as StyleQueryDTO, isAdmin);
    
    res.json(listResponse(result.data, result.meta));
  } catch (error) {
    next(error);
  }
};

export const getBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = styleSlugParamSchema.parse(req);
    const isAdmin = !!req.user;

    const result = await styleService.getBySlug(
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
    const validated = createStyleSchema.parse(req);
    
    const result = await styleService.create(validated.body);
    
    res.status(201).json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedParams = styleIdParamSchema.parse(req);
    const validatedBody = updateStyleSchema.parse(req);
    
    const result = await styleService.update(validatedParams.params.id, validatedBody.body);
    
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

export const deleteStyle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedParams = styleIdParamSchema.parse(req);
    
    await styleService.delete(validatedParams.params.id);
    
    res.json(successResponse({ message: 'Style deleted successfully.' }));
  } catch (error) {
    next(error);
  }
};
