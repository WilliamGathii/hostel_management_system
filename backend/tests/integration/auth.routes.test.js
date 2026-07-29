const request = require('supertest');
const jsonwebtoken = require('jsonwebtoken');

jest.mock('../../src/services/auth.service', () => ({
  changeRequiredPassword: jest.fn(),
  login: jest.fn(),
  logout: jest.fn(),
  getCurrentUser: jest.fn(),
}));

jest.mock('../../src/models/user.model', () => ({
  findUserById: jest.fn(),
}));

const app = require('../../src/app');
const userModel = require('../../src/models/user.model');
const authService = require('../../src/services/auth.service');
const AppError = require('../../src/utils/app-error');
const { env } = require('../../src/config/env');
const {
  signAuthToken,
  signRequiredPasswordChangeToken,
} = require('../../src/utils/jwt');

const activeUser = {
  id: 'route-test-user-id',
  full_name: 'Student User',
  email: 'student@example.com',
  role: 'student',
  account_status: 'active',
  must_change_password: false,
  token_version: 0,
};

describe('authentication routes', () => {
  beforeEach(() => {
    userModel.findUserById.mockResolvedValue(activeUser);
    authService.login.mockResolvedValue({
      token: 'login-test-token',
      tokenType: 'Bearer',
      expiresIn: '1h',
      user: activeUser,
    });
    authService.logout.mockReturnValue({ sessionEnded: true });
    authService.changeRequiredPassword.mockResolvedValue({
      passwordChanged: true,
    });
    authService.getCurrentUser.mockResolvedValue({
      ...activeUser,
      profile: {
        student_number: 'STU001',
      },
    });
  });

  test('POST /api/v1/auth/register is not publicly available', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'student@example.com', password: 'Student123' });

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('Route not found');
  });

  test('POST /api/v1/auth/login returns a token', async () => {
    const response = await request(app).post('/api/v1/auth/login').send({
      email: 'student@example.com',
      password: 'Student123',
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.tokenType).toBe('Bearer');
  });

  test('POST /api/v1/auth/login returns a password-change response without a normal token', async () => {
    authService.login.mockResolvedValue({
      passwordChangeRequired: true,
      passwordChangeToken: 'restricted-test-token',
      user: {
        id: activeUser.id,
        name: activeUser.full_name,
        role: 'student',
      },
    });

    const response = await request(app).post('/api/v1/auth/login').send({
      email: 'student@example.com',
      password: 'Temporary123',
    });

    expect(response.status).toBe(200);
    expect(response.body.data.passwordChangeRequired).toBe(true);
    expect(response.body.data).not.toHaveProperty('token');
    expect(response.body.data.user).not.toHaveProperty('password_hash');
  });

  test('a restricted token changes the required password', async () => {
    userModel.findUserById.mockResolvedValue({
      ...activeUser,
      must_change_password: true,
    });
    const token = signRequiredPasswordChangeToken(activeUser);

    const response = await request(app)
      .post('/api/v1/auth/change-required-password')
      .set('Authorization', `Bearer ${token}`)
      .send({
        newPassword: 'NewStudent456',
        confirmPassword: 'NewStudent456',
      });

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual({ passwordChanged: true });
    expect(response.body.data).not.toHaveProperty('token');
    expect(authService.changeRequiredPassword).toHaveBeenCalledWith(
      expect.objectContaining({
        id: activeUser.id,
        must_change_password: true,
      }),
      {
        newPassword: 'NewStudent456',
        confirmPassword: 'NewStudent456',
      }
    );
  });

  test('a restricted token cannot access a normal protected endpoint', async () => {
    const token = signRequiredPasswordChangeToken(activeUser);

    const response = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(401);
    expect(authService.getCurrentUser).not.toHaveBeenCalled();
  });

  test.each([
    ['invalid', 'not-a-token'],
    ['wrong purpose', signAuthToken(activeUser)],
  ])('rejects an %s password-change token', async (_label, token) => {
    const response = await request(app)
      .post('/api/v1/auth/change-required-password')
      .set('Authorization', `Bearer ${token}`)
      .send({
        newPassword: 'NewStudent456',
        confirmPassword: 'NewStudent456',
      });

    expect(response.status).toBe(401);
    expect(authService.changeRequiredPassword).not.toHaveBeenCalled();
  });

  test('rejects an expired password-change token', async () => {
    const token = jsonwebtoken.sign(
      {
        purpose: 'required_password_change',
        credentialVersion: 0,
      },
      env.jwtSecret,
      {
        algorithm: 'HS256',
        subject: activeUser.id,
        expiresIn: -1,
      }
    );

    const response = await request(app)
      .post('/api/v1/auth/change-required-password')
      .set('Authorization', `Bearer ${token}`)
      .send({
        newPassword: 'NewStudent456',
        confirmPassword: 'NewStudent456',
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Password-change session has expired');
  });

  test('rejects mismatched password confirmation', async () => {
    userModel.findUserById.mockResolvedValue({
      ...activeUser,
      must_change_password: true,
    });
    const token = signRequiredPasswordChangeToken(activeUser);

    const response = await request(app)
      .post('/api/v1/auth/change-required-password')
      .set('Authorization', `Bearer ${token}`)
      .send({
        newPassword: 'NewStudent456',
        confirmPassword: 'Different456',
      });

    expect(response.status).toBe(422);
    expect(authService.changeRequiredPassword).not.toHaveBeenCalled();
  });

  test('POST /api/v1/auth/login returns a generic credential error', async () => {
    authService.login.mockRejectedValue(
      new AppError('Incorrect email or password', 401)
    );

    const response = await request(app).post('/api/v1/auth/login').send({
      email: 'student@example.com',
      password: 'Incorrect123',
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Incorrect email or password');
  });

  test('POST /api/v1/auth/logout requires authentication', async () => {
    const response = await request(app).post('/api/v1/auth/logout');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  test('POST /api/v1/auth/logout acknowledges an authenticated logout', async () => {
    const token = signAuthToken(activeUser);
    const response = await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.sessionEnded).toBe(true);
  });

  test('GET /api/v1/auth/me returns the account and profile', async () => {
    const token = signAuthToken(activeUser);
    const response = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.user.email).toBe(activeUser.email);
    expect(response.body.data.profile.student_number).toBe('STU001');
    expect(response.body.data.user.password_hash).toBeUndefined();
  });
});
