const { env } = require('../config/env');
const userModel = require('../models/user.model');
const AppError = require('../utils/app-error');
const {
  signAuthToken,
  signRequiredPasswordChangeToken,
} = require('../utils/jwt');
const { comparePassword, hashPassword } = require('../utils/password');

const ACTIVE_STATUS = 'active';

const createTokenResponse = (user) => ({
  token: signAuthToken(user),
  tokenType: 'Bearer',
  expiresIn: env.jwtExpiresIn,
});

const removeCredentialFields = (user) => {
  const safeUser = { ...user };

  delete safeUser.password_hash;
  delete safeUser.token_version;

  return safeUser;
};

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

  if (user.must_change_password) {
    return {
      passwordChangeRequired: true,
      passwordChangeToken: signRequiredPasswordChangeToken(user),
      user: {
        id: user.id,
        name: user.full_name,
        role: user.role,
      },
    };
  }

  const lastLoginAt = await userModel.updateLastLoginAt(user.id);
  const safeUser = removeCredentialFields(user);
  safeUser.last_login_at = lastLoginAt;

  return {
    ...createTokenResponse(user),
    user: safeUser,
  };
};

const changeRequiredPassword = async (passwordChangeUser, { newPassword }) =>
  userModel.runInTransaction(async (database) => {
    const user = await userModel.findUserByIdWithPasswordForUpdate(
      passwordChangeUser.id,
      database
    );

    if (
      !user ||
      user.role !== 'student' ||
      user.account_status !== ACTIVE_STATUS ||
      !user.must_change_password ||
      Number(user.token_version ?? 0) !==
        Number(passwordChangeUser.token_version ?? 0)
    ) {
      throw new AppError('Password-change session is invalid', 401);
    }

    if (await comparePassword(newPassword, user.password_hash)) {
      throw new AppError('New password must be different', 422, [
        {
          field: 'newPassword',
          message: 'New password must be different from the temporary password',
        },
      ]);
    }

    const passwordHash = await hashPassword(newPassword);
    const updatedUser = await userModel.completeRequiredPasswordChange(
      user.id,
      passwordHash,
      user.token_version,
      database
    );

    if (!updatedUser) {
      throw new AppError('Password-change session is invalid', 401);
    }

    return {
      passwordChanged: true,
    };
  });

const getCurrentUser = async (userId) => {
  const user = await userModel.findUserWithProfile(userId);

  if (!user) {
    throw new AppError('User account was not found', 404);
  }

  if (user.account_status !== ACTIVE_STATUS) {
    throw new AppError('Account is not active', 403);
  }

  if (user.must_change_password) {
    throw new AppError('Password change is required', 401);
  }

  const { profile, ...account } = user;

  return {
    ...removeCredentialFields(account),
    profile,
  };
};

const logout = () => ({
  sessionEnded: true,
});

module.exports = {
  changeRequiredPassword,
  login,
  getCurrentUser,
  logout,
};
