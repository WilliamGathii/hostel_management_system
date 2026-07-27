import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { Route, Routes } from 'react-router-dom';

import { LoginPage } from '../features/authentication/pages/LoginPage';
import { createAuthValue, renderWithAuth } from './test-utils';

const renderLogin = (authValue) =>
  renderWithAuth(
    <Routes>
      <Route element={<LoginPage />} path="/login" />
      <Route
        element={<div>Student dashboard destination</div>}
        path="/student/dashboard"
      />
    </Routes>,
    {
      authValue,
      route: '/login',
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
