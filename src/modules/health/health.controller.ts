import { Request, Response } from 'express';
import { prisma } from '../../config/database';
import { successResponse, errorResponse } from '../../core/utils/responseFormat';

export const checkHealth = (req: Request, res: Response) => {
  res.status(200).json(successResponse({ message: 'API is healthy' }));
};

export const checkReady = async (req: Request, res: Response) => {
  try {
    // Simple query to verify database connection
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json(successResponse({ message: 'API is ready', database: 'connected' }));
  } catch (_error) {
    res.status(503).json(errorResponse('SERVICE_UNAVAILABLE', 'API is not ready, database connection failed'));
  }
};
