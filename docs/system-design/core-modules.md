# Hostel Core Modules

This guide covers the room, maintenance, visitor, announcement, and in-app
notification modules.

## Room Management

Admin users manage approved room types, organise rooms by floor, generate rooms
in a single batch, and update room details and operational status. Room codes
are generated from the room-type code, floor, and two-digit room number.
Occupancy is calculated from active allocations.

Admin users control all allocations. A Student can have only one active
allocation, and a room cannot be allocated beyond its capacity. A room under
maintenance or inactive cannot receive a new allocation. The room type's
monthly rate is copied into the allocation so later rate changes do not change
history.

Students can view only their current allocation and safe room details. Students
cannot select or book rooms.

Main API groups:

- `/api/v1/rooms`
- `/api/v1/room-types`
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
