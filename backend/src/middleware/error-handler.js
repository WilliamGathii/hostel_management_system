const { env } = require('../config/env');
const { sendError } = require('../utils/api-response');
const logger = require('../utils/logger');

const getStatusCode = (error) => {
  const statusCode = error.statusCode || error.status || 500;

  if (statusCode < 400 || statusCode > 599) {
    return 500;
  }

  return statusCode;
};

const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  const statusCode = getStatusCode(error);
  const isUnexpectedError = statusCode >= 500;
  const message =
    isUnexpectedError && env.isProduction
      ? 'Server error'
      : error.message || 'Request failed';

  if (isUnexpectedError) {
    logger.error(
      `Unexpected error for request ${req.requestId || 'unknown'}.`,
      error
    );
  }

  return sendError(res, {
    statusCode,
    message,
    errors: error.errors || [],
    requestId: req.requestId,
    stack: env.isDevelopment ? error.stack : undefined,
  });
};

module.exports = errorHandler;
