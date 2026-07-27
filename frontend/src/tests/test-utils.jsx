import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import { AuthContext } from '../context/auth-context';

export const createAuthValue = (overrides = {}) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  authError: null,
  login: vi.fn(),
  logout: vi.fn(),
  refreshUser: vi.fn(),
  ...overrides,
});

export const renderWithAuth = (
  ui,
  { authValue = createAuthValue(), route = '/' } = {}
) =>
  render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </AuthContext.Provider>
  );
