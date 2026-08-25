import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5001').transform((val) => parseInt(val, 10)),
  
  DATABASE_URL: z.string().url(),

  JWT_ACCESS_SECRET: z.string().min(10),
  JWT_REFRESH_SECRET: z.string().min(10),
  
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  AUTH_COOKIE_NAME: z.string().default('access_token'),
  AUTH_COOKIE_MAX_AGE: z.string().default('900000').transform((val) => parseInt(val, 10)),

  CORS_ORIGIN: z.string().url(),

  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

  AWS_REGION: z.string().min(1, 'AWS_REGION is required'),
  AWS_IDENTITY_POOL_ID: z.string().min(1, 'AWS_IDENTITY_POOL_ID is required'),
  AWS_DEVELOPER_PROVIDER_NAME: z.string().min(1, 'AWS_DEVELOPER_PROVIDER_NAME is required'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.format());
  process.exit(1);
}

export const env = _env.data;
