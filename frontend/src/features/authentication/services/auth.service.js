import apiClient from '../../../services/api-client';
import {
  getPasswordChangeToken,
  removeAccessToken,
  removePasswordChangeToken,
  saveAccessToken,
  savePasswordChangeToken,
} from '../../../utils/token-storage';

const getResponseData = (response) => response?.data || {};

export const login = async ({ email, password }) => {
  const response = await apiClient.post('/auth/login', { email, password });
  const data = getResponseData(response);

  if (data.passwordChangeRequired && data.passwordChangeToken) {
    removeAccessToken();
    savePasswordChangeToken(data.passwordChangeToken);
  } else if (data.token) {
    removePasswordChangeToken();
    saveAccessToken(data.token);
  }

  return data;
};

export const logout = async () => {
  try {
    const response = await apiClient.post('/auth/logout');
    return getResponseData(response);
  } finally {
    removeAccessToken();
    removePasswordChangeToken();
  }
};

export const changeRequiredPassword = async ({
  newPassword,
  confirmPassword,
}) => {
  const token = getPasswordChangeToken();

  if (!token) {
    throw {
      message: 'Password-change session is missing',
      errors: [],
      statusCode: 401,
    };
  }

  try {
    const response = await apiClient.post(
      '/auth/change-required-password',
      {
        newPassword,
        confirmPassword,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    removePasswordChangeToken();
    return getResponseData(response);
  } catch (error) {
    if (error.statusCode === 401) {
      removePasswordChangeToken();
    }

    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await apiClient.get('/auth/me');
    return getResponseData(response);
  } catch (error) {
    if ([401, 403, 404].includes(error.statusCode)) {
      removeAccessToken();
    }

    throw error;
  }
};
