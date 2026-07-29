import { beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('../services/api-client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock('../utils/token-storage', () => ({
  getPasswordChangeToken: vi.fn(),
  saveAccessToken: vi.fn(),
  savePasswordChangeToken: vi.fn(),
  removeAccessToken: vi.fn(),
  removePasswordChangeToken: vi.fn(),
}));

import apiClient from '../services/api-client';
import {
  changeRequiredPassword,
  getCurrentUser,
  login,
  logout,
} from '../features/authentication/services/auth.service';
import {
  getPasswordChangeToken,
  removeAccessToken,
  removePasswordChangeToken,
  saveAccessToken,
  savePasswordChangeToken,
} from '../utils/token-storage';

describe('frontend authentication service', () => {
  beforeEach(() => {
    apiClient.get.mockReset();
    apiClient.post.mockReset();
  });

  test('login saves the token after a successful response', async () => {
    apiClient.post.mockResolvedValue({
      data: {
        token: 'login-token',
        user: { role: 'student' },
      },
    });

    await login({
      email: 'student@example.com',
      password: 'Student123',
    });

    expect(saveAccessToken).toHaveBeenCalledWith('login-token');
    expect(removePasswordChangeToken).toHaveBeenCalled();
  });

  test('required-change login stores only the restricted token', async () => {
    apiClient.post.mockResolvedValue({
      data: {
        passwordChangeRequired: true,
        passwordChangeToken: 'restricted-test-token',
        user: { id: 'student-1', role: 'student' },
      },
    });

    const result = await login({
      email: 'student@example.com',
      password: 'Temporary123',
    });

    expect(result.passwordChangeRequired).toBe(true);
    expect(removeAccessToken).toHaveBeenCalled();
    expect(savePasswordChangeToken).toHaveBeenCalledWith(
      'restricted-test-token'
    );
    expect(saveAccessToken).not.toHaveBeenCalled();
  });

  test('submits a new password using the restricted token', async () => {
    getPasswordChangeToken.mockReturnValue('restricted-test-token');
    apiClient.post.mockResolvedValue({
      data: { passwordChanged: true },
    });

    await expect(
      changeRequiredPassword({
        newPassword: 'NewStudent456',
        confirmPassword: 'NewStudent456',
      })
    ).resolves.toEqual({ passwordChanged: true });

    expect(apiClient.post).toHaveBeenCalledWith(
      '/auth/change-required-password',
      {
        newPassword: 'NewStudent456',
        confirmPassword: 'NewStudent456',
      },
      {
        headers: {
          Authorization: 'Bearer restricted-test-token',
        },
      }
    );
    expect(removePasswordChangeToken).toHaveBeenCalled();
  });

  test('removes an expired restricted token', async () => {
    getPasswordChangeToken.mockReturnValue('expired-token');
    apiClient.post.mockRejectedValue({
      message: 'Password-change session has expired',
      errors: [],
      statusCode: 401,
    });

    await expect(
      changeRequiredPassword({
        newPassword: 'NewStudent456',
        confirmPassword: 'NewStudent456',
      })
    ).rejects.toMatchObject({ statusCode: 401 });

    expect(removePasswordChangeToken).toHaveBeenCalled();
  });

  test('logout removes the local token when the backend request fails', async () => {
    apiClient.post.mockRejectedValue({
      message: 'Network unavailable',
      errors: [],
      statusCode: null,
    });

    await expect(logout()).rejects.toMatchObject({
      message: 'Network unavailable',
    });
    expect(removeAccessToken).toHaveBeenCalled();
  });

  test('current-user failure clears an invalid token', async () => {
    apiClient.get.mockRejectedValue({
      message: 'Authentication token is invalid',
      errors: [],
      statusCode: 401,
    });

    await expect(getCurrentUser()).rejects.toMatchObject({ statusCode: 401 });
    expect(removeAccessToken).toHaveBeenCalled();
  });
});
