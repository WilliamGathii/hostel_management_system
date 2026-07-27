# System Scope

This document explains the planned scope of the Smart Hostel Management System. It is a design document only. No application code, database migrations, SQL tables, routes, controllers, or React pages are created in this step.

## Project Overview

The Smart Hostel Management System is a web-based system for managing student hostel operations. It will help students, admins, maintenance staff, and security staff use one system instead of paper files or separate spreadsheets.

The planned technology stack is React for the frontend, Node.js and Express for the backend, PostgreSQL for the database, REST API communication, JWT authentication, role-based access control, Docker, GitHub Actions, and AWS deployment in a later stage.

## Main Problem Being Solved

The project solves common hostel management problems such as:

1. Manual student and room records.
2. Double room allocation.
3. Slow maintenance follow-up.
4. Poor visitor tracking.
5. Delayed announcements and notifications.
6. Hard-to-prepare reports.
7. Limited role-based control over sensitive hostel information.

## System Users

### Student

Students can:

1. Register an account.
2. Log in.
3. View and update their own profile.
4. View their room allocation.
5. View basic room information related to their allocation.
6. Submit maintenance requests.
7. Track maintenance request status.
8. Register visitors.
9. View announcements and notifications.
10. View simulated payment records.

Students cannot book rooms, allocate rooms, approve visitors, manage payment status, or view other students' private records.

### Admin

Admins can:

1. Log in.
2. Manage students.
3. Manage rooms.
4. Allocate rooms.
5. Change and end room allocations.
6. Manage maintenance requests.
7. Manage visitors.
8. Approve or reject visitors.
9. Manage announcements.
10. View reports and statistics.
11. Manage simulated payment records.
12. View audit logs.

Admin users also handle hostel duties that could normally belong to a Warden in this version. There is no separate Warden role.

### Maintenance Staff

Maintenance Staff can:

1. Log in.
2. View assigned maintenance requests.
3. Update maintenance request status.
4. Add simple progress notes.

Maintenance Staff cannot allocate rooms, approve visitors, manage payment records, or publish announcements.

### Security Staff

Security Staff can:

1. Log in.
2. View approved visitor records.
3. Verify visitor entry.
4. Record visitor entry time.
5. Record visitor exit time.

Security Staff cannot approve or reject visitors.

## Main Modules

The planned system modules are:

1. Authentication.
2. Student profiles.
3. Student management.
4. Room management.
5. Room allocation.
6. Maintenance requests.
7. Visitor management.
8. Security verification.
9. Announcements.
10. Notifications.
11. Payment placeholder.
12. Reports and statistics.
13. Audit logs.

## Features Included

The first version will include:

1. JWT-based login and protected access.
2. Four approved roles: Student, Admin, Maintenance Staff, and Security Staff.
3. Student profile management.
4. Admin-controlled room management.
5. Admin-controlled room allocation.
6. Student maintenance request submission and tracking.
7. Admin maintenance assignment.
8. Maintenance Staff status updates and progress notes.
9. Student visitor registration.
10. Admin visitor approval or rejection.
11. Security Staff visitor entry and exit verification.
12. Admin announcements.
13. User notifications.
14. Simulated payment records.
15. Reports and dashboard statistics.
16. Audit logs for important actions.

## Features Not Included

The first version will not include:

1. Real payment gateway integration.
2. M-Pesa, Stripe, PayPal, bank, or card provider connections.
3. Student room booking or self-allocation.
4. A separate Warden role.
5. A separate Finance or Accounts role.
6. Mobile applications.
7. Biometric access control.
8. Smart-card door access.
9. Email, SMS, or push notification provider integration.
10. Live AWS resource creation before the deployment stage.

## Payment Limitation

Because of the limited project development time, the system will not connect to a complete live payment gateway. A simulated payment module will be used to demonstrate how hostel payments can be recorded, reviewed, and tracked without processing real money.

The payment placeholder may include:

1. Payment amount.
2. Payment method.
3. Transaction reference.
4. Payment date.
5. Payment status.
6. Student payment history.
7. Admin payment records.

The system must not store payment gateway tokens, card numbers, M-Pesa credentials, bank credentials, or payment provider callback data.

## Main Assumptions

1. Each user has one main role.
2. Admin users control room allocation.
3. Students can only view their own room allocation.
4. A student should not have more than one active room allocation.
5. Visitor entry verification is required.
6. Security Staff can verify approved visitors only.
7. Payment records are simulated and do not represent real money transfers.
8. Reports will use simple filters such as date, status, room, student, and assigned staff where relevant.
9. Sensitive actions should be protected by role permissions.
10. Important actions should be recorded in audit logs where appropriate.

## Questions That May Still Need Confirmation

1. Which exact student profile fields are required by the hostel?
2. Which room types should be supported?
3. Should notifications remain inside the system only, or should email or SMS be added in a future version?
4. Which reports should be exportable in the final version?
5. Which staff member or team will be responsible for reviewing audit logs after deployment?
