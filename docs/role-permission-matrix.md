# Role Permission Matrix

This document defines planned permissions for the four confirmed roles in the Smart Hostel Management System. It is a design document only. No authentication middleware, route guards, frontend guards, or backend logic are created at this stage.

## Confirmed Roles

| Role | Description |
| --- | --- |
| Student | Hostel resident using student-facing services. |
| Admin | Hostel administrator managing operational records and approvals. |
| Maintenance Staff | Staff member responsible for assigned maintenance work. |
| Security Staff | Staff member responsible for visitor entry verification. |

No separate Warden, Finance, or Accounts role will be created in the first version.

## Permission Matrix

| Feature Area | Student | Admin | Maintenance Staff | Security Staff |
| --- | --- | --- | --- | --- |
| Register account | Allowed where enabled | Manage accounts | Not self-managed unless enabled | Not self-managed unless enabled |
| Log in | Yes | Yes | Yes | Yes |
| View own profile | Yes | Yes | Yes | Yes |
| Update own allowed profile fields | Yes | Yes | Yes | Yes |
| View all students | No | Yes | No | No |
| Manage student records | No | Yes | No | No |
| View own room allocation | Yes | Yes | No | No |
| View basic room information for own allocation | Yes | Yes | No | No |
| View all rooms | No | Yes | No | No |
| Create or update rooms | No | Yes | No | No |
| Allocate rooms | No | Yes | No | No |
| Change room allocations | No | Yes | No | No |
| End room allocations | No | Yes | No | No |
| Submit maintenance request | Yes | Yes | No | No |
| View own maintenance requests | Yes | Yes | No | No |
| View assigned maintenance requests | No | Yes | Yes | No |
| Assign maintenance requests | No | Yes | No | No |
| Update maintenance status | No | Yes | Assigned requests only | No |
| Register visitor | Yes | Yes | No | No |
| View own visitor requests | Yes | Yes | No | No |
| Approve or reject visitors | No | Yes | No | No |
| View approved visitors for verification | No | Yes | No | Yes |
| Record visitor entry time | No | Yes | No | Yes |
| Record visitor exit time | No | Yes | No | Yes |
| Create announcements | No | Yes | No | No |
| Publish announcements | No | Yes | No | No |
| View announcements | Yes | Yes | Yes | Yes |
| View own notifications | Yes | Yes | Yes | Yes |
| Submit simulated payment record | Yes | Yes | No | No |
| View own simulated payment history | Yes | Yes | No | No |
| Review simulated payment records | No | Yes | No | No |
| View reports | No | Yes | Limited maintenance data if enabled | Limited visitor data if enabled |
| View dashboard statistics | Own summary only | Full admin summary | Maintenance summary | Security summary |
| Manage roles and permissions | No | Yes | No | No |

## Role-Specific Rules

### Student

1. Students cannot book rooms.
2. Students cannot allocate rooms to themselves.
3. Students cannot change or end allocations.
4. Students can view only their own allocation, visitor requests, maintenance requests, notifications, and simulated payment history.

### Admin

1. Admin users control room allocation.
2. Admin users approve or reject visitors.
3. Admin users manage simulated payment records.
4. Admin users manage reports and general dashboard statistics.
5. Admin users handle duties that could otherwise belong to a Warden in this version.

### Maintenance Staff

1. Maintenance Staff can view assigned maintenance requests.
2. Maintenance Staff can update status and notes for assigned requests.
3. Maintenance Staff cannot approve visitors, allocate rooms, manage students, manage payments, or publish announcements.

### Security Staff

1. Security Staff can view approved visitors.
2. Security Staff can record visitor entry time.
3. Security Staff can record visitor exit time.
4. Security Staff cannot approve or reject visitors.
5. Security Staff cannot manage rooms, students, allocations, payments, maintenance assignments, or announcements.

## Permission Design Notes

1. Backend authorization should be enforced on every protected endpoint.
2. Frontend route guards should improve user experience but must not be the only protection.
3. JWT claims should include the user id and role.
4. Role checks should be centralized during implementation.
5. Ownership checks are required for student-owned records such as profile, allocation, visitors, maintenance requests, notifications, and simulated payment history.
6. Important changes should be recorded in audit logs where appropriate.
