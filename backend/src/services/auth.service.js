const { env } = require('../config/env');
const userModel = require('../models/user.model');
const AppError = require('../utils/app-error');
const { signAuthToken } = require('../utils/jwt');
const { hashPassword, comparePassword } = require('../utils/password');

const STUDENT_ROLE = 'student';
const ACTIVE_STATUS = 'active';

const trimOptionalText = (value) =>
  typeof value === 'string' && value.trim() ? value.trim() : null;

const createTokenResponse = (user) => ({
  token: signAuthToken(user),
  tokenType: 'Bearer',
  expiresIn: env.jwtExpiresIn,
});

const getDuplicateMessage = (error) => {
  if (error.constraint === 'users_email_key') {
    return 'Email is already registered';
  }

  if (error.constraint === 'student_profiles_student_number_key') {
    return 'Student number is already registered';
  }

  return 'Account details already exist';
};

const registerStudent = async (registrationData) => {
  const email = registrationData.email.trim().toLowerCase();
  const studentNumber = registrationData.student_number.trim();

  if (await userModel.emailExists(email)) {
    throw new AppError('Email is already registered', 409);
  }

  if (await userModel.studentNumberExists(studentNumber)) {
    throw new AppError('Student number is already registered', 409);
  }

  const passwordHash = await hashPassword(registrationData.password);

  let account;

  try {
    account = await userModel.createStudentAccount({
      user: {
        fullName: registrationData.full_name.trim(),
        email,
        phone: trimOptionalText(registrationData.phone),
        passwordHash,
        role: STUDENT_ROLE,
        accountStatus: ACTIVE_STATUS,
      },
      profile: {
        studentNumber,
        course: trimOptionalText(registrationData.course),
        yearOfStudy: registrationData.year_of_study || null,
        emergencyContactName: trimOptionalText(
          registrationData.emergency_contact_name
        ),
        emergencyContactPhone: trimOptionalText(
          registrationData.emergency_contact_phone
        ),
      },
    });
  } catch (error) {
    if (error.code === '23505') {
      throw new AppError(getDuplicateMessage(error), 409);
    }

    throw error;
  }

  return {
    ...createTokenResponse(account.user),
    user: account.user,
    profile: account.profile,
  };
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
  registerStudent,
  login,
  getCurrentUser,
  logout,
};
