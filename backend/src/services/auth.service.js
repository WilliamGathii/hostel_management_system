const { env } = require('../config/env');
const userModel = require('../models/user.model');
const AppError = require('../utils/app-error');
const { signAuthToken } = require('../utils/jwt');
const { comparePassword } = require('../utils/password');

const ACTIVE_STATUS = 'active';

const createTokenResponse = (user) => ({
  token: signAuthToken(user),
  tokenType: 'Bearer',
  expiresIn: env.jwtExpiresIn,
});

const login = async ({ email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await userModel.findUserByEmailWithPassword(normalizedEmail);
  const credentialsAreValid =
    user && (await comparePassword(password, user.password_hash));

  if (!credentialsAreValid) {
    throw new AppError('Incorrect email or password', 401);
  }

  if (user.account_status !== ACTIVE_STATUS) {
    throw new AppError('Account is not active', 403);
  }

  const lastLoginAt = await userModel.updateLastLoginAt(user.id);
  const safeUser = { ...user };

  delete safeUser.password_hash;
  safeUser.last_login_at = lastLoginAt;

  return {
    ...createTokenResponse(safeUser),
    user: safeUser,
  };
};

const getCurrentUser = async (userId) => {
  const user = await userModel.findUserWithProfile(userId);

  if (!user) {
    throw new AppError('User account was not found', 404);
  }

  if (user.account_status !== ACTIVE_STATUS) {
    throw new AppError('Account is not active', 403);
  }

  return user;
};

const logout = () => ({
  sessionEnded: true,
});

module.exports = {
  login,
  getCurrentUser,
  logout,
};
