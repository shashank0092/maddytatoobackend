import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { login, logout } from './auth.controller';
import { validateRequest } from '../../core/middleware/validateRequest';
import { loginSchema } from './auth.validation';
import { errorResponse } from '../../core/utils/responseFormat';
import { env } from '../../config/env';

const router = Router();

// Stricter rate limiter for login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json(errorResponse('TOO_MANY_REQUESTS', 'Too many login attempts, please try again later.'));
  },
  skip: () => env.NODE_ENV === 'development',
});

// Auth endpoints
router.post('/login', loginLimiter, validateRequest(loginSchema), login);
router.post('/logout', logout);

export default router;
