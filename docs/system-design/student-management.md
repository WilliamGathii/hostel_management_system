# Student Management

## 1. Student-Management Overview

Step 8 adds Student Profile and Admin Student Management. It uses the existing
`users` and `student_profiles` tables from the authentication migration.

The approved Student identifier in API paths is `student_profiles.id`.

## 2. Student Profile Page

The Student Profile page is available at `/student/profile`.

It shows the signed-in student's account summary and personal profile. The
Student can switch between view and edit modes. Loading, error, retry, success,
and validation states are included.

## 3. Student Editable Fields

Students can update only:

- Phone
- Course
- Year of study
- Emergency contact name
- Emergency contact phone

Optional values may be cleared.

## 4. Student Protected Fields

Students cannot change:

- Name
- Email
- Student number
- Role
- Account status
- IDs
- Account dates
- Last login date
- Password information

Password hashes are never returned through the Student API.

## 5. Admin Student List

The Admin Student list is available at `/admin/students`.

It shows safe account information, account status, registration date, and a
link to each Student detail page. Student deletion is not available.

## 6. Search

Admins can search by:

- Student name
- Student number
- Email

The frontend sends a search only when the Admin selects the Search button.

## 7. Status Filtering

Admins can filter Student accounts by:

- Active
- Suspended
- Inactive

The default option shows all statuses.

## 8. Pagination

The Student list uses page and limit query values. It returns:

- Current page
- Page size
- Total records
- Total pages

Previous and Next actions are disabled when the related page is unavailable.

## 9. Student Detail Page

The Admin Student detail page is available at
`/admin/students/:studentId`.

It displays only information returned by the API. It does not invent room,
maintenance, visitor, or payment records.

## 10. Account-Status Management

Admins can activate, suspend, or deactivate a Student account.

A status change requires confirmation. The frontend does not send a request
when the selected status is unchanged. Student records are not permanently
deleted in this version.

## 11. Role Permissions

Students can view and update only their own approved profile fields.

Admins can list Student records, view a Student record, and update Student
account status.

Maintenance Staff and Security Staff cannot use Student-management endpoints
or pages.

## 12. API Endpoints

| Method  | Endpoint                             | Role    | Purpose                        |
| ------- | ------------------------------------ | ------- | ------------------------------ |
| `GET`   | `/api/v1/students/me`                | Student | View own profile               |
| `PATCH` | `/api/v1/students/me`                | Student | Update approved profile fields |
| `GET`   | `/api/v1/students`                   | Admin   | Search and list students       |
| `GET`   | `/api/v1/students/:studentId`        | Admin   | View one Student record        |
| `PATCH` | `/api/v1/students/:studentId/status` | Admin   | Update account status          |

## 13. Validation

The backend validates:

- UUID path values
- Allowed update fields
- Phone length and supported characters
- Text length
- Positive year-of-study values
- Search length
- Pagination limits
- Approved account statuses

Unknown and protected update fields are rejected.

## 14. Security

JWT authentication is required for every Student-management endpoint.
Role-based middleware protects Student and Admin actions.

Database queries use parameters. API responses use an explicit safe field
list. Password hashes and internal database details are not returned.

## 15. Responsive Design

The Admin list uses a table on desktop and stacked cards on smaller screens.
Important Student information and the View details action remain available in
both layouts.

The Student Profile and Admin detail forms stack on smaller screens.

## 16. Backend Tests

Backend unit and integration tests cover:

- Student service permissions
- Safe response fields
- Profile updates
- Search and pagination
- Status filtering
- Status updates
- Validation
- Missing records
- Wrong-role access

The complete backend suite contains 87 passing tests across 9 test suites.

## 17. Frontend Tests

Frontend tests cover:

- Student service requests
- Profile loading and editing
- Protected fields
- Save and cancel behaviour
- Safe validation errors
- Admin list search, filtering, and pagination
- Desktop and mobile Student records
- Admin Student detail and status confirmation
- Role-protected routes
- Future module placeholders

The complete frontend suite contains 66 passing tests across 14 test files.

## 18. Live Testing Status

Live database testing was skipped because no local `DATABASE_URL`,
`TEST_DATABASE_URL`, or backend `.env` was available.

No credentials were guessed. Mocked backend and frontend tests were used.

## 19. Current Limitations

- Student full name and email are read-only.
- Admins cannot edit Student profile details.
- Student records cannot be permanently deleted.
- Profile-image upload is not included.
- Live database flow testing is not complete.

## 20. Features Planned for Later

Room allocation is not included in Step 8.

Maintenance, visitor, announcement, notification, simulated payment, report,
and audit-log records are also not included. Their existing frontend routes
remain placeholders until their approved development steps.
