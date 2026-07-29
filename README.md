# Smart Hostel Management System

The Smart Hostel Management System is a planned web application for managing hostel operations such as students, rooms, allocations, payments, maintenance, visitors, announcements, reports, and security checks.

## Planned Technology Stack

- React frontend
- Node.js and Express backend
- PostgreSQL database
- REST API communication
- JWT authentication
- Role-based access control
- Docker containerisation
- GitHub Actions CI/CD
- AWS deployment in a future stage
- Git and GitHub for version control

## Current Project Status

The project setup, system design, authentication, responsive frontend, Student
management, rooms, allocations, maintenance, visitors, announcements, in-app
notifications, simulated payments, reports, and role dashboards are complete
on `develop` or their current reviewed feature branch. Audit logs, final
testing, and deployment preparation remain.

## Feature-Based Development Timeline

1. Complete and merge the project setup into `develop`.
2. Confirm the project scope and user roles.
3. Design the database, ER diagram, API endpoints, and role permissions.
4. Set up the backend foundation.
5. Develop authentication and role-based access control.
6. Set up the React frontend structure, routing, layouts, and API service layer.
7. Create role-based dashboards for students, admins, maintenance staff, and security staff.
8. Develop student and profile management.
9. Develop room management and room allocation.
10. Develop maintenance request submission, assignment, tracking, and status updates.
11. Develop visitor registration, visitor approval, and security entry verification.
12. Develop announcements and notifications.
13. Develop the payment placeholder and reporting features.
14. Carry out frontend, backend, API, integration, and role-permission testing.
15. Prepare Docker, GitHub Actions, deployment, monitoring, and backups.
16. Complete user testing, documentation, final review, and release.

## Payment Scope

Because of the limited project development time, the first version will not integrate a real payment gateway. The project will include only a simulated or placeholder payment module that demonstrates the payment workflow without transferring real money.

The placeholder payment module may later include payment amount, payment method, transaction reference, payment date, payment status, student payment history, admin payment records, and payment reports.

The project must not connect to M-Pesa, Stripe, PayPal, banks, cards, or any external payment provider during the placeholder payment stage.

## Folder Structure

```text
.
├── backend/
│   ├── src/
│   ├── tests/
│   ├── logs/
│   ├── .env.example
│   ├── package.json
│   └── package-lock.json
├── database/
│   ├── migrations/
│   ├── seeds/
│   ├── scripts/
│   └── documentation/
├── deployment/
│   └── aws/
├── docs/
│   ├── api-endpoint-design.md
│   ├── database-and-er-design.md
│   ├── project-scope-and-roles.md
│   ├── role-permission-matrix.md
│   └── system-design/
├── docker/
│   ├── backend/
│   └── frontend/
├── frontend/
│   ├── src/
│   ├── public/
│   ├── .env.example
│   ├── package.json
│   └── package-lock.json
└── monitoring/
```

## Frontend Setup

Install frontend packages:

```bash
cd frontend
npm install
```

Create the local frontend environment file:

```bash
cp .env.example .env
```

The expected local value is:

```text
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

Start the frontend:

```bash
npm run dev
```

Run frontend tests:

```bash
npm test
```

Run linting:

```bash
npm run lint
```

Create a production build:

```bash
npm run build
```

Public frontend routes:

```text
/login
/forgot-password
/unauthorized
```

Role dashboard routes:

| Route                    | Required role     |
| ------------------------ | ----------------- |
| `/student/dashboard`     | Student           |
| `/admin/dashboard`       | Admin             |
| `/maintenance/dashboard` | Maintenance Staff |
| `/security/dashboard`    | Security Staff    |

Run all dashboard and frontend tests with:

```bash
cd frontend
npm test
```

The four dashboards provide role-aware account information, quick actions,
workflow guidance, and real database summaries. Unavailable records use clear
empty states instead of sample data.

## Backend Setup

Install backend packages:

```bash
cd backend
npm install
```

Create a local backend environment file:

```bash
cp .env.example .env
```

Fill in local values only on your own machine. Do not commit the real `.env` file.

Start the backend in development:

```bash
npm run dev
```

Run backend tests:

```bash
npm test
```

Run backend linting:

```bash
npm run lint
```

Run backend formatting check:

```bash
npm run format:check
```

Run a backend package audit:

```bash
npm audit
```

Run database migrations from the backend folder:

```bash
npm run migrate:up
```

Roll back the most recent migration:

```bash
npm run migrate:down
```

Create a new migration file:

```bash
npm run migrate:create -- short-migration-name
```

Migration commands require a local, non-production `DATABASE_URL`. Never place
database credentials in package scripts or committed files.

Health-check endpoint:

```text
GET /api/v1/health
```

## Backend Authentication

Authentication endpoints:

```text
POST /api/v1/auth/login
POST /api/v1/auth/logout
GET  /api/v1/auth/me
```

Public Student registration is disabled. Admins create Student accounts from
Student Management.

To create the first Admin locally, set these environment variables without
committing their values:

```bash
export ADMIN_EMAIL="<admin-email>"
export ADMIN_PASSWORD="<strong-local-password>"
export ADMIN_FULL_NAME="<admin-name>"
export ADMIN_STAFF_NUMBER="<staff-number>"
npm run create:admin
```

Run the authentication table migration before using the setup script. The
script requires a local development database and refuses to run in production.

The frontend login page uses these authentication endpoints. Admin and staff
accounts cannot use public registration.

Room, allocation, maintenance, visitor, announcement, notification, simulated
payment, and report features are available. Audit-log screens remain planned.

Payment records are simulated and do not transfer real money. Admin reports use
real database summaries for Students, rooms, allocations, maintenance,
visitors, and simulated payments. Report export is not included.

## Student Management

Student API endpoints:

```text
GET   /api/v1/students/me
PATCH /api/v1/students/me
GET   /api/v1/students
POST  /api/v1/students
GET   /api/v1/students/:studentId
PATCH /api/v1/students/:studentId
PATCH /api/v1/students/:studentId/status
```

Student frontend routes:

| Route                        | Required role | Purpose                         |
| ---------------------------- | ------------- | ------------------------------- |
| `/student/profile`           | Student       | View and update own profile     |
| `/admin/students`            | Admin         | Search and list Student records |
| `/admin/students/new`        | Admin         | Create a Student account        |
| `/admin/students/:studentId` | Admin         | View and edit Student details   |

Run Student backend tests as part of the backend suite:

```bash
cd backend
npm test
```

Run Student frontend tests as part of the frontend suite:

```bash
cd frontend
npm test
```

The existing authentication migration provides the Student tables and fields,
so Step 8 does not add a migration. Other module routes remain placeholders.

## Branching Structure

- `main`: stable production branch
- `develop`: development and testing branch
- `feature/*`: individual development tasks
- `hotfix/*`: urgent production fixes

Project setup has been merged into `develop`. New work should use feature branches created from `develop`. Do not make application changes directly in `main` or `develop`.

## Planning Documents

- [Project Scope and User Roles](docs/project-scope-and-roles.md)
- [System Scope](docs/system-design/system-scope.md)
- [Database Design](database/documentation/database-design.md)
- [ER Diagram](docs/system-design/erd.md)
- [API Contract](docs/system-design/api-contract.md)
- [Role Permission Matrix](docs/system-design/rbac-matrix.md)
- [Naming Rules](docs/system-design/naming-rules.md)
- [Folder Ownership](docs/system-design/folder-ownership.md)
- [Authentication Design](docs/system-design/authentication-design.md)
- [Frontend Foundation](docs/system-design/frontend-foundation.md)
- [Role Dashboards](docs/system-design/role-dashboards.md)
- [Student Field Matrix](docs/system-design/student-fields.md)
- [Student Management](docs/system-design/student-management.md)

## Group Members

- Stacey Naisianoi — 675254
- William Gathii — 669986
- Jermaine Ikahu — 676270
- Solomon Kimeli — 673017
- Mohamed Hassan Mohamed — 668642
