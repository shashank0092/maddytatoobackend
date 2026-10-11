# AWS Lambda Deployment Audit Report

## 1. Existing Architecture
The backend is an Express.js application written in TypeScript. It uses Prisma ORM for database access. The codebase is organized modularly, with the Express app setup cleanly separated into `src/app.ts` and the server startup logic in `src/server.ts`. 

## 2. Relevant File Paths
- **Entry Points:** `src/app.ts` (Express instance), `src/server.ts` (Server listener).
- **Configuration:** `src/config/env.ts` (Zod-based env validation), `src/config/database.ts` (Prisma client).
- **Routes:** `src/routes/index.ts` (Main router registering module-specific routers).
- **Middleware:** `src/core/middleware/requireAuth.ts`, `src/core/middleware/rateLimiter.ts`, `src/core/middleware/errorHandler.ts`.

## 3. Existing Routes and Middleware
- **Routes:** 
  - `/health`, `/auth`, `/contents`, `/blogs`, `/feedback`, `/queries`, `/content-types`, `/categories`, `/collections`, `/styles`, `/body-placements`, `/tags`, `/media`, `/dashboard`.
- **Middleware:** 
  - `cors` (using origin from `CORS_ORIGIN`).
  - `helmet` for security.
  - `express-rate-limit`.
  - JSON and URL-encoded body parsers (1mb limit).
  - `cookie-parser`.
  - Custom `requestLogger` and `addRequestIdHeader`.
  - Custom `requireAuth` for protected routes.
  - Global `errorHandler` and 404 handler.

## 4. Existing Authentication Mechanism
- Custom JWT-based authentication.
- Secrets managed via environment variables (`JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`).
- Middleware (`requireAuth.ts`) checks for a Bearer token in the `Authorization` header, or falls back to an HTTP-only cookie (`AUTH_COOKIE_NAME`).

## 5. Existing Database Integration
- Database connection is managed via Prisma ORM (`@prisma/client`).
- It connects directly to the PostgreSQL database (likely Supabase PostgreSQL judging from the prompt context, but Prisma doesn't use `supabase-js`, it connects directly using the `DATABASE_URL`).
- Initialized in `src/server.ts` before the server starts listening.

## 6. Existing Media-Upload Integration
- The codebase handles media references in the database (via `src/modules/media/media.service.ts` which manages DB records like `s3_key`, `media_type`), but no active presigned URL generation logic (e.g. `@aws-sdk/client-s3` usage) was found.
- S3 uploads are likely handled directly by the frontend, or this feature is not yet fully implemented in the backend.

## 7. Required Environment Variable Names
Based on `src/config/env.ts`:
- `NODE_ENV`
- `PORT`
- `DATABASE_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_ACCESS_EXPIRES_IN`
- `JWT_REFRESH_EXPIRES_IN`
- `AUTH_COOKIE_NAME`
- `AUTH_COOKIE_MAX_AGE`
- `CORS_ORIGIN`
- `LOG_LEVEL`
- `AWS_REGION`
- `AWS_IDENTITY_POOL_ID`
- `AWS_DEVELOPER_PROVIDER_NAME`

## 8. Potential Lambda Compatibility Issues
- **Prisma ORM:** Prisma generates binaries specific to the OS and architecture. We must configure Prisma to generate client binaries compatible with the Lambda runtime (e.g., `rhel-openssl-1.0.x` or similar depending on the Node runtime environment). We also need to be mindful of connection pooling and limits, as Lambda can scale out rapidly and exhaust database connections.
- **Native dependencies:** `argon2` is a native dependency. We need to ensure that the build bundles/compiles a version compatible with the AWS Lambda execution environment (e.g. Amazon Linux 2 or 2023).
- **Rate Limiting:** `express-rate-limit` stores limits in memory by default. In a serverless environment, each Lambda execution context maintains its own memory, rendering in-memory rate limiting ineffective across scaled instances.
- **Background Processes:** None spotted, but Express's `app.listen()` graceful shutdown handlers (like handling `SIGTERM` and `SIGINT`) won't behave the same way in Lambda.

## 9. Required Changes
- Create `src/lambda.ts` to adapt `app.ts` using `@codegenie/serverless-express`.
- Install `@codegenie/serverless-express`.
- Add a SAM `template.yaml` for infrastructure definitions.
- Ensure the build command or SAM esbuild compiles the TypeScript correctly, resolving the native dependency issues.
- Modify Prisma configuration (if needed) to specify binary targets.

## 10. Risks and Unresolved Questions
- **Connection Limits:** How will Prisma handle sudden bursts of traffic given direct connections to Supabase PostgreSQL without an external connection pooler (like Supavisor)?
- **Argon2 Compilation:** The `argon2` binary might fail to load in Lambda unless compiled on a compatible system.
- **S3 Presigned URLs:** Did the prompt assume there's presigned upload logic that isn't actually there, or is it located in a non-obvious location?
