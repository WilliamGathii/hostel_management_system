const jsonwebtoken = require('jsonwebtoken');

const { env } = require('../../src/config/env');
const {
  REQUIRED_PASSWORD_CHANGE_PURPOSE,
  signAuthToken,
  signRequiredPasswordChangeToken,
  verifyAuthToken,
  verifyRequiredPasswordChangeToken,
} = require('../../src/utils/jwt');

describe('JWT utilities', () => {
  test('creates and verifies a small authentication token', () => {
    const token = signAuthToken({
      id: '4cf59f0c-83b6-44f8-ad0d-8897fbe1d232',
      role: 'student',
      token_version: 3,
      password_hash: 'must-not-be-included',
    });
    const payload = verifyAuthToken(token);

    expect(payload.sub).toBe('4cf59f0c-83b6-44f8-ad0d-8897fbe1d232');
    expect(payload.role).toBe('student');
    expect(payload.purpose).toBe('access');
    expect(payload.credentialVersion).toBe(3);
    expect(payload.password_hash).toBeUndefined();
  });

  test('creates a restricted password-change token with no role', () => {
    const token = signRequiredPasswordChangeToken({
      id: '4cf59f0c-83b6-44f8-ad0d-8897fbe1d232',
      token_version: 4,
      role: 'student',
    });
    const payload = verifyRequiredPasswordChangeToken(token);

    expect(payload.sub).toBe('4cf59f0c-83b6-44f8-ad0d-8897fbe1d232');
    expect(payload.purpose).toBe(REQUIRED_PASSWORD_CHANGE_PURPOSE);
    expect(payload.credentialVersion).toBe(4);
    expect(payload.role).toBeUndefined();
    expect(() => verifyAuthToken(token)).toThrow('invalid token purpose');
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
