const { matchedData, validationResult } = require('express-validator');

const AppError = require('../utils/app-error');

const validateAllowedFields = (allowedFields, emptyMessage) => (value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Request body must be an object');
  }

  const fields = Object.keys(value);
  const unsupportedFields = fields.filter((field) => !allowedFields.has(field));

  if (unsupportedFields.length > 0) {
    throw new Error(`Unsupported field: ${unsupportedFields.join(', ')}`);
  }

  if (fields.length === 0) {
    throw new Error(emptyMessage);
  }

  return true;
};

const cleanMatchedData = (data) => {
  const rootValue = data[''];
  const cleaned = { ...data };

  delete cleaned[''];

  return rootValue && typeof rootValue === 'object' && !Array.isArray(rootValue)
    ? { ...rootValue, ...cleaned }
    : cleaned;
};

const handleValidation = (req, _res, next) => {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    const errors = result.array().map((error) => ({
      field: error.path || error.type,
      message: error.msg,
    }));

    next(new AppError('Validation failed', 422, errors));
    return;
  }

  req.validatedBody = cleanMatchedData(
    matchedData(req, { locations: ['body'] })
  );
  req.validatedParams = cleanMatchedData(
    matchedData(req, { locations: ['params'] })
  );
  req.validatedQuery = cleanMatchedData(
    matchedData(req, { locations: ['query'] })
  );
  next();
};

module.exports = {
  handleValidation,
  validateAllowedFields,
};
