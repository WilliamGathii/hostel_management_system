jest.mock('../../src/models/user.model', () => ({
  findUserByEmailWithPassword: jest.fn(),
  updateLastLoginAt: jest.fn(),
  findUserWithProfile: jest.fn(),
}));

jest.mock('../../src/utils/password', () => ({
  comparePassword: jest.fn(),
}));

jest.mock('../../src/utils/jwt', () => ({
  signAuthToken: jest.fn(() => 'signed-test-token'),
}));

const userModel = require('../../src/models/user.model');
const authService = require('../../src/services/auth.service');
const { signAuthToken } = require('../../src/utils/jwt');
const { comparePassword } = require('../../src/utils/password');

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

describe('authentication service', () => {
  beforeEach(() => {
    comparePassword.mockResolvedValue(true);
    userModel.updateLastLoginAt.mockResolvedValue('2026-07-27T12:00:00.000Z');
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
