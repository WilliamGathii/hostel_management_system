const authService = require('../services/auth.service');
const { sendSuccess } = require('../utils/api-response');

const register = async (req, res, next) => {
  try {
    const result = await authService.registerStudent(req.validatedBody);

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Student account registered successfully',
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.validatedBody);

    return sendSuccess(res, {
      message: 'Login successful',
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
  register,
  login,
  logout,
  me,
};
