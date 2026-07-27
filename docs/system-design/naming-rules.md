# Naming Rules

This document defines simple naming rules for the Smart Hostel Management System. It is a design document only. No source code is created in this step.

## Database Naming

1. Table names use plural `snake_case`.
2. Column names use `snake_case`.
3. Primary keys use `id`.
4. Foreign keys use clear names such as `student_id`, `room_id`, `created_by`, `allocated_by`, and `verified_by`.
5. Status columns should use names that describe the module, such as `account_status`, `allocation_status`, `approval_status`, and `payment_status`.
6. Timestamp columns should use names such as `created_at`, `updated_at`, `submitted_at`, `completed_at`, `published_at`, and `expires_at`.
7. Join or tracking tables should have clear names such as `announcement_recipients` and `visitor_verifications`.

Examples:

- `student_profiles`
- `room_allocations`
- `maintenance_requests`
- `visitor_verifications`
- `audit_logs`

## Backend Naming

1. JavaScript variables use `camelCase`.
2. Function names use `camelCase`.
3. Classes use `PascalCase` if classes are used.
4. Files use lowercase names with hyphens or clear feature-based names.
5. Route paths use lowercase plural words.
6. Environment variables use `UPPER_SNAKE_CASE`.
7. Validation files should clearly name the feature they validate.
8. Test files should describe the feature being tested.

Examples:

- `studentId`
- `roomAllocation`
- `maintenance-request`
- `visitor-verification`
- `DATABASE_URL`
- `JWT_SECRET`

## Frontend Naming

1. React components use `PascalCase`.
2. Hooks start with `use`.
3. Service functions use `camelCase`.
4. Page files should have clear role or feature names.
5. CSS class names should follow one consistent format.
6. Feature folders should match the module names already created in `frontend/src/features`.
7. Shared UI components should have clear names that explain their purpose.

Examples:

- `StudentDashboard`
- `AdminDashboard`
- `useAuth`
- `getStudentProfile`
- `room-allocation-page`

## Git Naming

1. Feature branches use `feature/short-name`.
2. Fix branches use `fix/short-name`.
3. Hotfix branches use `hotfix/short-name`.
4. Commit messages should be short and simple.
5. Pull requests should target `develop` during development.
6. Feature work should not be pushed directly to `main`.
7. Major changes should be reviewed before merging.

Examples:

- `feature/system-design`
- `feature/authentication`
- `fix/frontend-lint`
- `hotfix/urgent-login-issue`

## API Naming

1. REST endpoints use plural nouns.
2. The API base path is `/api/v1`.
3. Use HTTP methods correctly.
4. `GET` is used to read data.
5. `POST` is used to create data or submit actions.
6. `PATCH` is used to update part of a resource.
7. `DELETE` is used to delete or archive a resource.
8. Use consistent success and error response formats.
9. Route parameters should clearly name the resource id.

Examples:

- `GET /api/v1/students`
- `GET /api/v1/rooms/:roomId`
- `POST /api/v1/allocations`
- `PATCH /api/v1/visitors/:visitorId/approval`
- `GET /api/v1/reports/payments`

## General Naming Notes

1. Names should be simple and easy to understand.
2. Avoid abbreviations unless they are common.
3. Use the same word for the same idea across the project.
4. Use `Admin`, not `Administrator`, when naming the approved role in documentation.
5. Use `payment placeholder` or `simulated payment` when describing payment features.
6. Do not name any first-version module after a real payment provider.
