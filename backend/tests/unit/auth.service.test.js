jest.mock('../../src/models/user.model', () => ({
  findUserByEmailWithPassword: jest.fn(),
  updateLastLoginAt: jest.fn(),
  findUserWithProfile: jest.fn(),
  findUserByIdWithPasswordForUpdate: jest.fn(),
  completeRequiredPasswordChange: jest.fn(),
  runInTransaction: jest.fn(),
}));

jest.mock('../../src/utils/password', () => ({
  comparePassword: jest.fn(),
  hashPassword: jest.fn(),
}));

jest.mock('../../src/utils/jwt', () => ({
  signAuthToken: jest.fn(() => 'signed-test-token'),
  signRequiredPasswordChangeToken: jest.fn(
    () => 'signed-password-change-token'
  ),
}));

const userModel = require('../../src/models/user.model');
const authService = require('../../src/services/auth.service');
const {
  signAuthToken,
  signRequiredPasswordChangeToken,
} = require('../../src/utils/jwt');
const { comparePassword, hashPassword } = require('../../src/utils/password');

const studentUser = {
  id: 'student-user-id',
  full_name: 'Student User',
  email: 'student@example.com',
  phone: '+254700000001',
  role: 'student',
  account_status: 'active',
  must_change_password: false,
  token_version: 0,
  last_login_at: null,
};

const studentProfile = {
  id: 'student-profile-id',
  user_id: studentUser.id,
  student_number: 'STU001',
};

describe('authentication service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    comparePassword.mockResolvedValue(true);
    hashPassword.mockResolvedValue('new-password-hash');
    userModel.updateLastLoginAt.mockResolvedValue('2026-07-27T12:00:00.000Z');
    userModel.runInTransaction.mockImplementation((work) =>
      work({ query: jest.fn() })
    );
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
    expect(signAuthToken).toHaveBeenCalledWith(
      expect.objectContaining({ token_version: 0 })
    );
    expect(result.tokenType).toBe('Bearer');
    expect(result.user.last_login_at).toBe('2026-07-27T12:00:00.000Z');
    expect(result.user.password_hash).toBeUndefined();
    expect(result.user.token_version).toBeUndefined();
  });

  test('returns only a restricted session when a password change is required', async () => {
    userModel.findUserByEmailWithPassword.mockResolvedValue({
      ...studentUser,
      must_change_password: true,
      password_hash: 'temporary-password-hash',
    });

    const result = await authService.login({
      email: 'student@example.com',
      password: 'Temporary123',
    });

    expect(signRequiredPasswordChangeToken).toHaveBeenCalledWith(
      expect.objectContaining({
        id: studentUser.id,
        token_version: 0,
      })
    );
    expect(signAuthToken).not.toHaveBeenCalled();
    expect(userModel.updateLastLoginAt).not.toHaveBeenCalled();
    expect(result).toEqual({
      passwordChangeRequired: true,
      passwordChangeToken: 'signed-password-change-token',
      user: {
        id: studentUser.id,
        name: studentUser.full_name,
        role: 'student',
      },
    });
    expect(result).not.toHaveProperty('token');
    expect(result.user).not.toHaveProperty('password_hash');
  });

  test('changes the temporary password and increases the credential version', async () => {
    const database = { query: jest.fn() };
    userModel.runInTransaction.mockImplementation((work) => work(database));
    userModel.findUserByIdWithPasswordForUpdate.mockResolvedValue({
      ...studentUser,
      must_change_password: true,
      password_hash: 'temporary-password-hash',
    });
    userModel.completeRequiredPasswordChange.mockResolvedValue({
      ...studentUser,
      must_change_password: false,
      password_changed_at: '2026-07-29T10:00:00.000Z',
      token_version: 1,
    });
    comparePassword.mockResolvedValue(false);

    await expect(
      authService.changeRequiredPassword(
        { ...studentUser, must_change_password: true },
        { newPassword: 'NewStudent456' }
      )
    ).resolves.toEqual({ passwordChanged: true });

    expect(hashPassword).toHaveBeenCalledWith('NewStudent456');
    expect(userModel.completeRequiredPasswordChange).toHaveBeenCalledWith(
      studentUser.id,
      'new-password-hash',
      0,
      database
    );
  });

  test('does not allow the temporary password to be reused', async () => {
    userModel.findUserByIdWithPasswordForUpdate.mockResolvedValue({
      ...studentUser,
      must_change_password: true,
      password_hash: 'temporary-password-hash',
    });
    comparePassword.mockResolvedValue(true);

    await expect(
      authService.changeRequiredPassword(
        { ...studentUser, must_change_password: true },
        { newPassword: 'Temporary123' }
      )
    ).rejects.toMatchObject({
      statusCode: 422,
      message: 'New password must be different',
    });
    expect(hashPassword).not.toHaveBeenCalled();
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

    const result = await authService.getCurrentUser(studentUser.id);

    expect(result).toMatchObject({
      id: studentUser.id,
      email: studentUser.email,
      profile: studentProfile,
    });
    expect(result).not.toHaveProperty('token_version');
  });
});
