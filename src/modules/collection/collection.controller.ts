import { Request, Response, NextFunction } from 'express';
import { collectionService } from './collection.service';
import { successResponse, listResponse } from '../../core/utils/responseFormat';
import {
  createCollectionSchema,
  updateCollectionSchema,
  collectionQuerySchema,
  collectionIdParamSchema,
  collectionSlugParamSchema,
} from './collection.validation';
import { SupportedLanguage, CollectionQueryDTO } from './collection.types';

export const getList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = collectionQuerySchema.parse(req);
    const isAdmin = !!req.user;
    
    const result = await collectionService.getAll(validated.query as CollectionQueryDTO, isAdmin);
    
    res.json(listResponse(result.data, result.meta));
  } catch (error) {
    next(error);
  }
};

export const getBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = collectionSlugParamSchema.parse(req);
    const isAdmin = !!req.user;

    const result = await collectionService.getBySlug(
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
    const validated = createCollectionSchema.parse(req);
    
    const result = await collectionService.create(validated.body);
    
    res.status(201).json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedParams = collectionIdParamSchema.parse(req);
    const validatedBody = updateCollectionSchema.parse(req);
    
    const result = await collectionService.update(validatedParams.params.id, validatedBody.body);
    
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

export const deleteCollection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedParams = collectionIdParamSchema.parse(req);
    
    await collectionService.delete(validatedParams.params.id);
    
    res.json(successResponse({ message: 'Collection deleted successfully.' }));
  } catch (error) {
    next(error);
  }
};
