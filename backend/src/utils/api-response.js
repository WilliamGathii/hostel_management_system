const sendSuccess = (res, statusCode, message, data = {}) =>
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });

const sendError = (res, statusCode, message, errors = []) =>
  res.status(statusCode).json({
    success: false,
    message,
    errors,
  });

module.exports = {
  sendSuccess,
  sendError,
};
