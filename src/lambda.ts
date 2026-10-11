import serverlessExpress from '@codegenie/serverless-express';
import { loadSecrets } from './config/secrets.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let serverlessExpressInstance: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cachedLogger: any;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handler = async (event: any, context: any) => {
  context.callbackWaitsForEmptyEventLoop = false;
  
  if (!serverlessExpressInstance) {
    // 1. Fetch runtime configuration from AWS Secrets Manager before importing any logic
    await loadSecrets();
    
    // 2. Dynamically import application dependencies so that env.ts validates process.env with secrets injected
    const appModule = await import('./app.js');
    const app = appModule.default?.default || appModule.default || appModule;
    
    if (!app || typeof app.use !== 'function') {
      throw new Error(`Invalid Express app resolved. Module keys: ${Object.keys(appModule).join(',')}`);
    }
    const { prisma } = await import('./config/database.js');
    const { logger } = await import('./config/logger.js');
    cachedLogger = logger;
    
    // 3. Initialize the database connection during cold start
    try {
      await prisma.$connect();
      logger.info('✅ Successfully connected to the database (Lambda cold start).');
    } catch (error) {
      logger.error({ err: error }, '❌ Failed to connect to the database during Lambda cold start');
      // Let it fail fast or handle depending on requirements
    }

    // 4. Initialize serverless express adapter
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    serverlessExpressInstance = serverlessExpress({ app: app as any });
  }

  // Safe temporary diagnostic logging (logs metadata only; never values, secrets, tokens, or cookies)
  if (cachedLogger) {
    const contentType = event?.headers?.['content-type'] || event?.headers?.['Content-Type'];
    cachedLogger.info({
      diagnostic: 'lambda_event_received',
      hasBody: typeof event?.body === 'string' ? event.body.length > 0 : !!event?.body,
      isBase64Encoded: !!event?.isBase64Encoded,
      contentType: contentType ?? null,
    });
  }
  
  return serverlessExpressInstance(event, context);
};
