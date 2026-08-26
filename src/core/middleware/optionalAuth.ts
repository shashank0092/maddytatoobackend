import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/token.service';
import { env } from '../../config/env';

export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    let token = '';
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1] || '';
    } else if (req.cookies && req.cookies[env.AUTH_COOKIE_NAME]) {
      token = req.cookies[env.AUTH_COOKIE_NAME] as string;
    }

    if (token) {
      const payload = verifyAccessToken(token);
      req.user = payload;
    }
  } catch (_error) {
    // Optional auth, so we just ignore token verification errors
  } finally {
    next();
  }
};
