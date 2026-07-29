# API Contract

This document describes the planned REST API contract for the Smart Hostel Management System. It is for design only. No routes, controllers, services, middleware, models, or backend code are created in this step.

## API Standards

Base path:

```text
/api/v1
```

General rules:

1. Requests and responses use JSON.
2. Protected endpoints require a JWT bearer token.
3. Role checks must be enforced by the backend during implementation.
4. List endpoints should support pagination where needed.
5. Filters should use query parameters.
6. Error responses should use a consistent format.

## Common Success Response

```json
{
  "success": true,
  "message": "Request completed successfully",
  "data": {}
}
```

## Common Error Response

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": []
}
```

## Common Status Codes

| Code  | Meaning                                    |
| ----- | ------------------------------------------ |
| `200` | Request completed successfully.            |
| `201` | Resource created successfully.             |
| `400` | Invalid request.                           |
| `401` | User is not authenticated.                 |
| `403` | User is not allowed to perform the action. |
| `404` | Resource was not found.                    |
| `409` | Request conflicts with existing data.      |
| `422` | Validation failed.                         |
| `500` | Server error.                              |

## Authentication

| Method | Endpoint              | Purpose                              | Allowed Roles                                     | Main Request Fields | Main Response Fields | Validation Rules                                         | Status Codes                             |
| ------ | --------------------- | ------------------------------------ | ------------------------------------------------- | ------------------- | -------------------- | -------------------------------------------------------- | ---------------------------------------- |
| `POST` | `/api/v1/auth/login`  | Log in and receive a JWT.            | Public                                            | `email`, `password` | `user`, `token`      | Email and password are required. Account must be active. | `200`, `400`, `401`, `403`, `422`, `500` |
| `POST` | `/api/v1/auth/logout` | End the client session.              | Student, Admin, Maintenance Staff, Security Staff | None                | `message`            | JWT must be valid.                                       | `200`, `401`, `500`                      |
| `GET`  | `/api/v1/auth/me`     | View the current authenticated user. | Student, Admin, Maintenance Staff, Security Staff | None                | `user`, `profile`    | JWT must be valid.                                       | `200`, `401`, `404`, `500`               |

## Student Profile

| Method  | Endpoint                             | Purpose                                           | Allowed Roles | Main Request Fields                                                                     | Main Response Fields     | Validation Rules                                                                      | Status Codes                                           |
| ------- | ------------------------------------ | ------------------------------------------------- | ------------- | --------------------------------------------------------------------------------------- | ------------------------ | ------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `GET`   | `/api/v1/students/me`                | View own student profile.                         | Student       | None                                                                                    | `student`                | Student profile must belong to signed-in user.                                        | `200`, `401`, `403`, `404`, `500`                      |
| `PATCH` | `/api/v1/students/me`                | Update allowed own profile fields.                | Student       | `phone`, `course`, `year_of_study`, `emergency_contact_name`, `emergency_contact_phone` | `student`                | Only allowed fields can be changed.                                                   | `200`, `400`, `401`, `403`, `422`, `500`               |
| `GET`   | `/api/v1/students`                   | List students.                                    | Admin         | Query filters                                                                           | `students`, `pagination` | Filters must be valid.                                                                | `200`, `401`, `403`, `500`                             |
| `POST`  | `/api/v1/students`                   | Create a Student account.                         | Admin         | `full_name`, `email`, `student_number`, `password`; optional profile fields             | `student`                | Email and Student number must be unique. Role is always Student and status is active. | `201`, `400`, `401`, `403`, `409`, `422`, `500`        |
| `GET`   | `/api/v1/students/:studentId`        | View one student.                                 | Admin         | `studentId` path value                                                                  | `student`                | Student must exist.                                                                   | `200`, `401`, `403`, `404`, `500`                      |
| `PATCH` | `/api/v1/students/:studentId`        | Edit approved Student account and profile fields. | Admin         | `full_name`, `email`, `phone`, `student_number`, and optional profile fields            | `student`                | Role, status, password, IDs, and timestamps cannot be changed.                        | `200`, `400`, `401`, `403`, `404`, `409`, `422`, `500` |
| `PATCH` | `/api/v1/students/:studentId/status` | Change student account status.                    | Admin         | `account_status`                                                                        | `student`                | Status must be approved.                                                              | `200`, `400`, `401`, `403`, `404`, `422`, `500`        |

## Room Types

| Method  | Endpoint                                | Purpose                  | Allowed Roles | Main Request Fields                                         | Main Response Fields | Validation Rules                                                         | Status Codes                                    |
| ------- | --------------------------------------- | ------------------------ | ------------- | ----------------------------------------------------------- | -------------------- | ------------------------------------------------------------------------ | ----------------------------------------------- |
| `GET`   | `/api/v1/room-types`                    | List room types.         | Admin         | Optional `status` filter                                    | `room_types`         | Status must be `active` or `inactive`.                                   | `200`, `401`, `403`, `422`, `500`               |
| `GET`   | `/api/v1/room-types/:roomTypeId`        | View one room type.      | Admin         | `roomTypeId` path value                                     | `room_type`          | Room type must exist.                                                    | `200`, `401`, `403`, `404`, `500`               |
| `POST`  | `/api/v1/room-types`                    | Create a room type.      | Admin         | `code`, `name`, `monthly_rate`, `default_capacity`, details | `room_type`          | Code is one unique uppercase letter. Rate and capacity must be positive. | `201`, `401`, `403`, `409`, `422`, `500`        |
| `PATCH` | `/api/v1/room-types/:roomTypeId`        | Update room type values. | Admin         | `name`, `monthly_rate`, `default_capacity`, `description`   | `room_type`          | Code cannot be changed. Existing rooms and allocation rates stay saved.  | `200`, `401`, `403`, `404`, `409`, `422`, `500` |
| `PATCH` | `/api/v1/room-types/:roomTypeId/status` | Change room type status. | Admin         | `status`                                                    | `room_type`          | Status must be `active` or `inactive`.                                   | `200`, `401`, `403`, `404`, `409`, `422`, `500` |

## Rooms

| Method  | Endpoint                       | Purpose                     | Allowed Roles | Main Request Fields                                                                                            | Main Response Fields                                              | Validation Rules                                                                            | Status Codes                                    |
| ------- | ------------------------------ | --------------------------- | ------------- | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| `GET`   | `/api/v1/rooms`                | List and filter rooms.      | Admin         | `floor`, `room_type_id`, `room_type_code`, `operational_status`, `occupancy_status`, `search`, `page`, `limit` | `rooms`, `pagination`                                             | Filters must be valid. Rooms sort by floor, type code, then room number.                    | `200`, `401`, `403`, `422`, `500`               |
| `GET`   | `/api/v1/rooms/:roomId`        | View room details.          | Admin         | `roomId` path value                                                                                            | `room`                                                            | Room must exist.                                                                            | `200`, `401`, `403`, `404`, `500`               |
| `POST`  | `/api/v1/rooms`                | Create one structured room. | Admin         | `room_type_id`, `floor_number`, `room_number`, `description`                                                   | `room`                                                            | Room code and type, floor, and room combination must be unique.                             | `201`, `401`, `403`, `409`, `422`, `500`        |
| `POST`  | `/api/v1/rooms/bulk`           | Generate a batch of rooms.  | Admin         | `room_type_id`, `floor_number`, `starting_room_number`, `quantity`                                             | `created_count`, `floor_number`, `room_type`, first and last code | Type must be active. Final room number is at most 99. The whole batch uses one transaction. | `201`, `401`, `403`, `409`, `422`, `500`        |
| `PATCH` | `/api/v1/rooms/:roomId`        | Update safe room details.   | Admin         | `capacity`, `description`                                                                                      | `room`                                                            | Capacity cannot be below current occupancy.                                                 | `200`, `401`, `403`, `404`, `409`, `422`, `500` |
| `PATCH` | `/api/v1/rooms/:roomId/status` | Update operational status.  | Admin         | `status`                                                                                                       | `room`                                                            | Status is `active`, `under_maintenance`, or `inactive`.                                     | `200`, `401`, `403`, `404`, `409`, `422`, `500` |

## Room Allocations

| Method  | Endpoint                                | Purpose                       | Allowed Roles | Main Request Fields                                                 | Main Response Fields        | Validation Rules                                                                                                                                             | Status Codes                                           |
| ------- | --------------------------------------- | ----------------------------- | ------------- | ------------------------------------------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------ |
| `GET`   | `/api/v1/allocations/me`                | View own current allocation.  | Student       | None                                                                | `allocation`, `room`        | Allocation must belong to signed-in student.                                                                                                                 | `200`, `401`, `403`, `404`, `500`                      |
| `GET`   | `/api/v1/allocations`                   | List room allocations.        | Admin         | Query filters                                                       | `allocations`, `pagination` | Filters must be valid.                                                                                                                                       | `200`, `401`, `403`, `500`                             |
| `POST`  | `/api/v1/allocations`                   | Allocate a student to a room. | Admin         | `student_id`, `room_id`, `start_date`, `expected_end_date`, `notes` | `allocation`                | Student must not have another active allocation. Room must be active and have capacity. The current room-type rate is saved as `monthly_rate_at_allocation`. | `201`, `400`, `401`, `403`, `404`, `409`, `422`, `500` |
| `PATCH` | `/api/v1/allocations/:allocationId`     | Change allocation details.    | Admin         | `room_id`, `expected_end_date`, `notes`                             | `allocation`                | Allocation must exist. Room capacity must be available if room changes.                                                                                      | `200`, `400`, `401`, `403`, `404`, `409`, `422`, `500` |
| `PATCH` | `/api/v1/allocations/:allocationId/end` | End an active allocation.     | Admin         | `actual_end_date`, `notes`                                          | `allocation`                | Allocation must be active.                                                                                                                                   | `200`, `400`, `401`, `403`, `404`, `422`, `500`        |

## Maintenance

| Method  | Endpoint                                          | Purpose                        | Allowed Roles                     | Main Request Fields                           | Main Response Fields                 | Validation Rules                                                                      | Status Codes                                    |
| ------- | ------------------------------------------------- | ------------------------------ | --------------------------------- | --------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------- | ----------------------------------------------- |
| `POST`  | `/api/v1/maintenance-requests`                    | Submit a maintenance request.  | Student                           | `room_id`, `title`, `description`, `priority` | `maintenance_request`                | Room must match the student's allocation where required. Priority must be approved.   | `201`, `400`, `401`, `403`, `404`, `422`, `500` |
| `GET`   | `/api/v1/maintenance-requests/me`                 | View own maintenance requests. | Student                           | Query filters                                 | `maintenance_requests`, `pagination` | Filters must be valid.                                                                | `200`, `401`, `403`, `500`                      |
| `GET`   | `/api/v1/maintenance-requests`                    | List maintenance requests.     | Admin, Maintenance Staff          | Query filters                                 | `maintenance_requests`, `pagination` | Maintenance Staff should see assigned records only.                                   | `200`, `401`, `403`, `500`                      |
| `GET`   | `/api/v1/maintenance-requests/:requestId`         | View one maintenance request.  | Student, Admin, Maintenance Staff | `requestId` path value                        | `maintenance_request`, `updates`     | Student must own the request. Maintenance Staff must be assigned. Admin can view all. | `200`, `401`, `403`, `404`, `500`               |
| `PATCH` | `/api/v1/maintenance-requests/:requestId/assign`  | Assign request to staff.       | Admin                             | `assigned_staff_id`                           | `maintenance_request`                | Staff user must have Maintenance Staff role.                                          | `200`, `400`, `401`, `403`, `404`, `422`, `500` |
| `PATCH` | `/api/v1/maintenance-requests/:requestId/status`  | Update request status.         | Admin, Maintenance Staff          | `status`                                      | `maintenance_request`                | Status must be approved. Maintenance Staff must be assigned.                          | `200`, `400`, `401`, `403`, `404`, `422`, `500` |
| `POST`  | `/api/v1/maintenance-requests/:requestId/updates` | Add progress note.             | Admin, Maintenance Staff          | `status`, `note`                              | `maintenance_update`                 | Maintenance request must exist. Maintenance Staff must be assigned.                   | `201`, `400`, `401`, `403`, `404`, `422`, `500` |

## Visitors

| Method  | Endpoint                                   | Purpose                    | Allowed Roles                  | Main Request Fields                                                                                                                                   | Main Response Fields       | Validation Rules                                                             | Status Codes                                           |
| ------- | ------------------------------------------ | -------------------------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------ |
| `POST`  | `/api/v1/visitors`                         | Register a visitor.        | Student                        | `visitor_name`, `visitor_phone`, `identification_type`, `identification_number`, `visit_date`, `expected_entry_time`, `expected_exit_time`, `purpose` | `visitor`                  | Visit date and visitor details are required.                                 | `201`, `400`, `401`, `403`, `422`, `500`               |
| `GET`   | `/api/v1/visitors/me`                      | View own visitor requests. | Student                        | Query filters                                                                                                                                         | `visitors`, `pagination`   | Filters must be valid.                                                       | `200`, `401`, `403`, `500`                             |
| `GET`   | `/api/v1/visitors`                         | List visitors.             | Admin, Security Staff          | Query filters                                                                                                                                         | `visitors`, `pagination`   | Security Staff should only view approved visitors expected for verification. | `200`, `401`, `403`, `500`                             |
| `GET`   | `/api/v1/visitors/:visitorId`              | View one visitor record.   | Student, Admin, Security Staff | `visitorId` path value                                                                                                                                | `visitor`, `verifications` | Student must own visitor. Security Staff can view approved visitors.         | `200`, `401`, `403`, `404`, `500`                      |
| `PATCH` | `/api/v1/visitors/:visitorId/approval`     | Approve or reject visitor. | Admin                          | `approval_status`, `notes`                                                                                                                            | `visitor`                  | Status must be `approved` or `rejected`.                                     | `200`, `400`, `401`, `403`, `404`, `422`, `500`        |
| `POST`  | `/api/v1/visitors/:visitorId/verify-entry` | Record visitor entry.      | Security Staff                 | `entry_time`, `notes`                                                                                                                                 | `visitor_verification`     | Visitor must be approved. Security Staff cannot approve visitors.            | `201`, `400`, `401`, `403`, `404`, `409`, `422`, `500` |
| `PATCH` | `/api/v1/visitors/:visitorId/verify-exit`  | Record visitor exit.       | Security Staff                 | `exit_time`, `notes`                                                                                                                                  | `visitor_verification`     | Visitor must already be checked in. Exit time cannot be before entry time.   | `200`, `400`, `401`, `403`, `404`, `409`, `422`, `500` |

## Announcements

| Method   | Endpoint                                | Purpose                         | Allowed Roles                                     | Main Request Fields                                                       | Main Response Fields          | Validation Rules                                                       | Status Codes                                    |
| -------- | --------------------------------------- | ------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------- | ----------------------------- | ---------------------------------------------------------------------- | ----------------------------------------------- |
| `GET`    | `/api/v1/announcements`                 | View announcements.             | Student, Admin, Maintenance Staff, Security Staff | Query filters                                                             | `announcements`, `pagination` | Users should see announcements for their role or all users.            | `200`, `401`, `403`, `500`                      |
| `POST`   | `/api/v1/announcements`                 | Create announcement.            | Admin                                             | `title`, `message`, `target_role`, `published_at`, `expires_at`, `status` | `announcement`                | Title and message are required. Target role must be valid if provided. | `201`, `400`, `401`, `403`, `422`, `500`        |
| `PATCH`  | `/api/v1/announcements/:announcementId` | Update announcement.            | Admin                                             | `title`, `message`, `target_role`, `published_at`, `expires_at`, `status` | `announcement`                | Announcement must exist.                                               | `200`, `400`, `401`, `403`, `404`, `422`, `500` |
| `DELETE` | `/api/v1/announcements/:announcementId` | Delete or archive announcement. | Admin                                             | `announcementId` path value                                               | `message`                     | Announcement must exist.                                               | `200`, `401`, `403`, `404`, `500`               |

## Notifications

| Method  | Endpoint                                     | Purpose                             | Allowed Roles                                     | Main Request Fields         | Main Response Fields          | Validation Rules                            | Status Codes                      |
| ------- | -------------------------------------------- | ----------------------------------- | ------------------------------------------------- | --------------------------- | ----------------------------- | ------------------------------------------- | --------------------------------- |
| `GET`   | `/api/v1/notifications`                      | View own notifications.             | Student, Admin, Maintenance Staff, Security Staff | Query filters               | `notifications`, `pagination` | User can view own notifications only.       | `200`, `401`, `403`, `500`        |
| `PATCH` | `/api/v1/notifications/:notificationId/read` | Mark one notification as read.      | Student, Admin, Maintenance Staff, Security Staff | `notificationId` path value | `notification`                | Notification must belong to signed-in user. | `200`, `401`, `403`, `404`, `500` |
| `PATCH` | `/api/v1/notifications/read-all`             | Mark all own notifications as read. | Student, Admin, Maintenance Staff, Security Staff | None                        | `updated_count`               | User can update own notifications only.     | `200`, `401`, `403`, `500`        |

## Payment Placeholder

The payment endpoints are for simulated records only. They must not process real money or connect to M-Pesa, Stripe, PayPal, banks, cards, or any external payment provider.

| Method  | Endpoint                             | Purpose                            | Allowed Roles  | Main Request Fields                                                                                | Main Response Fields     | Validation Rules                                             | Status Codes                                    |
| ------- | ------------------------------------ | ---------------------------------- | -------------- | -------------------------------------------------------------------------------------------------- | ------------------------ | ------------------------------------------------------------ | ----------------------------------------------- |
| `GET`   | `/api/v1/payments/me`                | View own payment records.          | Student        | Query filters                                                                                      | `payments`, `pagination` | Student can view own records only.                           | `200`, `401`, `403`, `500`                      |
| `POST`  | `/api/v1/payments`                   | Submit simulated payment details.  | Student, Admin | `room_allocation_id`, `amount`, `payment_method`, `transaction_reference`, `payment_date`, `notes` | `payment`                | Amount must be positive. No real gateway fields are allowed. | `201`, `400`, `401`, `403`, `409`, `422`, `500` |
| `GET`   | `/api/v1/payments`                   | List simulated payment records.    | Admin          | Query filters                                                                                      | `payments`, `pagination` | Filters must be valid.                                       | `200`, `401`, `403`, `500`                      |
| `GET`   | `/api/v1/payments/:paymentId`        | View one simulated payment record. | Student, Admin | `paymentId` path value                                                                             | `payment`                | Student must own payment record. Admin can view all.         | `200`, `401`, `403`, `404`, `500`               |
| `PATCH` | `/api/v1/payments/:paymentId/status` | Update simulated payment status.   | Admin          | `payment_status`, `notes`                                                                          | `payment`                | Status must be approved.                                     | `200`, `400`, `401`, `403`, `404`, `422`, `500` |

## Reports

| Method | Endpoint                      | Purpose                                       | Allowed Roles                                     | Main Request Fields | Main Response Fields | Validation Rules                            | Status Codes               |
| ------ | ----------------------------- | --------------------------------------------- | ------------------------------------------------- | ------------------- | -------------------- | ------------------------------------------- | -------------------------- |
| `GET`  | `/api/v1/reports/dashboard`   | View dashboard statistics.                    | Student, Admin, Maintenance Staff, Security Staff | Query filters       | `stats`              | Role decides which statistics are returned. | `200`, `401`, `403`, `500` |
| `GET`  | `/api/v1/reports/rooms`       | View room availability and occupancy reports. | Admin                                             | Query filters       | `room_report`        | Filters must be valid.                      | `200`, `401`, `403`, `500` |
| `GET`  | `/api/v1/reports/allocations` | View room allocation reports.                 | Admin                                             | Query filters       | `allocation_report`  | Filters must be valid.                      | `200`, `401`, `403`, `500` |
| `GET`  | `/api/v1/reports/students`    | View the Student report.                      | Admin                                             | Query filters       | `student_report`     | Filters must be valid.                      | `200`, `401`, `403`, `500` |
| `GET`  | `/api/v1/reports/maintenance` | View maintenance request report.              | Admin                                             | Query filters       | `maintenance_report` | Filters must be valid.                      | `200`, `401`, `403`, `500` |
| `GET`  | `/api/v1/reports/visitors`    | View visitor report.                          | Admin                                             | Query filters       | `visitor_report`     | Filters must be valid.                      | `200`, `401`, `403`, `500` |
| `GET`  | `/api/v1/reports/payments`    | View simulated payment report.                | Admin                                             | Query filters       | `payment_report`     | Filters must be valid.                      | `200`, `401`, `403`, `500` |

## Audit Logs

| Method | Endpoint             | Purpose          | Allowed Roles | Main Request Fields | Main Response Fields       | Validation Rules                   | Status Codes               |
| ------ | -------------------- | ---------------- | ------------- | ------------------- | -------------------------- | ---------------------------------- | -------------------------- |
| `GET`  | `/api/v1/audit-logs` | View audit logs. | Admin         | Query filters       | `audit_logs`, `pagination` | Filters must be valid. Admin only. | `200`, `401`, `403`, `500` |

## Common Query Filters

The following filters may be used where relevant:

1. `page`
2. `limit`
3. `date_from`
4. `date_to`
5. `status`
6. `room_id`
7. `student_id`
8. `assigned_staff_id`
9. `role`

## API Design Notes

1. This contract is a planning document.
2. Endpoint names use plural nouns.
3. The backend must enforce authentication and role permissions.
4. The frontend may hide unavailable actions, but the backend must still block unauthorized requests.
5. Payment endpoints must remain simulated unless a later approved scope changes the project.
