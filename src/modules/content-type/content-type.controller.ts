import { Request, Response, NextFunction } from 'express';
import { contentTypeService } from './content-type.service';
import { successResponse, listResponse } from '../../core/utils/responseFormat';
import {
  createContentTypeSchema,
  updateContentTypeSchema,
  contentTypeQuerySchema,
  contentTypeIdParamSchema,
  contentTypeSlugParamSchema,
} from './content-type.validation';
import { SupportedLanguage, ContentTypeQueryDTO } from './content-type.types';

export const getList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = contentTypeQuerySchema.parse(req);
    const isAdmin = !!req.user;
    
    const result = await contentTypeService.getAll(validated.query as ContentTypeQueryDTO, isAdmin);
    
    res.json(listResponse(result.data, result.meta));
  } catch (error) {
    next(error);
  }
};

export const getBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = contentTypeSlugParamSchema.parse(req);
    const isAdmin = !!req.user;

    const result = await contentTypeService.getBySlug(
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
    const validated = createContentTypeSchema.parse(req);
    
    const result = await contentTypeService.create(validated.body);
    
    res.status(201).json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedParams = contentTypeIdParamSchema.parse(req);
    const validatedBody = updateContentTypeSchema.parse(req);
    
    const result = await contentTypeService.update(validatedParams.params.id, validatedBody.body);
    
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

export const deleteContentType = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedParams = contentTypeIdParamSchema.parse(req);
    
    await contentTypeService.delete(validatedParams.params.id);
    
    res.json(successResponse({ message: 'Content type deleted successfully.' }));
  } catch (error) {
    next(error);
  }
};
