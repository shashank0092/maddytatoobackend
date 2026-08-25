import { Request, Response, NextFunction } from 'express';
import { loginAdmin } from './auth.service';
import { successResponse } from '../../core/utils/responseFormat';
import { env } from '../../config/env';
import { cognitoService } from '../../services/cognito.service';

const setAuthCookie = (res: Response, token: string) => {
  res.cookie(env.AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax',
    path: '/',
    maxAge: env.AUTH_COOKIE_MAX_AGE,
  });
};

const clearAuthCookie = (res: Response) => {
  res.clearCookie(env.AUTH_COOKIE_NAME, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax',
    path: '/',
  });
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const { token, user } = await loginAdmin(email, password);

    setAuthCookie(res, token);

    res.status(200).json(successResponse({ user }));
  } catch (error) {
    next(error); // AppError will be caught by central errorHandler and parsed to 401
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    clearAuthCookie(res);
    res.status(200).json(successResponse({ message: 'Logged out successfully' }));
  } catch (error) {
    next(error);
  }
};

export const getAwsCredentials = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new Error('User ID is missing from request'); // Should not happen with requireAuth
    }

    const credentials = await cognitoService.getDeveloperIdentity(userId);

    res.status(200).json(successResponse(credentials));
  } catch (error) {
    next(error);
  }
};
