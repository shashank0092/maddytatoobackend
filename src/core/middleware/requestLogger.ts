import { Request, Response, NextFunction } from 'express';
import pinoHttp from 'pino-http';
import { logger } from '../../config/logger';
import crypto from 'crypto';

export const requestLogger = pinoHttp({
  logger,
  genReqId: function (req) {
    // Generate a unique Request ID if not provided by a reverse proxy
    return req.headers['x-request-id'] || crypto.randomUUID();
  },
  customProps: function (req, _res) {
    return {
      reqId: req.id,
    };
  },
});

export const addRequestIdHeader = (req: Request, res: Response, next: NextFunction) => {
  if (req.id) {
    res.setHeader('X-Request-ID', req.id as string);
  }
  next();
};
