# RBAC Matrix

This document describes planned role-based access control for the Smart Hostel Management System. It is a design document only. No middleware, route guards, frontend guards, or authentication code are created in this step.

## Approved Roles

The system will use only these roles:

1. Student.
2. Admin.
3. Maintenance Staff.
4. Security Staff.

There is no separate Warden role. There is no separate Finance or Accounts role.

## Permission Labels

| Label | Meaning |
| --- | --- |
| Allowed | The role can perform the action. |
| Own records only | The role can perform the action only for records that belong to them. |
| Assigned records only | The role can perform the action only for records assigned to them. |
| Not allowed | The role cannot perform the action. |

## Permission Matrix

| Permission | Student | Admin | Maintenance Staff | Security Staff |
| --- | --- | --- | --- | --- |
| Register an account | Allowed | Allowed | Not allowed | Not allowed |
| Log in | Allowed | Allowed | Allowed | Allowed |
| View own profile | Own records only | Own records only | Own records only | Own records only |
| Update own profile | Own records only | Own records only | Own records only | Own records only |
| View all students | Not allowed | Allowed | Not allowed | Not allowed |
| Change student status | Not allowed | Allowed | Not allowed | Not allowed |
| View rooms | Own records only | Allowed | Not allowed | Not allowed |
| Create rooms | Not allowed | Allowed | Not allowed | Not allowed |
| Update rooms | Not allowed | Allowed | Not allowed | Not allowed |
| Allocate rooms | Not allowed | Allowed | Not allowed | Not allowed |
| View own allocation | Own records only | Allowed | Not allowed | Not allowed |
| Submit maintenance request | Allowed | Allowed | Not allowed | Not allowed |
| View own maintenance requests | Own records only | Allowed | Not allowed | Not allowed |
| View all maintenance requests | Not allowed | Allowed | Assigned records only | Not allowed |
| Assign maintenance requests | Not allowed | Allowed | Not allowed | Not allowed |
| Update maintenance request status | Not allowed | Allowed | Assigned records only | Not allowed |
| Register visitors | Allowed | Allowed | Not allowed | Not allowed |
| View own visitors | Own records only | Allowed | Not allowed | Not allowed |
| View all visitors | Not allowed | Allowed | Not allowed | Allowed |
| Approve or reject visitors | Not allowed | Allowed | Not allowed | Not allowed |
| Verify visitor entry | Not allowed | Allowed | Not allowed | Allowed |
| Verify visitor exit | Not allowed | Allowed | Not allowed | Allowed |
| View announcements | Allowed | Allowed | Allowed | Allowed |
| Create announcements | Not allowed | Allowed | Not allowed | Not allowed |
| Update announcements | Not allowed | Allowed | Not allowed | Not allowed |
| Delete announcements | Not allowed | Allowed | Not allowed | Not allowed |
| View own payment records | Own records only | Allowed | Not allowed | Not allowed |
| Submit simulated payment details | Allowed | Allowed | Not allowed | Not allowed |
| View all payment records | Not allowed | Allowed | Not allowed | Not allowed |
| Update payment status | Not allowed | Allowed | Not allowed | Not allowed |
| View reports | Not allowed | Allowed | Not allowed | Not allowed |
| View audit logs | Not allowed | Allowed | Not allowed | Not allowed |

## Student Rules

1. Students can manage only their own profile, maintenance requests, visitors, allocation details, notifications, and simulated payment records.
2. Students cannot manage rooms or other users.
3. Students cannot book rooms.
4. Students cannot allocate rooms.
5. Students cannot approve visitors.
6. Students cannot verify visitor entry or exit.
7. Students cannot update payment status.

## Admin Rules

1. Admin users can manage students, rooms, allocations, maintenance assignments, visitors, announcements, payments, reports, and audit logs.
2. Admin users approve or reject visitors.
3. Admin users control room allocation.
4. Admin users manage simulated payment records.
5. Admin users should not view user passwords.
6. Admin users handle general hostel administrative duties in this version.

## Maintenance Staff Rules

1. Maintenance Staff can view maintenance requests assigned to them.
2. Maintenance Staff can update the status of assigned requests.
3. Maintenance Staff can add progress notes to assigned requests.
4. Maintenance Staff cannot allocate rooms.
5. Maintenance Staff cannot approve visitors.
6. Maintenance Staff cannot manage payments, rooms, announcements, students, or audit logs.

## Security Staff Rules

1. Security Staff can view approved visitors expected for entry.
2. Security Staff can verify visitor entry.
3. Security Staff can record visitor exit.
4. Security Staff cannot approve or reject visitors.
5. Security Staff cannot manage rooms, students, allocations, maintenance requests, payments, announcements, reports, or audit logs.

## RBAC Design Notes

1. Backend role checks must protect every restricted endpoint.
2. Frontend route guards should improve the user experience, but they must not replace backend checks.
3. JWT claims should include the user id and role.
4. Ownership checks are needed for student-owned records.
5. Assignment checks are needed for maintenance staff records.
6. Security Staff visitor access should be limited to approved visitors and verification records.
