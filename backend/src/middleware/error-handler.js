const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  const statusCode = error.statusCode || error.status || 500;

  return res.status(statusCode).json({
    success: false,
    message: error.message || 'Request failed',
    errors: [],
  });
};

module.exports = errorHandler;
