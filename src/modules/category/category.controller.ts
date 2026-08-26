import { Request, Response, NextFunction } from 'express';
import { categoryService } from './category.service';
import { successResponse, listResponse } from '../../core/utils/responseFormat';
import {
  createCategorySchema,
  updateCategorySchema,
  categoryQuerySchema,
  categoryIdParamSchema,
  categorySlugParamSchema,
} from './category.validation';
import { SupportedLanguage, CategoryQueryDTO } from './category.types';

export const getList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = categoryQuerySchema.parse(req);
    const isAdmin = !!req.user || req.query.isAdmin === 'true';
    
    const result = await categoryService.getAll(validated.query as CategoryQueryDTO, isAdmin);
    
    res.json(listResponse(result.data, result.meta));
  } catch (error) {
    next(error);
  }
};

export const getBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = categorySlugParamSchema.parse(req);
    const isAdmin = !!req.user || req.query.isAdmin === 'true';

    const result = await categoryService.getBySlug(
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
    const validated = createCategorySchema.parse(req);
    
    const result = await categoryService.create(validated.body);
    
    res.status(201).json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedParams = categoryIdParamSchema.parse(req);
    const validatedBody = updateCategorySchema.parse(req);
    
    const result = await categoryService.update(validatedParams.params.id, validatedBody.body);
    
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedParams = categoryIdParamSchema.parse(req);
    
    await categoryService.delete(validatedParams.params.id);
    
    res.json(successResponse({ message: 'Category deleted successfully.' }));
  } catch (error) {
    next(error);
  }
};
