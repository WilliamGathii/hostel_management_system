import apiClient from '../../../services/api-client';
import {
  removeAccessToken,
  saveAccessToken,
} from '../../../utils/token-storage';

const getResponseData = (response) => response?.data || {};

export const login = async ({ email, password }) => {
  const response = await apiClient.post('/auth/login', { email, password });
  const data = getResponseData(response);

  if (data.token) {
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
