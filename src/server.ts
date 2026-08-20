import app from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import { prisma } from './config/database';

const startServer = async () => {
  try {
    // Attempt database connection
    await prisma.$connect();
    logger.info('✅ Successfully connected to the database.');

    const server = app.listen(env.PORT, () => {
      logger.info(`🚀 Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    });

    // Graceful Shutdown handling
    const gracefulShutdown = async (signal: string) => {
      logger.info(`🛑 Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        logger.info('HTTP server closed.');
        await prisma.$disconnect();
        logger.info('Database connection closed.');
        process.exit(0);
      });

      // Force shutdown after 10 seconds if graceful shutdown fails
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error({ err: error }, '❌ Failed to start the server due to database connection issue');
    process.exit(1);
  }
};

startServer();
