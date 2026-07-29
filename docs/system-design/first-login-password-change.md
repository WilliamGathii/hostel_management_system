# First-Login Password Change

## Required Accounts

Student accounts created by an Admin use a temporary password and set
`must_change_password` to `true`. Existing accounts keep the default value
`false`. Public Student registration is not available in this version.

The Student must first log in with the temporary password. The temporary
password is never stored or returned as plain text.

## Login Behaviour

When `must_change_password` is `true`, login does not create a normal
application session. It returns a restricted password-change token and safe
basic Student information.

The restricted token:

- Expires after 10 minutes.
- Uses the purpose `required_password_change`.
- Includes the user ID and current credential version.
- Is accepted only by the required password-change endpoint.
- Cannot access dashboards or normal protected APIs.

Normal access tokens use the purpose `access` and include the current
credential version.

## Password Change

The endpoint is:

`POST /api/v1/auth/change-required-password`

The frontend route is:

`/change-password`

The frontend stores the restricted token in `sessionStorage` under a separate
key. It is never stored as the normal access token. The page uses the public
authentication layout and does not show application navigation.

The new password must:

- Have at least 8 characters.
- Include at least one letter.
- Include at least one number.
- Match its confirmation.
- Be no more than 72 bytes.
- Be different from the temporary password.

The password update uses one database transaction. It stores a bcrypt hash,
sets `must_change_password` to `false`, records `password_changed_at`, and
increases `token_version`.

The Student cannot access the dashboard until this update succeeds. After the
change, the restricted token and older access tokens are invalid. The Student
must log in again with the new password.

## Current Limitations

Email recovery, password-reset links, SMS, social login, multi-factor
authentication, and security questions are not included. This feature does not
change how the Admin communicates the temporary password to the Student.
