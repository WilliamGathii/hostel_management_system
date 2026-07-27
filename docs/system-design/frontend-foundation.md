# Frontend Foundation

## Frontend Overview

The frontend provides the shared structure for the Hostel Management System.
It includes authentication pages, route protection, role navigation, shared UI
components, and placeholders for later features.

Full dashboards and system modules have not been built yet.

## React And Vite

The frontend uses React with Vite. Vite provides the local development server
and production build process.

## Tailwind CSS

Tailwind CSS is connected through the Vite plugin. It is used for responsive
layout, spacing, colours, form states, and navigation.

## Shared Theme

The shared theme is stored in `frontend/src/styles/theme.css`.

The main visual values are:

- Deep navy primary navigation.
- Soft grey-blue page backgrounds.
- White surfaces.
- Dark main text and muted secondary text.
- Green success states.
- Amber warning states.
- Red error states.
- Blue information states.
- Eight-pixel card radius.
- Soft card shadows.

These values can be changed centrally.

## React Router Structure

The router is stored in `frontend/src/routes/AppRouter.jsx`.

Public routes are:

- `/login`
- `/register`
- `/forgot-password`
- `/unauthorized`
- The not-found route

Authenticated routes are grouped by Student, Admin, Maintenance Staff, and
Security Staff.

## Authentication State

`AuthProvider` manages:

- The current user.
- Initial session loading.
- Login.
- Student registration.
- Logout.
- Current-user refresh.
- Safe authentication errors.

When the application starts, it checks for an access token. If a token exists,
the frontend calls `GET /auth/me`. The returned user and role are the source of
truth.

## Session Token Storage

The access token is stored in `sessionStorage` with the key
`hostel_access_token`.

Closing the browser tab may end the local session. The frontend does not store
passwords, password hashes, roles, or complete profiles in browser storage.

There is no refresh token and no "Remember me" option.

## API Client

The shared Axios client is stored in
`frontend/src/services/api-client.js`.

It:

- Uses `VITE_API_BASE_URL`.
- Sends JSON requests.
- Uses a request timeout.
- Adds the Bearer access token.
- Returns backend response data.
- Preserves safe backend validation errors.
- Does not log tokens, passwords, or request bodies.

The expected local API URL is:

```text
http://localhost:5000/api/v1
```

## Protected Routes

Protected routes wait for the initial authentication check. Unauthenticated
users are redirected to `/login`, and the attempted page is preserved where
practical.

## Role-Based Routes

Role routes use the role returned by `/auth/me`.

Approved role home paths are:

- Student: `/student/dashboard`
- Admin: `/admin/dashboard`
- Maintenance Staff: `/maintenance/dashboard`
- Security Staff: `/security/dashboard`

Users without permission are redirected to `/unauthorized`.

## Login Page

One login page is used for all four roles. It includes email, password,
password visibility, validation, loading, safe errors, and role-home
redirection.

## Student Registration Page

Public registration creates Student accounts only.

The page sends only fields accepted by the backend. It has no role selection,
account status, Admin options, staff options, room allocation, or payment
fields.

Password confirmation is checked in the frontend and is not sent to the
backend.

## Application Layout

Authenticated pages use one shared application layout. It includes the
desktop sidebar, sticky topbar, mobile navigation, user information, logout,
and nested route content.

## Desktop Sidebar

The sidebar is fixed on desktop. It displays only the links approved for the
current role and highlights the active route.

## Sticky Topbar

The topbar remains visible while the page scrolls. It shows the current page,
user name, role, and logout control.

## Mobile Navigation

Small screens use a fixed bottom navigation bar with only the most important
links for the current role. Essential role routes remain available through the
responsive layout.

## Placeholder Pages

Role dashboards and future modules currently use reusable placeholder pages.
They contain no fake statistics, charts, tables, records, or feature logic.

Complete role dashboards begin in Step 7. Other modules will be built in their
approved later steps.

## Frontend Testing

Vitest, Testing Library, jest-dom, user-event, and jsdom are configured.

Tests cover:

- Session token storage.
- Authentication service requests.
- Protected and role routes.
- Login validation and redirects.
- Student registration rules and errors.
- Role-specific navigation.
- Logout.
- Public support pages.

Tests mock API requests and do not require a real backend.

## Current Limitations

The first frontend version does not include:

- Complete dashboards.
- Student, room, allocation, maintenance, visitor, announcement, payment,
  report, or audit-log feature logic.
- Password reset.
- Email verification.
- Refresh tokens.
- Social login.
- Two-factor authentication.
- Email, SMS, or push notifications.
- Real payment processing.

The forgot-password page is only a placeholder. Notifications are planned as
in-app notifications only.

## Features Planned For Later

Step 7 will build the complete role dashboards. Later steps will replace each
module placeholder with its approved workflow.

The payment module will remain simulated and will not connect to a real payment
gateway.
