# Project Scope and User Roles

This document confirms the planned scope and user roles for the first development version of the Smart Hostel Management System. It is a planning document only. Database design, ER diagrams, API endpoints, and detailed permissions will be handled in the next step.

## First Version Scope

The first version will be a web-based hostel management system with a React frontend, a Node.js and Express backend, and a PostgreSQL database. The system will use REST API communication, JWT authentication, and role-based access control.

The first version will include these visible system areas:

1. Authentication and role-based access control.
2. Role-based dashboards for students, admins, maintenance staff, and security staff.
3. Student and profile management.
4. Room management and room allocation.
5. Maintenance request submission, assignment, tracking, and status updates.
6. Visitor registration, visitor approval, and security entry verification.
7. Announcements and notifications.
8. Simulated or placeholder payment workflow.
9. Reports for hostel management and admins.
10. Testing, Docker preparation, CI/CD preparation, deployment planning, monitoring, and backups.

## Confirmed Room Allocation Scope

Room allocation will be controlled by the Admin.

Students will not book rooms or allocate rooms to themselves. Students can only:

1. View their current room allocation.
2. View basic room information related to their allocation.
3. Receive room allocation notifications.

The Admin will:

1. View available rooms.
2. Allocate students to rooms.
3. Change room allocations.
4. End room allocations.
5. Check room capacity and occupancy.

## Payment Scope

The payment module will be a placeholder only. It will demonstrate the payment workflow without transferring real money.

The placeholder payment module may include:

1. Payment amount.
2. Payment method.
3. Transaction reference.
4. Payment date.
5. Payment status.
6. Student payment history.
7. Admin payment records.
8. Payment reports.

The first version must not connect to M-Pesa, Stripe, PayPal, banks, cards, or any external payment provider.

The Admin will manage simulated payment records. A separate Finance or Accounts role will not be created in this version.

## Required Reports

The first version will include these reports:

1. Room availability report.
2. Room occupancy report.
3. Room allocation report.
4. Student report.
5. Maintenance request report.
6. Visitor report.
7. Simulated payment report.
8. General dashboard statistics.

Reports should support simple filters such as date, status, room, student, and assigned staff where relevant.

## Visitor Entry Verification Scope

Visitor entry verification is required in the first version.

The visitor process will be:

1. A student registers a visitor.
2. An Admin approves or rejects the visitor.
3. Security Staff can view approved visitors.
4. Security Staff verifies the visitor when they enter.
5. Security Staff records the visitor entry time.
6. Security Staff records the visitor exit time.

Security Staff cannot approve or reject visitors.

## Out of Scope for the First Version

These items are not part of the first version unless the project scope is changed later:

1. Real payment gateway integration.
2. Mobile applications.
3. Biometric access control.
4. Smart-card door access.
5. University student records integration.
6. Email, SMS, or push notification provider integration.
7. Live AWS resource creation before the deployment stage.
8. Any feature that has not been confirmed by the group and project documentation.

## Confirmed User Roles

The first version will use four main system roles.

| Role              | Main Purpose                                                                          |
| ----------------- | ------------------------------------------------------------------------------------- |
| Student           | Uses the system to manage hostel-related personal tasks.                              |
| Admin             | Manages hostel records, allocations, approvals, announcements, payments, and reports. |
| Maintenance Staff | Views assigned maintenance work and updates request progress.                         |
| Security Staff    | Checks visitor approval status and records visitor entry verification.                |

No separate Warden role will be created. Any administrative hostel duties that could normally be handled by a Warden will be handled by the Admin in this version.

No separate Finance or Accounts role will be created. The Admin will manage simulated payment records.

## Role Responsibilities

### Student

Students will use Admin-created accounts to log in, view or update approved
profile fields, view room allocation, submit and track maintenance requests,
register visitors, and view announcements, notifications, and placeholder
payment history where enabled.

### Admin

Admins will create and edit Student accounts and manage hostel operations such
as room records, room allocation, maintenance oversight, visitor approval,
announcements, reports, user roles, and placeholder payment records where
enabled.

### Maintenance Staff

Maintenance staff will view assigned maintenance requests, update request status, add work notes, and record completion details. They should not manage students, rooms, visitors, payments, or announcements unless granted additional permissions later.

### Security Staff

Security staff will search visitor requests, check approval status, view approved visitors, record visitor entry time, and record visitor exit time. They should not manage student records, room allocations, maintenance assignments, payments, announcements, or visitor approval decisions.
