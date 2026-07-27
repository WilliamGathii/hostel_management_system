# Folder Ownership and Team Responsibilities

This document suggests how the group can divide the project work. Folder ownership does not mean only one person can edit a folder. It means that the named person should help guide and review work in that area.

All members may help through feature branches and pull requests. Important changes should be reviewed before merging. No member should push feature work directly to `main`. Shared modules should be discussed before major changes.

## Team Members

1. Stacey Naisianoi — 675254
2. William Gathii — 669986
3. Jermaine Ikahu — 676270
4. Solomon Kimeli — 673017
5. Mohamed Hassan Mohamed — 668642

## Suggested Work Areas

| Area | Main Owner | Main Focus | Main Folders |
| --- | --- | --- | --- |
| Frontend and interface | Stacey Naisianoi | React interface, layouts, pages, reusable components, user experience | `frontend/src/components`, `frontend/src/layouts`, `frontend/src/pages`, `frontend/src/styles` |
| Backend and API | William Gathii | Express foundation, REST API structure, request validation, backend services | `backend/src/routes`, `backend/src/controllers`, `backend/src/services`, `backend/src/validators` |
| Database and authentication | Jermaine Ikahu | PostgreSQL design, migrations later, authentication data flow, user roles | `database`, `backend/src/models`, `backend/src/config`, `backend/src/middleware` |
| Testing and documentation | Solomon Kimeli | Test planning, unit tests, integration tests, documentation quality | `backend/tests`, `frontend/src/tests`, `docs`, `README.md` |
| DevOps and deployment | Mohamed Hassan Mohamed | Docker, CI/CD, deployment planning, monitoring, environment consistency | `docker`, `.github`, `deployment`, `monitoring` |

## Frontend and Interface

Main focus:

1. React pages and layouts.
2. Shared interface components.
3. Form presentation.
4. Dashboard presentation.
5. Responsive interface checks.

Likely folders:

1. `frontend/src/components`
2. `frontend/src/layouts`
3. `frontend/src/pages`
4. `frontend/src/features`
5. `frontend/src/styles`

## Backend and API

Main focus:

1. Express backend structure.
2. REST endpoint implementation later.
3. Controllers and services later.
4. Request validation later.
5. Consistent API responses.

Likely folders:

1. `backend/src/routes`
2. `backend/src/controllers`
3. `backend/src/services`
4. `backend/src/validators`
5. `backend/src/utils`

## Database and Authentication

Main focus:

1. Database design and migrations later.
2. User and role data structure.
3. Authentication flow design.
4. Middleware planning.
5. Data integrity rules.

Likely folders:

1. `database`
2. `backend/src/models`
3. `backend/src/config`
4. `backend/src/middleware`
5. `backend/src/utils`

## Testing and Documentation

Main focus:

1. Test plans.
2. Unit tests later.
3. Integration tests later.
4. Documentation consistency.
5. Review checklists.

Likely folders:

1. `backend/tests`
2. `frontend/src/tests`
3. `docs`
4. `database/documentation`
5. `README.md`

## DevOps and Deployment

Main focus:

1. Docker setup later.
2. GitHub Actions workflow later.
3. AWS deployment planning later.
4. Monitoring and backup planning.
5. Environment consistency.

Likely folders:

1. `docker`
2. `.github`
3. `deployment`
4. `monitoring`
5. Root configuration files.

## Collaboration Rules

1. Work should be done on feature branches.
2. Pull requests should target `develop` during development.
3. No feature work should be pushed directly to `main`.
4. Shared files should be discussed before large changes.
5. Each member should review changes that affect their main area.
6. Other members may help in any folder when needed.
7. No member is responsible for the entire project alone.
8. Large changes should be split into smaller commits where possible.
9. Commit messages should be short and simple.
10. Secrets, passwords, and real credentials must not be committed.
