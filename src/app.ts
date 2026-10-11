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

// Trust reverse proxy (API Gateway HTTP API)
app.set('trust proxy', 1);

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

// Body Parsing & Cookies (MUST precede asynchronous middlewares like rate limiters)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// Fallback buffer-to-JSON parser if serverless adapter provides raw Buffer body
app.use((req, res, next) => {
  if (Buffer.isBuffer(req.body)) {
    const contentType = req.headers['content-type'] || '';
    if (contentType.includes('application/json')) {
      try {
        const raw = req.body.toString('utf8');
        req.body = raw ? JSON.parse(raw) : {};
      } catch {
        // SyntaxError or malformed JSON will be handled downstream by validation / error handling
      }
    }
  }
  next();
});

// Safe temporary diagnostic logging (logs metadata only; never values, secrets, tokens, or cookies)
app.use((req, res, next) => {
  const isObject = typeof req.body === 'object' && req.body !== null && !Buffer.isBuffer(req.body);
  const topLevelKeys = isObject ? Object.keys(req.body as Record<string, unknown>) : [];
  req.log.info({
    diagnostic: 'express_body_diagnostic',
    contentType: req.headers['content-type'] ?? null,
    isBodyObject: isObject,
    isBuffer: Buffer.isBuffer(req.body),
    topLevelKeys,
  });
  next();
});

// Global Rate Limiting
app.use(apiLimiter);

// API Routes
app.use('/api/v1', routes);

// 404 Handler
app.use((req: Request, res: Response, next) => {
  next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`));
});

// Centralized Error Handler
app.use(errorHandler);

export default app;
