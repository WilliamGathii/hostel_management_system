import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { Route, Routes } from 'react-router-dom';

import { ChangePasswordPage } from '../features/authentication/pages/ChangePasswordPage';
import { AuthLayout } from '../layouts/AuthLayout';
import { createAuthValue, renderWithAuth } from './test-utils';

const renderPage = (authValue) =>
  renderWithAuth(
    <Routes>
      <Route element={<AuthLayout />}>
        <Route element={<ChangePasswordPage />} path="/change-password" />
      </Route>
      <Route element={<div>Login destination</div>} path="/login" />
    </Routes>,
    {
      authValue,
      route: '/change-password',
    }
  );

const fillPasswords = async (user, password, confirmation = password) => {
  await user.type(screen.getByLabelText(/^New password/i), password);
  await user.type(
    screen.getByLabelText(/^Confirm new password/i),
    confirmation
  );
};

describe('required password-change page', () => {
  test('uses the authentication layout without application navigation', () => {
    renderPage(createAuthValue({ isPasswordChangeRequired: true }));

    expect(
      screen.getByRole('heading', { name: 'Create a new password' })
    ).toBeInTheDocument();
    expect(screen.queryByText('Workspace')).not.toBeInTheDocument();
    expect(screen.queryByText('Sign out')).not.toBeInTheDocument();
    expect(screen.queryByText(/email address/i)).not.toBeInTheDocument();
  });

  test('validates required and mismatched passwords', async () => {
    const user = userEvent.setup();
    renderPage(createAuthValue({ isPasswordChangeRequired: true }));

    await user.click(screen.getByRole('button', { name: 'Save new password' }));
    expect(
      await screen.findByText('New password is required')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Password confirmation is required')
    ).toBeInTheDocument();

    await fillPasswords(user, 'NewStudent456', 'Different456');
    await user.click(screen.getByRole('button', { name: 'Save new password' }));
    expect(await screen.findByText('Passwords must match')).toBeInTheDocument();
  });

  test('saves the password and redirects to login', async () => {
    const user = userEvent.setup();
    const changeRequiredPassword = vi
      .fn()
      .mockResolvedValue({ passwordChanged: true });
    renderPage(
      createAuthValue({
        isPasswordChangeRequired: true,
        changeRequiredPassword,
      })
    );

    await fillPasswords(user, 'NewStudent456');
    await user.click(screen.getByRole('button', { name: 'Save new password' }));

    await waitFor(() =>
      expect(changeRequiredPassword).toHaveBeenCalledWith({
        newPassword: 'NewStudent456',
        confirmPassword: 'NewStudent456',
      })
    );
    expect(await screen.findByText('Login destination')).toBeInTheDocument();
  });

  test('redirects an expired session to login', async () => {
    const user = userEvent.setup();
    const changeRequiredPassword = vi.fn().mockRejectedValue({
      message: 'Password-change session has expired',
      statusCode: 401,
      errors: [],
    });
    renderPage(
      createAuthValue({
        isPasswordChangeRequired: true,
        changeRequiredPassword,
      })
    );

    await fillPasswords(user, 'NewStudent456');
    await user.click(screen.getByRole('button', { name: 'Save new password' }));

    await waitFor(() => expect(changeRequiredPassword).toHaveBeenCalled());
    expect(await screen.findByText('Login destination')).toBeInTheDocument();
  });

  test('shows a safe server validation error', async () => {
    const user = userEvent.setup();
    const changeRequiredPassword = vi.fn().mockRejectedValue({
      message: 'New password must be different',
      statusCode: 422,
      errors: [
        {
          field: 'newPassword',
          message: 'New password must be different from the temporary password',
        },
      ],
    });
    renderPage(
      createAuthValue({
        isPasswordChangeRequired: true,
        changeRequiredPassword,
      })
    );

    await fillPasswords(user, 'Temporary123');
    await user.click(screen.getByRole('button', { name: 'Save new password' }));

    expect(
      await screen.findByText(
        'New password must be different from the temporary password'
      )
    ).toBeInTheDocument();
    expect(screen.queryByText('password_hash')).not.toBeInTheDocument();
  });
});
