const jsonwebtoken = require('jsonwebtoken');

jest.mock('../../src/models/user.model', () => ({
  findUserById: jest.fn(),
}));

const { env } = require('../../src/config/env');
const authenticate = require('../../src/middleware/authenticate');
const userModel = require('../../src/models/user.model');
const { signAuthToken } = require('../../src/utils/jwt');

const activeUser = {
  id: 'database-user-id',
  email: 'student@example.com',
  role: 'student',
  account_status: 'active',
  must_change_password: false,
  token_version: 0,
};

const createRequest = (authorization) => ({
  get: jest.fn(() => authorization),
});

describe('authentication middleware', () => {
  test('rejects a missing token', async () => {
    const next = jest.fn();

    await authenticate(createRequest(undefined), {}, next);

    expect(next.mock.calls[0][0]).toMatchObject({ statusCode: 401 });
  });

  test('rejects an invalid token', async () => {
    const next = jest.fn();

    await authenticate(createRequest('Bearer invalid-token'), {}, next);

    expect(next.mock.calls[0][0]).toMatchObject({
      statusCode: 401,
      message: 'Authentication token is invalid',
    });
  });

  test('rejects an expired token', async () => {
    const token = jsonwebtoken.sign({ role: 'student' }, env.jwtSecret, {
      algorithm: 'HS256',
      subject: activeUser.id,
      expiresIn: -1,
    });
    const next = jest.fn();

    await authenticate(createRequest(`Bearer ${token}`), {}, next);

    expect(next.mock.calls[0][0]).toMatchObject({
      statusCode: 401,
      message: 'Authentication token has expired',
    });
  });

  test('attaches the current database user for a valid token', async () => {
    const token = signAuthToken({
      id: activeUser.id,
      role: 'admin',
    });
    const req = createRequest(`Bearer ${token}`);
    const next = jest.fn();

    userModel.findUserById.mockResolvedValue(activeUser);

    await authenticate(req, {}, next);

    expect(userModel.findUserById).toHaveBeenCalledWith(activeUser.id);
    expect(req.user).toEqual(activeUser);
    expect(req.user.role).toBe('student');
    expect(next).toHaveBeenCalledWith();
  });

  test('rejects a token after its user is deleted', async () => {
    const token = signAuthToken(activeUser);
    const next = jest.fn();

    userModel.findUserById.mockResolvedValue(null);

    await authenticate(createRequest(`Bearer ${token}`), {}, next);

    expect(next.mock.calls[0][0]).toMatchObject({ statusCode: 401 });
  });

  test('rejects an older token after the credential version changes', async () => {
    const token = signAuthToken(activeUser);
    const next = jest.fn();

    userModel.findUserById.mockResolvedValue({
      ...activeUser,
      token_version: 1,
    });

    await authenticate(createRequest(`Bearer ${token}`), {}, next);

    expect(next.mock.calls[0][0]).toMatchObject({ statusCode: 401 });
  });

  test('rejects normal access while a password change is required', async () => {
    const token = signAuthToken(activeUser);
    const next = jest.fn();

    userModel.findUserById.mockResolvedValue({
      ...activeUser,
      must_change_password: true,
    });

    await authenticate(createRequest(`Bearer ${token}`), {}, next);

    expect(next.mock.calls[0][0]).toMatchObject({
      statusCode: 401,
      message: 'Password change is required',
    });
  });

  test.each(['suspended', 'inactive'])(
    'rejects a token after its user becomes %s',
    async (accountStatus) => {
      const token = signAuthToken(activeUser);
      const next = jest.fn();

      userModel.findUserById.mockResolvedValue({
        ...activeUser,
        account_status: accountStatus,
      });

      await authenticate(createRequest(`Bearer ${token}`), {}, next);

      expect(next.mock.calls[0][0]).toMatchObject({ statusCode: 403 });
    }
  );
});
