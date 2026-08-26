import { Request, Response, NextFunction } from 'express';
import { MediaService } from './media.service';
import { successResponse } from '../../core/utils/responseFormat';
import { CreateMediaPayload, UpdateMediaPayload } from './media.types';

const mediaService = new MediaService();

export const createMedia = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload: CreateMediaPayload = req.body;
    const media = await mediaService.createMediaReference(payload);
    res.status(201).json(successResponse(media));
  } catch (error) {
    next(error);
  }
};

export const updateMedia = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const payload: UpdateMediaPayload = req.body;
    const media = await mediaService.updateMedia(id, payload);
    res.status(200).json(successResponse(media));
  } catch (error) {
    next(error);
  }
};

export const deleteMedia = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const result = await mediaService.deleteMedia(id);
    res.status(200).json(successResponse(result));
  } catch (error) {
    next(error);
  }
};
