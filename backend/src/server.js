const app = require('./app');
const logger = require('./utils/logger');

const port = process.env.PORT || 5000;

const server = app.listen(port, () => {
  logger.info(`API server running on port ${port}`);
});

server.on('error', (error) => {
  logger.error('Server startup error', error);
  process.exit(1);
});

module.exports = server;
