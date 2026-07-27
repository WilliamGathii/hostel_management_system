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
