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

The project is in the development environment setup stage. Feature development has not started. No login pages, dashboards, forms, API routes, controllers, database tables, migrations, or business logic have been created.

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

Run frontend checks:

```bash
npm run build
npm run lint
```

## Backend Setup

Install backend packages:

```bash
cd backend
npm install
```

Run a backend package audit:

```bash
npm audit
```

## Branching Structure

- `main`: stable production branch
- `develop`: development and testing branch
- `feature/*`: individual development tasks
- `hotfix/*`: urgent production fixes

Current setup work is on the `feature/project-setup` branch. Do not make application changes directly in `main` or `develop`.

## Group Members

- Stacey Naisianoi — 675254
- William Gathii — 669986
- Jermaine Ikahu — 676270
- Solomon Kimeli — 673017
- Mohamed Hassan Mohamed — 668642
