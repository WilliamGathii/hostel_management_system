# Simulated Payments and Reports

## Simulated Payments

The payment module stores demonstration records only. It does not transfer
money or connect to M-Pesa, Stripe, PayPal, banks, cards, or another payment
provider.

Students can submit and view their own records. Admin users can record a
payment against an active room allocation, view all records, and review the
status.

Supported payment statuses are:

- `pending`
- `paid`
- `failed`
- `rejected`
- `reversed`

A pending record may become paid, failed, or rejected. A paid record may be
reversed. Terminal records cannot be changed again.

The module does not accept or store card numbers, bank credentials, provider
tokens, callbacks, or external payment account details.

Main API group:

- `/api/v1/payments`

## Reports

Admin users can view:

- Room availability and occupancy
- Room allocations
- Students and current allocation status
- Maintenance requests
- Visitors and visit status
- Simulated payments

Reports use live PostgreSQL records. They do not include invented totals.
Simple filters include date, status, room, Student, assigned staff, and Student
search where relevant. Export files are not included in this step.

Main API group:

- `/api/v1/reports`

## Dashboard Statistics

All authenticated roles can use:

- `GET /api/v1/reports/dashboard`

The response is limited to statistics relevant to the signed-in role:

- Admin: Students, rooms, allocations, occupancy, maintenance, visitors, and payments
- Student: allocation, maintenance, visitors, unread notifications, and payment records
- Maintenance Staff: assigned, urgent, in-progress, and completed requests
- Security Staff: expected visitors, visitors inside, and completed visits

## Data Protection

Payment and report routes use the existing JWT and role middleware. Students
cannot read another Student's payments. Only Admin users can view operational
reports or update payment status.

All database filters and changes use parameterised PostgreSQL queries.
