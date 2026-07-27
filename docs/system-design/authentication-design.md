# Authentication Design

## Authentication Overview

The backend uses email and password authentication. Passwords are stored as
bcrypt hashes. After a successful login, the API returns one short-lived JSON
Web Token (JWT).

Authentication applies to these four approved roles:

- `student`
- `admin`
- `maintenance_staff`
- `security_staff`

The system does not have a Warden role or a Finance role.

## Admin-Controlled Student Registration

The system does not provide public Student registration. An authenticated
Admin creates Student accounts with `POST /api/v1/students`.

Required account fields:

- `full_name`
- `email`
- `password`
- `student_number`

Optional Student fields:

- `phone`
- `course`
- `year_of_study`
- `emergency_contact_name`
- `emergency_contact_phone`

The role is always Student and the initial account status is active. The
request cannot set another role or status.

The email and Student number must be unique. Account and profile creation use
one database transaction.

## Admin And Staff Account Rules

The first Admin is created with the local initial Admin setup script.
Maintenance Staff and Security Staff accounts will be created through a later
Admin user-management feature.

## Password Hashing

Passwords are hashed with bcrypt before database storage. The default bcrypt
cost is 12 rounds and can be changed with `BCRYPT_SALT_ROUNDS`.

Passwords must:

- Have at least 8 characters.
- Contain at least one letter.
- Contain at least one number.
- Not exceed 72 bytes.

Plain passwords and password hashes are never returned by the API.

## JWT Authentication

JWT access tokens use the HS256 algorithm. A token contains only:

- `sub`: the user ID.
- `role`: the role at login time.

The backend does not trust the token role by itself. Protected requests load
the current user from the database and check the current role and account
status.

`JWT_SECRET` is required outside automated tests. It must be a long,
unpredictable local or deployment secret and must never be committed.

## Bearer Token Format

Protected requests use this header:

```text
Authorization: Bearer <access-token>
```

Missing, malformed, invalid, and expired tokens return an authentication error.

## Token Expiry

The default access-token lifetime is `1h`. It can be changed with
`JWT_EXPIRES_IN`.

The first version uses access tokens only. Refresh tokens and token blacklists
are not included.

## Login Process

`POST /api/v1/auth/login` accepts an email and password.

The backend:

1. Normalises the email to lowercase.
2. Finds the account.
3. Compares the password with the bcrypt hash.
4. Checks that the account is active.
5. Updates `last_login_at`.
6. Returns a JWT and safe account details.

An incorrect email and an incorrect password return the same message. This
avoids revealing whether an email exists.

## Logout Behaviour

`POST /api/v1/auth/logout` requires a valid access token. The endpoint confirms
that the session has ended.

JWTs are stateless and are not stored by the backend. The frontend must remove
its token after logout.

## Current User Endpoint

`GET /api/v1/auth/me` requires a valid access token. It returns safe account
details and the matching Student or staff profile.

## Role-Based Access Control

The reusable authorization middleware accepts one or more approved roles.
Future protected routes can allow a single role or a role combination.

The middleware returns:

- `401` when authentication is missing.
- `403` when the current role is not allowed.

Feature-specific ownership and assignment checks will be added with their
features.

## Account Status Behaviour

Approved account statuses are:

- `active`
- `suspended`
- `inactive`

Only active accounts can log in or use protected routes. A suspended or
inactive account cannot keep using an older token.

## Initial Admin Setup

The first Admin is created locally with `npm run create:admin`.

The script requires:

- `DATABASE_URL`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_FULL_NAME`
- `ADMIN_STAFF_NUMBER`

`ADMIN_PHONE`, `ADMIN_DEPARTMENT`, and `ADMIN_JOB_TITLE` are optional. These
values remain local and are not added to `.env.example`.

The script refuses to run in production. It validates the details, hashes the
password, checks duplicates, and creates the Admin account and staff profile in
one transaction. It never prints the password or hash.

## Security Limitations

The first version does not include:

- Refresh tokens.
- Password reset.
- Email verification.
- Two-factor authentication.
- Social login.
- External identity providers.
- Server-side token revocation or blacklisting.

Changing an account to suspended or inactive still blocks an existing token
because every protected request checks the current database record.

## Features Planned For Later

Later steps may add Admin-managed staff accounts, frontend authentication
screens, password recovery, stronger deployment controls, rate limiting, and
more detailed audit logging.
