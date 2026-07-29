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

## Limitations

A payment record is not proof of a real transfer. Payment totals do not
represent real hostel revenue. Provider refunds and permanent record deletion
are not included.
