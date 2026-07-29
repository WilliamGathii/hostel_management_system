# Role Dashboards

## 1. Dashboard Overview

The frontend provides one dashboard for each approved role:

- Student
- Admin
- Maintenance Staff
- Security Staff

Each dashboard is protected by the role-based routing created in the frontend
foundation. Users cannot open another role's dashboard.

## 2. Shared Dashboard Design

The dashboards use the shared navy, grey-blue, and white theme.

Shared dashboard components provide:

- Welcome panels
- Summary cards
- Quick-action cards
- Section headings
- Empty states
- Unavailable-data states
- Loading states
- Safe error states
- Information and warning notices

The components use Tailwind CSS and `react-icons`. They reuse the existing
shared card, status, loading, error, and alert components.

## 3. Student Dashboard

The Student dashboard displays account information returned by `/auth/me`:

- Name
- Student number
- Email
- Account status

It also provides quick links to the planned Student pages.

The dashboard uses live role-specific statistics for room allocation,
maintenance, visitors, unread notifications, and simulated payment records.
Empty states remain visible when the database confirms that no records exist.

## 4. Admin Dashboard

The Admin dashboard provides quick links for managing:

- Students
- Rooms
- Allocations
- Maintenance requests
- Visitors
- Announcements
- Simulated payments
- Reports

Summary cards use live data about students, rooms, active allocations, and open
maintenance requests. The occupancy panel uses real capacity and occupancy
values.

Recent activity remains empty until audit logging and module activity are
connected.

## 5. Maintenance Staff Dashboard

The Maintenance Staff dashboard provides links to:

- Assigned requests
- Maintenance history

Cards show live assigned, in-progress, completed, and urgent request totals for
the signed-in Maintenance Staff member.

The page also explains the approved maintenance priority and status labels.
These labels are guidance and are not presented as real requests.

## 6. Security Staff Dashboard

The Security Staff dashboard provides links to:

- Approved visitors
- Visitor history

It displays the approved visitor process:

1. A student registers a visitor.
2. An Admin approves or rejects the visitor.
3. Security Staff views approved visitors.
4. Security Staff records entry.
5. Security Staff records exit.

The page clearly states that Security Staff cannot approve visitors or manage
rooms and allocations.

## 7. Role-Based Access

Dashboard routes:

| Route                    | Required role     |
| ------------------------ | ----------------- |
| `/student/dashboard`     | Student           |
| `/admin/dashboard`       | Admin             |
| `/maintenance/dashboard` | Maintenance Staff |
| `/security/dashboard`    | Security Staff    |

The role from the authenticated `/auth/me` response is the source of truth.
Roles are not stored separately in `sessionStorage`.

## 8. Quick Actions

Quick actions use approved navigation routes. They provide an easy way to open
future modules without implementing those modules inside the dashboards.

Every quick action is limited to the current user's role.

## 9. Responsive Design

The dashboards were reviewed at desktop, tablet, and mobile widths.

- Desktop uses the fixed role-aware sidebar.
- Tablet and mobile use the sticky topbar and mobile bottom navigation.
- Summary cards and action cards change to fewer columns on smaller screens.
- Mobile cards stack vertically.
- No dashboard requires a wide table.
- Keyboard focus remains visible.

## 10. Empty and Unavailable States

The dashboard does not show `0` unless a real backend value confirms zero.

When data is unavailable, it uses wording such as:

- Not available yet
- No information is available yet
- This information will appear after the related module is added

One unavailable section does not prevent the rest of the dashboard from
working.

## 11. Current Data Limitations

The endpoint `GET /api/v1/reports/dashboard` returns live statistics selected
for the signed-in role. A failed statistics request shows a safe error state
and does not expose internal database information.

## 12. Simulated Payment Notice

The payment module is simulated.

The system does not process real money and does not connect to M-Pesa, cards,
banks, PayPal, Stripe, or another payment provider.

## 13. Testing Completed

Frontend tests cover:

- Shared dashboard components
- Loading and empty states
- Unavailable summary values
- Student dashboard content
- Admin dashboard content
- Maintenance Staff dashboard content
- Security Staff dashboard content
- Correct dashboard routes
- Wrong-role redirects
- Live dashboard statistics
- Payment and report routes

The frontend suite, linting, and production build must pass before merging.

Responsive visual checks were completed with safe mocked authentication
responses. No production mock data or test account was committed.

## 14. Features Planned for Later

Audit-log screens remain planned for a later step. Dashboard and report totals
are displayed only when returned by the backend. No chart with invented data is
included.
