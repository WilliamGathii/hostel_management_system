import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { AuthContext } from '../context/auth-context';
import { ProtectedRoute } from '../routes/ProtectedRoute';
import { PasswordChangeRoute } from '../routes/PasswordChangeRoute';
import { PublicOnlyRoute } from '../routes/PublicOnlyRoute';
import { RoleRoute } from '../routes/RoleRoute';
import { createAuthValue } from './test-utils';

const renderRoutes = (authValue, route, routes) =>
  render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>{routes}</Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );

describe('route protection', () => {
  test('redirects unauthenticated users to login', () => {
    renderRoutes(
      createAuthValue(),
      '/student/dashboard',
      <>
        <Route element={<ProtectedRoute />}>
          <Route
            element={<div>Protected student page</div>}
            path="/student/dashboard"
          />
        </Route>
        <Route element={<div>Login page</div>} path="/login" />
      </>
    );

    expect(screen.getByText('Login page')).toBeInTheDocument();
  });

  test('allows authenticated users to open protected routes', () => {
    renderRoutes(
      createAuthValue({
        user: { role: 'student' },
        isAuthenticated: true,
      }),
      '/student/dashboard',
      <Route element={<ProtectedRoute />}>
        <Route
          element={<div>Protected student page</div>}
          path="/student/dashboard"
        />
      </Route>
    );

    expect(screen.getByText('Protected student page')).toBeInTheDocument();
  });

  test('redirects a restricted session away from protected routes', () => {
    renderRoutes(
      createAuthValue({
        isPasswordChangeRequired: true,
      }),
      '/student/dashboard',
      <>
        <Route element={<ProtectedRoute />}>
          <Route
            element={<div>Protected student page</div>}
            path="/student/dashboard"
          />
        </Route>
        <Route
          element={<div>Create password page</div>}
          path="/change-password"
        />
      </>
    );

    expect(screen.getByText('Create password page')).toBeInTheDocument();
    expect(
      screen.queryByText('Protected student page')
    ).not.toBeInTheDocument();
  });

  test('allows only a restricted session to open password change', () => {
    renderRoutes(
      createAuthValue({
        isPasswordChangeRequired: true,
      }),
      '/change-password',
      <Route element={<PasswordChangeRoute />}>
        <Route
          element={<div>Create password page</div>}
          path="/change-password"
        />
      </Route>
    );

    expect(screen.getByText('Create password page')).toBeInTheDocument();
  });

  test('redirects a missing restricted session from password change', () => {
    renderRoutes(
      createAuthValue(),
      '/change-password',
      <>
        <Route element={<PasswordChangeRoute />}>
          <Route
            element={<div>Create password page</div>}
            path="/change-password"
          />
        </Route>
        <Route element={<div>Login page</div>} path="/login" />
      </>
    );

    expect(screen.getByText('Login page')).toBeInTheDocument();
  });

  test('redirects a user with the wrong role to unauthorized', () => {
    renderRoutes(
      createAuthValue({
        user: { role: 'student' },
        isAuthenticated: true,
      }),
      '/admin/dashboard',
      <>
        <Route element={<RoleRoute allowedRoles={['admin']} />}>
          <Route element={<div>Admin page</div>} path="/admin/dashboard" />
        </Route>
        <Route element={<div>Unauthorized page</div>} path="/unauthorized" />
      </>
    );

    expect(screen.getByText('Unauthorized page')).toBeInTheDocument();
  });

  test('redirects authenticated users away from public-only routes', () => {
    renderRoutes(
      createAuthValue({
        user: { role: 'student' },
        isAuthenticated: true,
      }),
      '/login',
      <>
        <Route element={<PublicOnlyRoute />}>
          <Route element={<div>Login page</div>} path="/login" />
        </Route>
        <Route
          element={<div>Student dashboard</div>}
          path="/student/dashboard"
        />
      </>
    );

    expect(screen.getByText('Student dashboard')).toBeInTheDocument();
  });

  test('allows the completed password-change redirect to reach login', () => {
    renderRoutes(
      createAuthValue({
        isPasswordChangeRequired: true,
      }),
      {
        pathname: '/login',
        state: { passwordChangeFinished: true },
      },
      <>
        <Route element={<PublicOnlyRoute />}>
          <Route element={<div>Login page</div>} path="/login" />
        </Route>
        <Route
          element={<div>Create password page</div>}
          path="/change-password"
        />
      </>
    );

    expect(screen.getByText('Login page')).toBeInTheDocument();
    expect(screen.queryByText('Create password page')).not.toBeInTheDocument();
  });
});
