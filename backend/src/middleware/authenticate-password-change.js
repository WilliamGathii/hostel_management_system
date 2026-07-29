const userModel = require('../models/user.model');
const AppError = require('../utils/app-error');
const { getBearerToken } = require('../utils/bearer-token');
const { verifyRequiredPasswordChangeToken } = require('../utils/jwt');

const authenticatePasswordChange = async (req, _res, next) => {
  const token = getBearerToken(req.get('authorization'));

  if (!token) {
    next(new AppError('Password-change session is required', 401));
    return;
  }

  let payload;

  try {
    payload = verifyRequiredPasswordChangeToken(token);
  } catch (error) {
    const message =
      error.name === 'TokenExpiredError'
        ? 'Password-change session has expired'
        : 'Password-change session is invalid';

    next(new AppError(message, 401));
    return;
  }

  if (!payload.sub) {
    next(new AppError('Password-change session is invalid', 401));
    return;
  }

  try {
    const user = await userModel.findUserById(payload.sub);

    if (
      !user ||
      user.role !== 'student' ||
      user.account_status !== 'active' ||
      !user.must_change_password ||
      Number(payload.credentialVersion ?? -1) !==
        Number(user.token_version ?? 0)
    ) {
      next(new AppError('Password-change session is invalid', 401));
      return;
    }

    req.passwordChangeUser = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authenticatePasswordChange;
