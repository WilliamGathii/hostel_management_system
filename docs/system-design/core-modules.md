# Hostel Core Modules

This guide covers the room, maintenance, visitor, announcement, and in-app
notification modules.

## Room Management

Admin users can create rooms, update room details and status, search rooms, and
view occupancy. Room numbers are unique. Capacity must be positive and cannot
be lower than current occupancy.

Admin users control all allocations. A Student can have only one active
allocation, and a room cannot be allocated beyond its capacity. Allocation
changes use database transactions so that occupancy remains correct.

Students can view only their current allocation and safe room details. Students
cannot select or book rooms.

Main API groups:

- `/api/v1/rooms`
- `/api/v1/allocations`

## Maintenance Management

Students submit requests for their currently allocated room and can track their
own requests. Admin users view and assign requests. Maintenance Staff can view
and update only requests assigned to them.

Supported priorities are `low`, `medium`, `high`, and `urgent`.

Supported statuses are `submitted`, `assigned`, `in_progress`, `completed`,
`rejected`, and `cancelled`. Status changes are checked by the service layer. A
completed request records its completion time.

Main API group:

- `/api/v1/maintenance-requests`

## Visitor Management

A Student registers a visitor. An Admin approves or rejects the request.
Security Staff normally records entry and exit. The approved RBAC matrix also
allows Admin verification, but the Admin interface does not show Security
actions.

Only an approved, current visitor can enter. Entry and exit cannot be recorded
twice, and exit cannot be recorded before entry. Visitor lists do not include
identification numbers. The protected visitor detail response includes them
only for roles that need the record.

Main API group:

- `/api/v1/visitors`

## Announcements

Admin users create, edit, publish, archive, and delete announcements.
Announcements can target all roles or one approved role. Published
announcements are shown only to the selected audience and remain hidden after
expiry.

Publishing creates recipient records and simple in-app notifications. No email,
SMS, browser push, or third-party notification service is used.

Main API group:

- `/api/v1/announcements`

## In-App Notifications

Authenticated users can view only their own notifications. They can mark one
notification as read or mark all as read.

Notifications are created for:

- Room allocation
- Maintenance assignment and status changes
- Visitor approval or rejection
- Published announcements

Main API group:

- `/api/v1/notifications`

## Local Setup

From `backend/`, apply migrations only to a local development database:

```bash
npm run migrate:up
```

Run backend and frontend checks before opening a pull request:

```bash
cd backend
npm test
npm run lint
npm run format:check

cd ../frontend
npm test
npm run lint
npm run build
```
