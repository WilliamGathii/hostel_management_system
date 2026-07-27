import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { Route, Routes } from 'react-router-dom';

import { RegisterPage } from '../features/authentication/pages/RegisterPage';
import { createAuthValue, renderWithAuth } from './test-utils';

const renderRegistration = (authValue) =>
  renderWithAuth(
    <Routes>
      <Route element={<RegisterPage />} path="/register" />
      <Route
        element={<div>Student dashboard destination</div>}
        path="/student/dashboard"
      />
    </Routes>,
    {
      authValue,
      route: '/register',
    }
  );

const fillRequiredRegistration = async (
  user,
  confirmPassword = 'Student123'
) => {
  await user.type(screen.getByLabelText(/full name/i), 'Student User');
  await user.type(
    screen.getByRole('textbox', { name: /email address/i }),
    'student@example.com'
  );
  await user.type(screen.getByLabelText(/phone number/i), '+254700000001');
  await user.type(screen.getByLabelText(/student number/i), 'STU001');
  await user.type(screen.getByLabelText(/^password/i), 'Student123');
  await user.type(screen.getByLabelText(/confirm password/i), confirmPassword);
};

describe('Student registration page', () => {
  test('shows required-field validation', async () => {
    const user = userEvent.setup();
    renderRegistration(createAuthValue());

    await user.click(
      screen.getByRole('button', { name: /create student account/i })
    );

    expect(
      await screen.findByText('Full name is required')
    ).toBeInTheDocument();
    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Student number is required')).toBeInTheDocument();
  });

  test('requires matching password confirmation', async () => {
    const user = userEvent.setup();
    renderRegistration(createAuthValue());

    await fillRequiredRegistration(user, 'Different123');
    await user.click(
      screen.getByRole('button', { name: /create student account/i })
    );

    expect(
      await screen.findByText('Passwords do not match')
    ).toBeInTheDocument();
  });

  test('does not submit role or confirmation fields', async () => {
    const user = userEvent.setup();
    const registerStudent = vi.fn().mockResolvedValue({
      token: 'test-token',
      user: { role: 'student' },
    });
    renderRegistration(createAuthValue({ registerStudent }));

    await fillRequiredRegistration(user);
    await user.click(
      screen.getByRole('button', { name: /create student account/i })
    );

    const request = registerStudent.mock.calls[0][0];

    expect(request).not.toHaveProperty('role');
    expect(request).not.toHaveProperty('confirm_password');
    expect(
      screen.queryByRole('combobox', { name: /role/i })
    ).not.toBeInTheDocument();
  });

  test('redirects after token-based registration', async () => {
    const user = userEvent.setup();
    const registerStudent = vi.fn().mockResolvedValue({
      token: 'test-token',
      user: { role: 'student' },
    });
    renderRegistration(createAuthValue({ registerStudent }));

    await fillRequiredRegistration(user);
    await user.click(
      screen.getByRole('button', { name: /create student account/i })
    );

    expect(
      await screen.findByText('Student dashboard destination')
    ).toBeInTheDocument();
  });

  test('shows backend validation errors near the matching field', async () => {
    const user = userEvent.setup();
    const registerStudent = vi.fn().mockRejectedValue({
      message: 'Validation failed',
      statusCode: 422,
      errors: [
        {
          field: 'email',
          message: 'Email is already registered',
        },
      ],
    });
    renderRegistration(createAuthValue({ registerStudent }));

    await fillRequiredRegistration(user);
    await user.click(
      screen.getByRole('button', { name: /create student account/i })
    );

    expect(
      await screen.findByText('Email is already registered')
    ).toBeInTheDocument();
    expect(screen.getByText('Validation failed')).toBeInTheDocument();
  });
});
