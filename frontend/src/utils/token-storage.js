export const ACCESS_TOKEN_KEY = 'hostel_access_token';
export const PASSWORD_CHANGE_TOKEN_KEY = 'hostel_password_change_token';

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

export const savePasswordChangeToken = (token) => {
  const storage = getSessionStorage();

  if (!storage || typeof token !== 'string' || !token.trim()) {
    return;
  }

  storage.setItem(PASSWORD_CHANGE_TOKEN_KEY, token);
};

export const getPasswordChangeToken = () =>
  getSessionStorage()?.getItem(PASSWORD_CHANGE_TOKEN_KEY) || null;

export const removePasswordChangeToken = () => {
  getSessionStorage()?.removeItem(PASSWORD_CHANGE_TOKEN_KEY);
};
