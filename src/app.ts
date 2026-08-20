import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import routes from './routes';
import { errorHandler } from './core/errors/errorHandler';
import { NotFoundError } from './core/errors/AppError';
import { requestLogger, addRequestIdHeader } from './core/middleware/requestLogger';
import { apiLimiter } from './core/middleware/rateLimiter';

const app = express();

// Set Request ID header
app.use(addRequestIdHeader);

// Structured Request Logging
app.use(requestLogger);

// Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);

// Global Rate Limiting
app.use(apiLimiter);

// Body Parsing & Cookies
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// API Routes
app.use('/api/v1', routes);

// 404 Handler
app.use((req: Request, res: Response, next) => {
  next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`));
});

// Centralized Error Handler
app.use(errorHandler);

export default app;
