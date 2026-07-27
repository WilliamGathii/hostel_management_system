const app = require('./app');
const { closeDatabaseConnection } = require('./config/database');
const { env, validateRequiredEnv, warnAboutMissingEnv } = require('./config/env');
const logger = require('./utils/logger');

validateRequiredEnv();
warnAboutMissingEnv(logger);

const server = app.listen(env.port, () => {
  logger.info(`API server running on port ${env.port}`);
});

server.on('error', (error) => {
  logger.error('Server startup error', error);
  process.exit(1);
});

const shutdown = (signal) => {
  logger.info(`${signal} received. Closing server.`);

  server.close(async (error) => {
    if (error) {
      logger.error('Error while closing HTTP server.', error);
    }

    try {
      await closeDatabaseConnection();
    } catch (closeError) {
      logger.error('Error while closing database pool.', closeError.message);
    }

    process.exit(error ? 1 : 0);
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

module.exports = server;
