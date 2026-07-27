jest.mock('../../src/models/user.model', () => ({
  emailExists: jest.fn(),
  studentNumberExists: jest.fn(),
  createStudentAccount: jest.fn(),
  findUserByEmailWithPassword: jest.fn(),
  updateLastLoginAt: jest.fn(),
  findUserWithProfile: jest.fn(),
}));

jest.mock('../../src/utils/password', () => ({
  hashPassword: jest.fn(),
  comparePassword: jest.fn(),
}));

jest.mock('../../src/utils/jwt', () => ({
  signAuthToken: jest.fn(() => 'signed-test-token'),
}));

const userModel = require('../../src/models/user.model');
const authService = require('../../src/services/auth.service');
const { signAuthToken } = require('../../src/utils/jwt');
const { hashPassword, comparePassword } = require('../../src/utils/password');

const studentUser = {
  id: 'student-user-id',
  full_name: 'Student User',
  email: 'student@example.com',
  phone: '+254700000001',
  role: 'student',
  account_status: 'active',
  last_login_at: null,
};

const studentProfile = {
  id: 'student-profile-id',
  user_id: studentUser.id,
  student_number: 'STU001',
};

const registrationData = {
  full_name: ' Student User ',
  email: ' STUDENT@EXAMPLE.COM ',
  phone: ' +254700000001 ',
  password: 'Student123',
  student_number: ' STU001 ',
  role: 'admin',
  account_status: 'suspended',
};

describe('authentication service', () => {
  beforeEach(() => {
    userModel.emailExists.mockResolvedValue(false);
    userModel.studentNumberExists.mockResolvedValue(false);
    hashPassword.mockResolvedValue('hashed-password');
    userModel.createStudentAccount.mockResolvedValue({
      user: studentUser,
      profile: studentProfile,
    });
    comparePassword.mockResolvedValue(true);
    userModel.updateLastLoginAt.mockResolvedValue('2026-07-27T12:00:00.000Z');
  });

  test('registers a Student and ignores submitted role and status fields', async () => {
    const result = await authService.registerStudent(registrationData);
    const accountInput = userModel.createStudentAccount.mock.calls[0][0];

    expect(accountInput.user).toMatchObject({
      email: 'student@example.com',
      passwordHash: 'hashed-password',
      role: 'student',
      accountStatus: 'active',
    });
    expect(accountInput.user.role).not.toBe(registrationData.role);
    expect(result.user.role).toBe('student');
    expect(result.token).toBe('signed-test-token');
    expect(result).not.toHaveProperty('password');
    expect(result).not.toHaveProperty('password_hash');
  });

  test('rejects a duplicate email', async () => {
    userModel.emailExists.mockResolvedValue(true);

    await expect(
      authService.registerStudent(registrationData)
    ).rejects.toMatchObject({
      statusCode: 409,
      message: 'Email is already registered',
    });
  });

  test('rejects a duplicate student number', async () => {
    userModel.studentNumberExists.mockResolvedValue(true);

    await expect(
      authService.registerStudent(registrationData)
    ).rejects.toMatchObject({
      statusCode: 409,
      message: 'Student number is already registered',
    });
  });

  test('returns a token and safe user details for valid login', async () => {
    userModel.findUserByEmailWithPassword.mockResolvedValue({
      ...studentUser,
      password_hash: 'hashed-password',
    });

    const result = await authService.login({
      email: ' STUDENT@EXAMPLE.COM ',
      password: 'Student123',
    });

    expect(comparePassword).toHaveBeenCalledWith(
      'Student123',
      'hashed-password'
    );
    expect(userModel.updateLastLoginAt).toHaveBeenCalledWith(studentUser.id);
    expect(signAuthToken).toHaveBeenCalled();
    expect(result.tokenType).toBe('Bearer');
    expect(result.user.last_login_at).toBe('2026-07-27T12:00:00.000Z');
    expect(result.user.password_hash).toBeUndefined();
  });

  test.each([
    ['unknown email', null, true],
    [
      'incorrect password',
      { ...studentUser, password_hash: 'hashed-password' },
      false,
    ],
  ])('uses a generic login error for %s', async (_name, user, matches) => {
    userModel.findUserByEmailWithPassword.mockResolvedValue(user);
    comparePassword.mockResolvedValue(matches);

    await expect(
      authService.login({
        email: 'student@example.com',
        password: 'Incorrect123',
      })
    ).rejects.toMatchObject({
      statusCode: 401,
      message: 'Incorrect email or password',
    });
  });

  test.each(['suspended', 'inactive'])(
    'rejects a user with %s status',
    async (accountStatus) => {
      userModel.findUserByEmailWithPassword.mockResolvedValue({
        ...studentUser,
        account_status: accountStatus,
        password_hash: 'hashed-password',
      });

      await expect(
        authService.login({
          email: 'student@example.com',
          password: 'Student123',
        })
      ).rejects.toMatchObject({
        statusCode: 403,
        message: 'Account is not active',
      });
    }
  );

  test('returns the current user with their profile', async () => {
    userModel.findUserWithProfile.mockResolvedValue({
      ...studentUser,
      profile: studentProfile,
    });

    await expect(authService.getCurrentUser(studentUser.id)).resolves.toEqual({
      ...studentUser,
      profile: studentProfile,
    });
  });
});
