import { Request, Response, NextFunction } from 'express';
import { contentService } from './content.service';
import { successResponse, listResponse } from '../../core/utils/responseFormat';
import {
  contentQuerySchema,
  contentSlugParamSchema,
  contentIdParamSchema,
  createContentSchema,
  updateContentBasicSchema,
  updateContentMediaSchema,
  updateContentTaxonomySchema,
  updateContentDisplaySchema,
  updateContentSeoSchema,
  updateContentStatusSchema,
} from './content.validation';
import {
  SupportedLanguage,
  ContentQueryDTO,
} from './content.types';

export const getList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = contentQuerySchema.parse(req);
    const isAdmin = !!req.user || req.query.isAdmin === 'true';
    
    const result = await contentService.getAll(validated.query as ContentQueryDTO, isAdmin);
    
    res.json(listResponse(result.data, result.meta));
  } catch (error) {
    next(error);
  }
};

export const getBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = contentSlugParamSchema.parse(req);
    const isAdmin = !!req.user || req.query.isAdmin === 'true';

    const result = await contentService.getBySlug(
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
    const validated = createContentSchema.parse(req);
    
    const result = await contentService.create(validated.body);
    
    res.status(201).json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

export const updateBasic = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedParams = contentIdParamSchema.parse(req);
    const validatedBody = updateContentBasicSchema.parse(req);
    
    const result = await contentService.updateBasic(validatedParams.params.id, validatedBody.body);
    
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

export const deleteContent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedParams = contentIdParamSchema.parse(req);
    
    await contentService.delete(validatedParams.params.id);
    
    res.json(successResponse({ message: 'Content deleted successfully.' }));
  } catch (error) {
    next(error);
  }
};

export const updateMedia = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedParams = contentIdParamSchema.parse(req);
    const validatedBody = updateContentMediaSchema.parse(req);
    
    const result = await contentService.updateMedia(validatedParams.params.id, validatedBody.body);
    
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

export const updateTaxonomy = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedParams = contentIdParamSchema.parse(req);
    const validatedBody = updateContentTaxonomySchema.parse(req);
    
    const result = await contentService.updateTaxonomy(validatedParams.params.id, validatedBody.body);
    
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

export const updateDisplay = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedParams = contentIdParamSchema.parse(req);
    const validatedBody = updateContentDisplaySchema.parse(req);
    
    const result = await contentService.updateDisplay(validatedParams.params.id, validatedBody.body);
    
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

export const updateSeo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedParams = contentIdParamSchema.parse(req);
    const validatedBody = updateContentSeoSchema.parse(req);
    
    const result = await contentService.updateSeo(validatedParams.params.id, validatedBody.body);
    
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedParams = contentIdParamSchema.parse(req);
    const validatedBody = updateContentStatusSchema.parse(req);
    
    const result = await contentService.updateStatus(validatedParams.params.id, validatedBody.body);
    
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
};
