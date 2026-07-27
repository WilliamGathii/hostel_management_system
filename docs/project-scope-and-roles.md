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
9. Reports for hostel management and administrators.
10. Testing, Docker preparation, CI/CD preparation, deployment planning, monitoring, and backups.

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

| Role | Main Purpose |
| --- | --- |
| Student | Uses the system to manage hostel-related personal tasks. |
| Administrator | Manages hostel records, allocations, approvals, announcements, and reports. |
| Maintenance Staff | Views assigned maintenance work and updates request progress. |
| Security Staff | Checks visitor approval status and records entry verification where enabled. |

## Role Responsibilities

### Student

Students will be able to use approved student-facing features such as registration, login, profile viewing or updates, room allocation viewing, maintenance request submission and tracking, visitor registration, announcements, notifications, and placeholder payment history where enabled.

### Administrator

Administrators will manage hostel operations such as student records, room records, room allocation, maintenance oversight, visitor approval, announcements, reports, user roles, and placeholder payment records where enabled.

### Maintenance Staff

Maintenance staff will view assigned maintenance requests, update request status, add work notes, and record completion details. They should not manage students, rooms, visitors, payments, or announcements unless granted additional permissions later.

### Security Staff

Security staff will search visitor requests, check approval status, and record visitor entry verification where enabled. They should not manage student records, room allocations, maintenance assignments, payments, or announcements.

## Scope Questions to Confirm Before Design

These questions should be answered before Step 3 starts:

1. Should students only view allocated rooms, or should they request or book rooms directly?
2. Should the Warden be a separate role, or should warden duties be handled by Administrator, Maintenance Staff, and Security Staff?
3. Should finance or accounts staff be a separate role, or should payment records be managed by Administrators?
4. Which reports are required for the first version?
5. Should visitor entry verification be recorded as a required feature or an optional feature?
