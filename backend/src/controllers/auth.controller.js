const authService = require('../services/auth.service');
const { sendSuccess } = require('../utils/api-response');

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.validatedBody);

    return sendSuccess(res, {
      message: result.passwordChangeRequired
        ? 'You must change your temporary password before continuing.'
        : 'Login successful',
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

const changeRequiredPassword = async (req, res, next) => {
  try {
    const result = await authService.changeRequiredPassword(
      req.passwordChangeUser,
      req.validatedBody
    );

    return sendSuccess(res, {
      message:
        'Your password has been changed. Please log in using your new password.',
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

const logout = (_req, res, next) => {
  try {
    const result = authService.logout();

    return sendSuccess(res, {
      message: 'Logout successful. Remove the access token from the client.',
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

const me = async (req, res, next) => {
  try {
    const account = await authService.getCurrentUser(req.user.id);
    const { profile, ...user } = account;

    return sendSuccess(res, {
      message: 'Current user retrieved successfully',
      data: {
        user,
        profile,
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  changeRequiredPassword,
  login,
  logout,
  me,
};
