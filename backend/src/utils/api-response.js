const sendSuccess = (
  res,
  {
    statusCode = 200,
    message = 'Request completed successfully',
    data = {},
  } = {}
) =>
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });

const normalizeErrors = (errors) => {
  if (!errors) {
    return [];
  }

  return Array.isArray(errors) ? errors : [errors];
};

const sendError = (
  res,
  {
    statusCode = 500,
    message = 'Request failed',
    errors = [],
    requestId,
    stack,
  } = {}
) => {
  const responseBody = {
    success: false,
    message,
    errors: normalizeErrors(errors),
  };

  if (requestId) {
    responseBody.requestId = requestId;
  }

  if (stack && process.env.NODE_ENV !== 'production') {
    responseBody.stack = stack;
  }

  return res.status(statusCode).json(responseBody);
};

module.exports = {
  sendSuccess,
  sendError,
};
