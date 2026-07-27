# API Endpoint Design

This document lists the planned REST API endpoints for the Smart Hostel Management System. It is a design document only. No Express routes, controllers, middleware, or backend implementation files are created at this stage.

## API Conventions

- Base path: `/api`
- Request and response format: JSON
- Authentication: JWT bearer token for protected endpoints
- Authorization: role-based access control
- Roles: Student, Admin, Maintenance Staff, Security Staff
- Pagination should be used for list endpoints.
- Filters should use query parameters where relevant.

## Authentication Endpoints

| Method | Endpoint           | Purpose                                        | Roles               |
| ------ | ------------------ | ---------------------------------------------- | ------------------- |
| `POST` | `/api/auth/login`  | Authenticate a user and return a JWT.          | Public              |
| `POST` | `/api/auth/logout` | End the current client session.                | Authenticated users |
| `GET`  | `/api/auth/me`     | Return the current authenticated user profile. | Authenticated users |

## User and Role Endpoints

| Method  | Endpoint                | Purpose                                             | Roles |
| ------- | ----------------------- | --------------------------------------------------- | ----- |
| `GET`   | `/api/users`            | List user accounts.                                 | Admin |
| `GET`   | `/api/users/:id`        | View a user account.                                | Admin |
| `PATCH` | `/api/users/:id/status` | Activate, deactivate, or suspend a user account.    | Admin |
| `PATCH` | `/api/users/:id/role`   | Update a user role within the four confirmed roles. | Admin |

## Student and Profile Endpoints

| Method  | Endpoint            | Purpose                            | Roles   |
| ------- | ------------------- | ---------------------------------- | ------- |
| `GET`   | `/api/students`     | List student records.              | Admin   |
| `POST`  | `/api/students`     | Create a Student account.          | Admin   |
| `GET`   | `/api/students/:id` | View a student record.             | Admin   |
| `PATCH` | `/api/students/:id` | Update a student record.           | Admin   |
| `GET`   | `/api/students/me`  | View own student profile.          | Student |
| `PATCH` | `/api/students/me`  | Update allowed own profile fields. | Student |

## Room and Allocation Endpoints

Students do not book, allocate, change, or end room allocations. Admin users control allocation.

| Method  | Endpoint                   | Purpose                                                         | Roles   |
| ------- | -------------------------- | --------------------------------------------------------------- | ------- |
| `GET`   | `/api/rooms`               | List rooms with optional filters.                               | Admin   |
| `POST`  | `/api/rooms`               | Create a room record.                                           | Admin   |
| `GET`   | `/api/rooms/:id`           | View room details.                                              | Admin   |
| `PATCH` | `/api/rooms/:id`           | Update room details, capacity, or status.                       | Admin   |
| `GET`   | `/api/allocations`         | List room allocations.                                          | Admin   |
| `POST`  | `/api/allocations`         | Allocate a student to a room.                                   | Admin   |
| `GET`   | `/api/allocations/:id`     | View allocation details.                                        | Admin   |
| `PATCH` | `/api/allocations/:id`     | Change allocation details.                                      | Admin   |
| `PATCH` | `/api/allocations/:id/end` | End an active allocation.                                       | Admin   |
| `GET`   | `/api/allocations/me`      | View own current allocation and related basic room information. | Student |

## Maintenance Request Endpoints

| Method  | Endpoint                               | Purpose                                 | Roles                                             |
| ------- | -------------------------------------- | --------------------------------------- | ------------------------------------------------- |
| `POST`  | `/api/maintenance-requests`            | Submit a maintenance request.           | Student                                           |
| `GET`   | `/api/maintenance-requests/me`         | View own maintenance requests.          | Student                                           |
| `GET`   | `/api/maintenance-requests`            | List maintenance requests with filters. | Admin, Maintenance Staff                          |
| `GET`   | `/api/maintenance-requests/:id`        | View maintenance request details.       | Admin, assigned Maintenance Staff, owning Student |
| `PATCH` | `/api/maintenance-requests/:id/assign` | Assign a request to maintenance staff.  | Admin                                             |
| `PATCH` | `/api/maintenance-requests/:id/status` | Update request status.                  | Admin, assigned Maintenance Staff                 |
| `PATCH` | `/api/maintenance-requests/:id/notes`  | Add or update work notes.               | Admin, assigned Maintenance Staff                 |

## Visitor Endpoints

Security Staff can verify visitors but cannot approve or reject visitors.

| Method  | Endpoint                      | Purpose                                           | Roles                                 |
| ------- | ----------------------------- | ------------------------------------------------- | ------------------------------------- |
| `POST`  | `/api/visitors`               | Register a visitor request.                       | Student                               |
| `GET`   | `/api/visitors/me`            | View own visitor requests.                        | Student                               |
| `GET`   | `/api/visitors`               | List visitor requests with filters.               | Admin                                 |
| `GET`   | `/api/visitors/approved`      | List approved visitors for entry verification.    | Security Staff                        |
| `GET`   | `/api/visitors/:id`           | View visitor request details.                     | Admin, Security Staff, owning Student |
| `PATCH` | `/api/visitors/:id/approval`  | Approve or reject a visitor.                      | Admin                                 |
| `PATCH` | `/api/visitors/:id/check-in`  | Record visitor entry verification and entry time. | Security Staff                        |
| `PATCH` | `/api/visitors/:id/check-out` | Record visitor exit time.                         | Security Staff                        |

## Announcement and Notification Endpoints

| Method  | Endpoint                         | Purpose                       | Roles               |
| ------- | -------------------------------- | ----------------------------- | ------------------- |
| `GET`   | `/api/announcements`             | View published announcements. | Authenticated users |
| `POST`  | `/api/announcements`             | Create an announcement.       | Admin               |
| `GET`   | `/api/announcements/:id`         | View announcement details.    | Authenticated users |
| `PATCH` | `/api/announcements/:id`         | Update an announcement.       | Admin               |
| `PATCH` | `/api/announcements/:id/publish` | Publish an announcement.      | Admin               |
| `PATCH` | `/api/announcements/:id/expire`  | Expire an announcement.       | Admin               |
| `GET`   | `/api/notifications`             | View own notifications.       | Authenticated users |
| `PATCH` | `/api/notifications/:id/read`    | Mark a notification as read.  | Notification owner  |

## Simulated Payment Endpoints

The payment module is a placeholder only. These endpoints must not connect to M-Pesa, Stripe, PayPal, banks, cards, or any external payment provider.

| Method  | Endpoint                             | Purpose                                                | Roles                 |
| ------- | ------------------------------------ | ------------------------------------------------------ | --------------------- |
| `POST`  | `/api/simulated-payments`            | Submit a simulated payment record.                     | Student               |
| `GET`   | `/api/simulated-payments/me`         | View own simulated payment history.                    | Student               |
| `GET`   | `/api/simulated-payments`            | List simulated payment records with filters.           | Admin                 |
| `GET`   | `/api/simulated-payments/:id`        | View simulated payment details.                        | Admin, owning Student |
| `PATCH` | `/api/simulated-payments/:id/status` | Review, confirm, or reject a simulated payment record. | Admin                 |

## Report Endpoints

| Method | Endpoint                          | Purpose                                              | Roles               |
| ------ | --------------------------------- | ---------------------------------------------------- | ------------------- |
| `GET`  | `/api/reports/rooms/availability` | Room availability report.                            | Admin               |
| `GET`  | `/api/reports/rooms/occupancy`    | Room occupancy report.                               | Admin               |
| `GET`  | `/api/reports/allocations`        | Room allocation report.                              | Admin               |
| `GET`  | `/api/reports/students`           | Student report.                                      | Admin               |
| `GET`  | `/api/reports/maintenance`        | Maintenance request report.                          | Admin               |
| `GET`  | `/api/reports/visitors`           | Visitor report.                                      | Admin               |
| `GET`  | `/api/reports/simulated-payments` | Simulated payment report.                            | Admin               |
| `GET`  | `/api/dashboard/stats`            | General dashboard statistics for the signed-in role. | Authenticated users |

## Common Filters

Reports and list endpoints may support these filters where relevant:

- `date_from`
- `date_to`
- `status`
- `room_id`
- `student_id`
- `assigned_staff_id`
- `role`
- `page`
- `limit`

## Response Planning Notes

Final response shapes should be designed before implementation. Error responses should use a consistent structure such as:

```json
{
  "error": {
    "message": "Human-readable error message",
    "code": "ERROR_CODE"
  }
}
```

No API response contracts are implemented in this step.
