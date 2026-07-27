const userModel = require('../models/user.model');
const AppError = require('../utils/app-error');
const { verifyAuthToken } = require('../utils/jwt');

const getBearerToken = (authorizationHeader) => {
  if (typeof authorizationHeader !== 'string') {
    return null;
  }

  const [scheme, token, extraValue] = authorizationHeader.trim().split(/\s+/);

  if (scheme !== 'Bearer' || !token || extraValue) {
    return null;
  }

  return token;
};

const authenticate = async (req, _res, next) => {
  const token = getBearerToken(req.get('authorization'));

  if (!token) {
    next(new AppError('Authentication token is required', 401));
    return;
  }

  let payload;

  try {
    payload = verifyAuthToken(token);
  } catch (error) {
    const message =
      error.name === 'TokenExpiredError'
        ? 'Authentication token has expired'
        : 'Authentication token is invalid';

    next(new AppError(message, 401));
    return;
  }

  if (!payload.sub) {
    next(new AppError('Authentication token is invalid', 401));
    return;
  }

  try {
    const user = await userModel.findUserById(payload.sub);

    if (!user) {
      next(new AppError('Authentication token is invalid', 401));
      return;
    }

    if (user.account_status !== 'active') {
      next(new AppError('Account is not active', 403));
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authenticate;
