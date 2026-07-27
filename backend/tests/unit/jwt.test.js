const jsonwebtoken = require('jsonwebtoken');

const { env } = require('../../src/config/env');
const { signAuthToken, verifyAuthToken } = require('../../src/utils/jwt');

describe('JWT utilities', () => {
  test('creates and verifies a small authentication token', () => {
    const token = signAuthToken({
      id: '4cf59f0c-83b6-44f8-ad0d-8897fbe1d232',
      role: 'student',
      password_hash: 'must-not-be-included',
    });
    const payload = verifyAuthToken(token);

    expect(payload.sub).toBe('4cf59f0c-83b6-44f8-ad0d-8897fbe1d232');
    expect(payload.role).toBe('student');
    expect(payload.password_hash).toBeUndefined();
  });

  test('rejects an invalid token', () => {
    expect(() => verifyAuthToken('not-a-valid-token')).toThrow();
  });

  test('rejects an expired token', () => {
    const expiredToken = jsonwebtoken.sign({ role: 'student' }, env.jwtSecret, {
      algorithm: 'HS256',
      subject: 'expired-user-id',
      expiresIn: -1,
    });

    expect(() => verifyAuthToken(expiredToken)).toThrow('jwt expired');
  });
});
