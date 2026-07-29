# Payment Management

## Scope

The payment module stores simulated hostel payment records. It does not process
or transfer real money.

The system does not connect to M-Pesa, Stripe, PayPal, banks, cards, or another
payment provider. It does not store card numbers, PINs, CVVs, provider tokens,
bank credentials, callbacks, or provider responses.

## Roles

Students can:

- Submit supported simulated payment details.
- View only their own payment history and record details.
- Filter their records by status.

Admins can:

- Record a simulated payment for a Student allocation.
- View, search, filter, and review all payment records.
- Update payment status using the approved status transitions.
- Open a Student's payment history from Student Details.
- Open the related Student from a global payment record.

Maintenance Staff and Security Staff cannot access payment management.

## Record Rules

The approved statuses are `pending`, `paid`, `failed`, `rejected`, and
`reversed`.

A new record starts as `pending`. A pending record may become `paid`, `failed`,
or `rejected`. A paid record may become `reversed`. Payment records are not
deleted.

Amounts must be greater than zero. A transaction reference must be unique when
provided. A linked allocation must belong to the Student.

Payment API responses include `is_simulated: true`.

## Payment and Student Relationship

Each payment belongs to one Student through `payments.student_id`, which
references `student_profiles.id`. An optional room allocation connects the
record to the Student's hostel stay.

The existing Admin payment list accepts an optional `student_id` filter. The
identifier is validated as a UUID and all database filters use parameterized
queries.

## Global Payment Management

The Admin Payments page remains the main place to manage records across all
Students. It supports:

- Search by Student name, Student number, Student email, or reference
- Status and date filters
- Pagination
- Payment detail review
- Approved status updates
- View Student links

The detail panel shows the Student, Student number, reference, amount, method,
date, status, notes, recorder, and record date.

## Student-Specific Payment History

The Student Details Payments tab requests only records for the selected
Student. It shows:

- Number of simulated records
- Total amount with `paid` status
- Latest payment date and status
- Payment history in a desktop table and mobile cards

The summary is calculated by the backend from stored records. It is not
calculated from one paginated frontend page.

The contextual Add Payment Record action reuses the shared payment form. The
Student name and number are shown and locked. The active allocation determines
the Student on the backend, so the record cannot be assigned to another
Student through the form.

The global Payments page links back to:

`/admin/students/:studentId?tab=payments`

## Limitations

A payment record is not proof of a real transfer. Payment totals do not
represent real hostel revenue. Provider refunds and permanent record deletion
are not included.

The system has no fee or invoice structure. It therefore does not calculate or
display balance due, outstanding fees, or hostel debt.
