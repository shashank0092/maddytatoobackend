import { Request, Response, NextFunction } from 'express';
import { blogService } from './blog.service';
import { successResponse, listResponse } from '../../core/utils/responseFormat';
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
import { BlogQueryDTO, SupportedLanguage } from './blog.types';

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = createBlogSchema.parse(req);
    const result = await blogService.create(validated.body);
    res.status(201).json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

export const getList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = blogQuerySchema.parse(req);
    const isAdmin = !!req.user;
    
    const result = await blogService.getAll(validated.query as BlogQueryDTO, isAdmin);
    
    // As discussed, we wrap pagination inside meta to align with the core listResponse,
    // which expects listResponse(data, meta). It will result in { success, data, meta: { pagination } }
    res.json(listResponse(result.data, result.meta));
  } catch (error) {
    next(error);
  }
};

export const getBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = blogSlugParamSchema.parse(req);
    const isAdmin = !!req.user;

    const result = await blogService.getBySlug(
      validated.params.slug,
      validated.query.language as SupportedLanguage,
      isAdmin
    );

    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

export const updateBasic = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedParams = blogIdParamSchema.parse(req);
    const validatedBody = updateBlogBasicSchema.parse(req);
    
    const result = await blogService.updateBasic(validatedParams.params.id, validatedBody.body);
    
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

export const deleteBlog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedParams = blogIdParamSchema.parse(req);
    
    const result = await blogService.delete(validatedParams.params.id);
    
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedParams = blogIdParamSchema.parse(req);
    const validatedBody = updateBlogStatusSchema.parse(req);
    
    const result = await blogService.updateStatus(validatedParams.params.id, validatedBody.body);
    
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

export const updateSeo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedParams = blogIdParamSchema.parse(req);
    const validatedBody = updateBlogSeoSchema.parse(req);
    
    const result = await blogService.updateSeo(validatedParams.params.id, validatedBody.body);
    
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

export const updateMedia = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedParams = blogIdParamSchema.parse(req);
    const validatedBody = updateBlogMediaSchema.parse(req);
    
    const result = await blogService.updateMedia(validatedParams.params.id, validatedBody.body);
    
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
};
