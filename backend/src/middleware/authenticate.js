const userModel = require('../models/user.model');
const AppError = require('../utils/app-error');
const { getBearerToken } = require('../utils/bearer-token');
const { verifyAuthToken } = require('../utils/jwt');

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

    if (user.must_change_password) {
      next(new AppError('Password change is required', 401));
      return;
    }

    if (
      Number(payload.credentialVersion ?? 0) !== Number(user.token_version ?? 0)
    ) {
      next(new AppError('Authentication token is invalid', 401));
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authenticate;
