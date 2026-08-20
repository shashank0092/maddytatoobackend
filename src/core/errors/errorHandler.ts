import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from './AppError';
import { logger } from '../../config/logger';
import { env } from '../../config/env';
import { errorResponse } from '../utils/responseFormat';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  let statusCode = 500;
  let errorCode = 'INTERNAL_ERROR';
  let message = 'An unexpected error occurred';
  let details: unknown = undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    errorCode = err.errorCode;
    message = err.message;
  } else if (err instanceof ZodError) {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    message = 'Request validation failed';
    details = err.issues;
  } else {
    // Log unexpected errors
    logger.error({ err, reqId: req.id }, 'Unhandled error');
  }

  // Include stack trace only in development and if it's not operational or if it's a 500
  if (env.NODE_ENV === 'development' && statusCode === 500) {
    details = err.stack;
  }

  res.status(statusCode).json(errorResponse(errorCode, message, details));
};
