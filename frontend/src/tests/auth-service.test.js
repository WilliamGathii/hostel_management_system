import { beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('../services/api-client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock('../utils/token-storage', () => ({
  saveAccessToken: vi.fn(),
  removeAccessToken: vi.fn(),
}));

import apiClient from '../services/api-client';
import {
  getCurrentUser,
  login,
  logout,
} from '../features/authentication/services/auth.service';
import { removeAccessToken, saveAccessToken } from '../utils/token-storage';

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
