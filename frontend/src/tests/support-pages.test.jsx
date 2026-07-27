import { screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { ForgotPasswordPage } from '../pages/public/ForgotPasswordPage';
import { NotFoundPage } from '../pages/public/NotFoundPage';
import { UnauthorizedPage } from '../pages/public/UnauthorizedPage';
import { createAuthValue, renderWithAuth } from './test-utils';

describe('public support pages', () => {
  test('renders the unauthorized page', () => {
    renderWithAuth(<UnauthorizedPage />, {
      authValue: createAuthValue(),
    });

    expect(
      screen.getByRole('heading', { name: 'Access unavailable' })
    ).toBeInTheDocument();
  });

  test('renders the not-found page', () => {
    renderWithAuth(<NotFoundPage />, {
      authValue: createAuthValue(),
    });

    expect(
      screen.getByRole('heading', { name: 'We could not find that page' })
    ).toBeInTheDocument();
  });

  test('directs password reset requests to an administrator', () => {
    renderWithAuth(<ForgotPasswordPage />);

    expect(
      screen.getByText(/contact the system administrator to reset/i)
    ).toBeInTheDocument();
    expect(screen.queryByRole('form')).not.toBeInTheDocument();
  });
});
