export const ACCESS_TOKEN_KEY = 'hostel_access_token';

const getSessionStorage = () =>
  typeof window === 'undefined' ? null : window.sessionStorage;

export const saveAccessToken = (token) => {
  const storage = getSessionStorage();

  if (!storage || typeof token !== 'string' || !token.trim()) {
    return;
  }

  storage.setItem(ACCESS_TOKEN_KEY, token);
};

export const getAccessToken = () =>
  getSessionStorage()?.getItem(ACCESS_TOKEN_KEY) || null;

export const removeAccessToken = () => {
  getSessionStorage()?.removeItem(ACCESS_TOKEN_KEY);
};
