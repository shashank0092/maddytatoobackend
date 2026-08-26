import { Request, Response, NextFunction } from 'express';
import { dashboardService } from './dashboard.service';
import { successResponse } from '../../core/utils/responseFormat';

export const getDashboardStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stats = await dashboardService.getDashboardStats();
    res.status(200).json(successResponse(stats));
  } catch (error) {
    next(error);
  }
};
