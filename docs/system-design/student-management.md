# Student Management

## 1. Student-Management Overview

Step 8 adds Student Profile and Admin Student Management. Admins create and
edit Student accounts. Public Student registration is not available.

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
link to each Student detail page. It also provides an Add Student action.

Admins create Student accounts with a name, email, Student number, temporary
password, and optional profile fields. New accounts always use the Student role
and active status. They must replace the temporary password at first login
before opening the Student dashboard.

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

The Admin Student detail page is available at `/admin/students/:studentId`.

It uses URL-based tabs so an Admin can open a section directly and use browser
history normally:

- `?tab=overview`
- `?tab=room`
- `?tab=payments`
- `?tab=maintenance`
- `?tab=visitors`

Overview is the default tab. It contains personal information, account
information, status controls, and small summaries based only on real API data.
The other tabs show records filtered by the selected `student_profiles.id`.
No records or totals are invented.

The Room tab shows the current allocation and allocation history. The
Maintenance and Visitors tabs link to the existing detail workflows. The
Payments tab shows the Student's simulated payment history and summary.

Admins can edit approved identity, contact, and profile fields. Role, account
status, password information, IDs, and timestamps remain protected.

Admins can permanently delete an account that was created by mistake when it
has no room allocation, maintenance, visitor, or payment history. Deletion
requires confirmation. An account with linked hostel records must be set to
inactive instead so its history remains available.

## 10. Account-Status Management

Admins can activate, suspend, or deactivate a Student account.

A status change requires confirmation. The frontend does not send a request
when the selected status is unchanged.

## 11. Role Permissions

Students can view and update only their own approved profile fields.

Admins can create, list, view, edit, and delete unused Student records. They can
also update Student account status.

Maintenance Staff and Security Staff cannot use Student-management endpoints
or pages.

## 12. API Endpoints

| Method   | Endpoint                             | Role    | Purpose                        |
| -------- | ------------------------------------ | ------- | ------------------------------ |
| `GET`    | `/api/v1/students/me`                | Student | View own profile               |
| `PATCH`  | `/api/v1/students/me`                | Student | Update approved profile fields |
| `GET`    | `/api/v1/students`                   | Admin   | Search and list students       |
| `POST`   | `/api/v1/students`                   | Admin   | Create a Student account       |
| `GET`    | `/api/v1/students/:studentId`        | Admin   | View one Student record        |
| `PATCH`  | `/api/v1/students/:studentId`        | Admin   | Edit approved Student fields   |
| `PATCH`  | `/api/v1/students/:studentId/status` | Admin   | Update account status          |
| `DELETE` | `/api/v1/students/:studentId`        | Admin   | Delete an unused Student       |

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

The Student Profile and Admin detail forms stack on smaller screens. Student
Detail tabs scroll within their own tab bar. Allocation, payment, maintenance,
and visitor tables change to stacked cards on smaller screens.

## 16. Student and Payment Navigation

The Student Payments tab includes an Add Payment Record action. It reuses the
shared payment form and locks the selected Student. The form confirms the
Student name and number and uses the Student's active allocation.

The global Admin Payments page includes a View Student action. It opens:

`/admin/students/:studentId?tab=payments`

## 17. Testing

Backend and frontend tests cover:

- Default and URL-selected tabs
- Student-scoped module filters
- Empty and populated payment history
- Locked contextual payment creation
- Desktop tables and mobile record cards
- Student and payment cross-navigation
- Protected fields and role-protected routes
- Admin-only deletion and confirmation
- Safe rejection when linked hostel records exist

## 18. Current Limitations

- Student full name and email are read-only.
- Student records with linked hostel history cannot be permanently deleted.
- Profile-image upload is not included.
- Password reset is not included.
