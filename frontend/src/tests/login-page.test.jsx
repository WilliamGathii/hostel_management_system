import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { Route, Routes } from 'react-router-dom';

import { LoginPage } from '../features/authentication/pages/LoginPage';
import { createAuthValue, renderWithAuth } from './test-utils';

const renderLogin = (authValue, route = '/login') =>
  renderWithAuth(
    <Routes>
      <Route element={<LoginPage />} path="/login" />
      <Route
        element={<div>Student dashboard destination</div>}
        path="/student/dashboard"
      />
      <Route
        element={<div>Change password destination</div>}
        path="/change-password"
      />
    </Routes>,
    {
      authValue,
      route,
    }
  );

const fillLogin = async (user) => {
  await user.type(
    screen.getByRole('textbox', { name: /email address/i }),
    'student@example.com'
  );
  await user.type(screen.getByLabelText(/^password/i), 'Student123');
};

describe('login page', () => {
  test('shows required-field validation', async () => {
    const user = userEvent.setup();
    renderLogin(createAuthValue());

    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /create a student account/i })
    ).not.toBeInTheDocument();
  });

  test('shows invalid-email validation', async () => {
    const user = userEvent.setup();
    renderLogin(createAuthValue());

    await user.type(
      screen.getByRole('textbox', { name: /email address/i }),
      'invalid-email'
    );
    await user.type(screen.getByLabelText(/^password/i), 'Student123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(
      await screen.findByText('Enter a valid email address')
    ).toBeInTheDocument();
  });

  test('submits credentials and redirects by role', async () => {
    const user = userEvent.setup();
    const login = vi.fn().mockResolvedValue({ role: 'student' });
    renderLogin(createAuthValue({ login }));

    await fillLogin(user);
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(login).toHaveBeenCalledWith({
      email: 'student@example.com',
      password: 'Student123',
    });
    expect(
      await screen.findByText('Student dashboard destination')
    ).toBeInTheDocument();
  });

  test('redirects a temporary-password login to password change', async () => {
    const user = userEvent.setup();
    const login = vi.fn().mockResolvedValue({
      passwordChangeRequired: true,
      user: { id: 'student-1', role: 'student' },
    });
    renderLogin(createAuthValue({ login }));

    await fillLogin(user);
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(
      await screen.findByText('Change password destination')
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Student dashboard destination')
    ).not.toBeInTheDocument();
  });

  test('clears the restricted state after a completed password change', async () => {
    const clearPasswordChangeSession = vi.fn();
    renderLogin(
      createAuthValue({
        clearPasswordChangeSession,
        isPasswordChangeRequired: true,
      }),
      {
        pathname: '/login',
        state: {
          notice:
            'Your password has been changed. Log in using your new password.',
          noticeVariant: 'success',
          passwordChangeFinished: true,
        },
      }
    );

    expect(
      screen.getByText(
        'Your password has been changed. Log in using your new password.'
      )
    ).toBeInTheDocument();
    expect(clearPasswordChangeSession).toHaveBeenCalled();
  });

  test('shows a safe error for incorrect credentials', async () => {
    const user = userEvent.setup();
    const login = vi.fn().mockRejectedValue({
      message: 'Incorrect email or password',
      statusCode: 401,
    });
    renderLogin(createAuthValue({ login }));

    await fillLogin(user);
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(
      await screen.findByText('Incorrect email or password.')
    ).toBeInTheDocument();
    expect(screen.queryByText('Student123')).not.toBeInTheDocument();
  });
});
