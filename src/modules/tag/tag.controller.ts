import { Request, Response, NextFunction } from 'express';
import { tagService } from './tag.service';
import { successResponse, listResponse } from '../../core/utils/responseFormat';
import {
  createTagSchema,
  updateTagSchema,
  tagQuerySchema,
  tagIdParamSchema,
  tagSlugParamSchema,
} from './tag.validation';
import { SupportedLanguage, TagQueryDTO } from './tag.types';

export const getList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = tagQuerySchema.parse(req);
    const isAdmin = !!req.user;
    
    const result = await tagService.getAll(validated.query as TagQueryDTO, isAdmin);
    
    res.json(listResponse(result.data, result.meta));
  } catch (error) {
    next(error);
  }
};

export const getBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = tagSlugParamSchema.parse(req);
    const isAdmin = !!req.user;

    const result = await tagService.getBySlug(
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
    const validated = createTagSchema.parse(req);
    
    const result = await tagService.create(validated.body);
    
    res.status(201).json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedParams = tagIdParamSchema.parse(req);
    const validatedBody = updateTagSchema.parse(req);
    
    const result = await tagService.update(validatedParams.params.id, validatedBody.body);
    
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

export const deleteTag = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedParams = tagIdParamSchema.parse(req);
    
    await tagService.delete(validatedParams.params.id);
    
    res.json(successResponse({ message: 'Tag deleted successfully.' }));
  } catch (error) {
    next(error);
  }
};
