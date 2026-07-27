import { useCallback, useEffect, useMemo, useState } from 'react';

import * as authService from '../features/authentication/services/auth.service';
import { getAccessToken, removeAccessToken } from '../utils/token-storage';
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
  const [accessToken, setAccessToken] = useState(() => getAccessToken());
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const clearSession = useCallback(() => {
    removeAccessToken();
    setAccessToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const storedToken = getAccessToken();

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
        await authService.login(credentials);
        const account = await authService.getCurrentUser();
        const currentUser = combineAccount(account);

        setAccessToken(getAccessToken());
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

  const registerStudent = useCallback(
    async (registrationData) => {
      setAuthError(null);

      try {
        const result = await authService.registerStudent(registrationData);

        if (!result.token) {
          return {
            ...result,
            user: null,
          };
        }

        const account = await authService.getCurrentUser();
        const currentUser = combineAccount(account);

        setAccessToken(getAccessToken());
        setUser(currentUser);

        return {
          ...result,
          user: currentUser,
        };
      } catch (error) {
        clearSession();
        setAuthError(error);
        throw error;
      }
    },
    [clearSession]
  );

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
      isAuthenticated: Boolean(user && accessToken),
      isLoading,
      authError,
      login,
      registerStudent,
      logout,
      refreshUser,
    }),
    [
      accessToken,
      authError,
      isLoading,
      login,
      logout,
      refreshUser,
      registerStudent,
      user,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
