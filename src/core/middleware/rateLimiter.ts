import rateLimit from 'express-rate-limit';
import { env } from '../../config/env';
import { errorResponse } from '../utils/responseFormat';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    res.status(429).json(errorResponse('TOO_MANY_REQUESTS', 'Too many requests, please try again later.'));
  },
  skip: () => env.NODE_ENV === 'development', // Optionally skip rate limiting in dev
});
