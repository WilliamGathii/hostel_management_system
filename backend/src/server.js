const app = require('./app');
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

module.exports = server;
