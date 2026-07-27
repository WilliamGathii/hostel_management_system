const { sendError } = require('../utils/api-response');

const notFound = (req, res) => {
  sendError(res, {
    statusCode: 404,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    requestId: req.requestId,
  });
};

module.exports = notFound;
