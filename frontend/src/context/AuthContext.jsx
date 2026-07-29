import { useCallback, useEffect, useMemo, useState } from 'react';

import * as authService from '../features/authentication/services/auth.service';
import {
  getAccessToken,
  getPasswordChangeToken,
  removeAccessToken,
  removePasswordChangeToken,
} from '../utils/token-storage';
import { AuthContext } from './auth-context';

const combineAccount = (account) => {
  if (!account?.user) {
    return null;
  }

  return {
    ...account.user,
    profile: account.profile || null,
  };
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [passwordChangeToken, setPasswordChangeToken] = useState(() =>
    getPasswordChangeToken()
  );
  const [accessToken, setAccessToken] = useState(() =>
    getPasswordChangeToken() ? null : getAccessToken()
  );
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const clearSession = useCallback(() => {
    removeAccessToken();
    removePasswordChangeToken();
    setAccessToken(null);
    setPasswordChangeToken(null);
    setUser(null);
  }, []);

  const clearPasswordChangeSession = useCallback(() => {
    removePasswordChangeToken();
    setPasswordChangeToken(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const storedToken = getAccessToken();
    const storedPasswordChangeToken = getPasswordChangeToken();

    if (storedPasswordChangeToken) {
      removeAccessToken();
      setAccessToken(null);
      setPasswordChangeToken(storedPasswordChangeToken);
      setUser(null);
      return null;
    }

    if (!storedToken) {
      clearSession();
      return null;
    }

    try {
      const account = await authService.getCurrentUser();
      const currentUser = combineAccount(account);

      setAccessToken(storedToken);
      setUser(currentUser);
      setAuthError(null);
      return currentUser;
    } catch (error) {
      clearSession();
      setAuthError(error);
      throw error;
    }
  }, [clearSession]);

  useEffect(() => {
    let isActive = true;

    const loadSession = async () => {
      const storedPasswordChangeToken = getPasswordChangeToken();

      if (storedPasswordChangeToken) {
        removeAccessToken();

        if (isActive) {
          setAccessToken(null);
          setPasswordChangeToken(storedPasswordChangeToken);
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      if (!getAccessToken()) {
        if (isActive) {
          setIsLoading(false);
        }
        return;
      }

      try {
        const account = await authService.getCurrentUser();

        if (isActive) {
          setUser(combineAccount(account));
          setAccessToken(getAccessToken());
          setAuthError(null);
        }
      } catch (error) {
        if (isActive) {
          clearSession();
          setAuthError(error);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadSession();

    return () => {
      isActive = false;
    };
  }, [clearSession]);

  const login = useCallback(
    async (credentials) => {
      setAuthError(null);

      try {
        const loginResult = await authService.login(credentials);

        if (loginResult.passwordChangeRequired) {
          removeAccessToken();
          setAccessToken(null);
          setPasswordChangeToken(getPasswordChangeToken());
          setUser(null);
          return loginResult;
        }

        const account = await authService.getCurrentUser();
        const currentUser = combineAccount(account);

        setAccessToken(getAccessToken());
        setPasswordChangeToken(null);
        setUser(currentUser);
        return currentUser;
      } catch (error) {
        clearSession();
        setAuthError(error);
        throw error;
      }
    },
    [clearSession]
  );

  const changeRequiredPassword = useCallback(async (passwords) => {
    setAuthError(null);

    try {
      const result = await authService.changeRequiredPassword(passwords);
      return result;
    } catch (error) {
      setAuthError(error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    setAuthError(null);

    try {
      await authService.logout();
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user && accessToken && !passwordChangeToken),
      isPasswordChangeRequired: Boolean(
        passwordChangeToken && !accessToken && !user
      ),
      isLoading,
      authError,
      changeRequiredPassword,
      clearPasswordChangeSession,
      login,
      logout,
      refreshUser,
    }),
    [
      accessToken,
      authError,
      changeRequiredPassword,
      clearPasswordChangeSession,
      isLoading,
      login,
      logout,
      passwordChangeToken,
      refreshUser,
      user,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
