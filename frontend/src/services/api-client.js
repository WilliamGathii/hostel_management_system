import axios from 'axios';

import { env } from '../config/env';
import { normalizeApiError } from '../utils/api-error';
import { getAccessToken } from '../utils/token-storage';

const apiClient = axios.create({
  baseURL: env.apiBaseUrl || undefined,
  timeout: 10000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  if (!env.apiBaseUrl) {
    return Promise.reject({
      message: 'The API address is not configured.',
      errors: [],
      statusCode: null,
    });
  }

  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(normalizeApiError(error))
);

export default apiClient;
