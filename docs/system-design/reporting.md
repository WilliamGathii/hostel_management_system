# Reporting

## Scope

Reports use real PostgreSQL queries and real stored records. The application
does not add sample totals or chart values.

Admins can view reports for:

- Student accounts
- Rooms
- Room allocations
- Maintenance requests
- Visitors
- Simulated payments
- Dashboard statistics

Other roles can view only the dashboard summary prepared for their role.
Operational report endpoints are Admin only.

## Filters

Reports support relevant date, status, room, Student, and assigned staff
filters. List results use pagination with a maximum page size of 50.

## Summaries

The database calculates account status, occupancy, allocation status,
maintenance workload, visitor movement, and simulated payment summaries.
Charts use the returned report totals and are hidden when no chart data exists.

Simulated payment reports are not revenue reports. They include
`is_simulated: true`.

## Limitations

PDF and spreadsheet export are not included. Audit-log management screens are
outside this step.
