import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/token.service';
import { UnauthorizedError } from '../errors/AppError';
import { env } from '../../config/env';

declare global {
// eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    let token = '';

    // Check header first (optional, mostly for non-browser clients)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1] || '';
    } else if (req.cookies && req.cookies[env.AUTH_COOKIE_NAME]) {
      // Priority/Fallback to HTTP-only cookie depending on client
      token = req.cookies[env.AUTH_COOKIE_NAME] as string;
    }

    if (!token) {
      throw new UnauthorizedError('Authentication required');
    }

    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (_error) {
    next(new UnauthorizedError('Invalid or expired token'));
  }
};
