# Student Field Matrix

This document confirms the fields used by Student Profile and Admin Student
Management.

## Student Identifier

The `:studentId` API path value uses `student_profiles.id`.

This matches the database design, where fields named `student_id` reference
`student_profiles.id`. The authenticated Student profile is found through
`student_profiles.user_id`.

## Field Matrix

| Field                     | Table              | Student response | Admin response | Student editable | Admin editable       | Required | Main validation                                  |
| ------------------------- | ------------------ | ---------------- | -------------- | ---------------- | -------------------- | -------- | ------------------------------------------------ |
| `id`                      | `student_profiles` | Yes              | Yes            | No               | No                   | Yes      | UUID                                             |
| `user_id`                 | `student_profiles` | Yes              | Yes            | No               | No                   | Yes      | UUID                                             |
| `student_number`          | `student_profiles` | Yes              | Yes            | No               | No                   | Yes      | Maximum 50 characters; unique                    |
| `course`                  | `student_profiles` | Yes              | Yes            | Yes              | No                   | No       | 2 to 150 characters when provided                |
| `year_of_study`           | `student_profiles` | Yes              | Yes            | Yes              | No                   | No       | Positive integer when provided                   |
| `emergency_contact_name`  | `student_profiles` | Yes              | Yes            | Yes              | No                   | No       | 2 to 150 characters when provided                |
| `emergency_contact_phone` | `student_profiles` | Yes              | Yes            | Yes              | No                   | No       | 7 to 30 supported phone characters when provided |
| `created_at`              | `student_profiles` | Yes              | Yes            | No               | No                   | Yes      | Database timestamp                               |
| `updated_at`              | `student_profiles` | Yes              | Yes            | No               | No                   | Yes      | Database timestamp                               |
| `full_name`               | `users`            | Yes              | Yes            | No               | No                   | Yes      | Read-only in Step 8                              |
| `email`                   | `users`            | Yes              | Yes            | No               | No                   | Yes      | Read-only authentication email                   |
| `phone`                   | `users`            | Yes              | Yes            | Yes              | No                   | No       | 7 to 30 supported phone characters when provided |
| `role`                    | `users`            | Yes              | Yes            | No               | No                   | Yes      | Must remain `student`                            |
| `account_status`          | `users`            | Yes              | Yes            | No               | Status endpoint only | Yes      | `active`, `suspended`, or `inactive`             |
| `last_login_at`           | `users`            | Yes              | Yes            | No               | No                   | No       | Database timestamp                               |
| `created_at`              | `users`            | Yes              | Yes            | No               | No                   | Yes      | Database timestamp                               |
| `updated_at`              | `users`            | Yes              | Yes            | No               | No                   | Yes      | Database timestamp                               |
| `password_hash`           | `users`            | No               | No             | No               | No                   | Yes      | Never returned                                   |

## Student Editable Fields

Students may update only:

- `phone`
- `course`
- `year_of_study`
- `emergency_contact_name`
- `emergency_contact_phone`

Optional profile fields may be cleared. Empty optional text is stored as
`null`.

## Protected Fields

Students cannot update:

- IDs
- Full name
- Email
- Student number
- Role
- Account status
- Password information
- Created or updated timestamps
- Last login time

Admins can update only `account_status` during Step 8. Student records are not
permanently deleted.

## Database Readiness

The existing authentication migration already creates `users` and
`student_profiles` with all required Step 8 fields.

It also includes:

- Unique email
- Unique student number
- Unique Student profile per user
- Account-status constraint
- Role constraint
- Account-status index

No new migration is required for Step 8.
