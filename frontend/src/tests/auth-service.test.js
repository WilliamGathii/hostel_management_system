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
  registerStudent,
} from '../features/authentication/services/auth.service';
import { removeAccessToken, saveAccessToken } from '../utils/token-storage';

describe('frontend authentication service', () => {
  beforeEach(() => {
    apiClient.get.mockReset();
    apiClient.post.mockReset();
  });

  test('registration sends only backend-approved fields', async () => {
    apiClient.post.mockResolvedValue({
      data: {
        token: 'registration-token',
        user: { role: 'student' },
      },
    });

    await registerStudent({
      full_name: 'Student User',
      email: 'student@example.com',
      phone: '+254700000001',
      password: 'Student123',
      student_number: 'STU001',
      confirm_password: 'Student123',
      role: 'admin',
      account_status: 'suspended',
    });

    expect(apiClient.post).toHaveBeenCalledWith(
      '/auth/register',
      expect.objectContaining({
        full_name: 'Student User',
        student_number: 'STU001',
      })
    );
    expect(apiClient.post.mock.calls[0][1]).not.toHaveProperty('role');
    expect(apiClient.post.mock.calls[0][1]).not.toHaveProperty(
      'account_status'
    );
    expect(apiClient.post.mock.calls[0][1]).not.toHaveProperty(
      'confirm_password'
    );
    expect(saveAccessToken).toHaveBeenCalledWith('registration-token');
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
