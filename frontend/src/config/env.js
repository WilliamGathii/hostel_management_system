const LOCAL_API_BASE_URL = 'http://localhost:5000/api/v1';

const removeTrailingSlash = (value) => value.replace(/\/+$/, '');
const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const canUseLocalFallback =
  import.meta.env.DEV || import.meta.env.MODE === 'test';

if (!configuredApiBaseUrl) {
  const message = canUseLocalFallback
    ? `VITE_API_BASE_URL is not set. Using ${LOCAL_API_BASE_URL}.`
    : 'VITE_API_BASE_URL must be configured for this environment.';

  console.warn(message);
}

export const env = {
  apiBaseUrl: configuredApiBaseUrl
    ? removeTrailingSlash(configuredApiBaseUrl)
    : canUseLocalFallback
      ? LOCAL_API_BASE_URL
      : '',
};
