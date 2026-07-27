# Database Design

This document describes the planned PostgreSQL database for the Smart Hostel Management System. It is for design only. No SQL files, migrations, tables, or seed data are created in this step.

## Database Naming Style

1. Table names use plural `snake_case`.
2. Column names use `snake_case`.
3. Primary keys use `id`.
4. Foreign keys use names such as `student_id`, `room_id`, and `created_by`.
5. Primary keys should use UUID values unless a future approved design changes this.
6. Most tables should include `created_at` and `updated_at`.

## Planned Tables

The planned tables are:

1. `users`
2. `student_profiles`
3. `staff_profiles`
4. `rooms`
5. `room_allocations`
6. `maintenance_requests`
7. `maintenance_updates`
8. `visitors`
9. `visitor_verifications`
10. `announcements`
11. `announcement_recipients`
12. `notifications`
13. `payments`
14. `audit_logs`

## Table Designs

### `users`

Purpose: Stores account and login information for all system users.

Primary key:

- `id`

Important fields:

- `full_name`
- `email`
- `phone`
- `password_hash`
- `role`
- `account_status`
- `last_login_at`
- `created_at`
- `updated_at`

Foreign keys:

- None.

Required fields:

- `full_name`
- `email`
- `password_hash`
- `role`
- `account_status`

Unique fields:

- `email`

Suggested role values:

- `student`
- `admin`
- `maintenance_staff`
- `security_staff`

Suggested status values:

- `active`
- `inactive`
- `suspended`

Relationships:

- One user may have one student profile.
- One user may have one staff profile.
- One user may create many announcements.
- One user may receive many notifications.
- One user may create many audit log records.

Timestamps:

- `created_at`
- `updated_at`

### `student_profiles`

Purpose: Stores student-specific profile information.

Primary key:

- `id`

Important fields:

- `user_id`
- `student_number`
- `course`
- `year_of_study`
- `emergency_contact_name`
- `emergency_contact_phone`
- `created_at`
- `updated_at`

Foreign keys:

- `user_id` references `users.id`

Required fields:

- `user_id`
- `student_number`

Unique fields:

- `user_id`
- `student_number`

Suggested status values:

- Uses `users.account_status`.

Relationships:

- One student profile belongs to one user.
- One student may have many room allocations over time.
- One student may submit many maintenance requests.
- One student may register many visitors.
- One student may have many simulated payment records.

Timestamps:

- `created_at`
- `updated_at`

### `staff_profiles`

Purpose: Stores staff-specific profile information for Admin, Maintenance Staff, and Security Staff users.

Primary key:

- `id`

Important fields:

- `user_id`
- `staff_number`
- `department`
- `job_title`
- `created_at`
- `updated_at`

Foreign keys:

- `user_id` references `users.id`

Required fields:

- `user_id`
- `staff_number`

Unique fields:

- `user_id`
- `staff_number`

Suggested status values:

- Uses `users.account_status`.

Relationships:

- One staff profile belongs to one user.
- Maintenance Staff users may be assigned maintenance requests.
- Admin users may allocate rooms, approve visitors, manage payments, and create announcements.
- Security Staff users may verify visitor entry and exit.

Timestamps:

- `created_at`
- `updated_at`

### `rooms`

Purpose: Stores room information and occupancy details.

Primary key:

- `id`

Important fields:

- `room_number`
- `room_type`
- `capacity`
- `current_occupancy`
- `status`
- `floor`
- `description`
- `created_at`
- `updated_at`

Foreign keys:

- None.

Required fields:

- `room_number`
- `room_type`
- `capacity`
- `current_occupancy`
- `status`

Unique fields:

- `room_number`

Suggested status values:

- `available`
- `occupied`
- `full`
- `under_maintenance`
- `inactive`

Relationships:

- One room may have many room allocations over time.
- One room may have many maintenance requests.

Timestamps:

- `created_at`
- `updated_at`

### `room_allocations`

Purpose: Stores room allocation history. Room allocation is controlled by Admin users.

Primary key:

- `id`

Important fields:

- `student_id`
- `room_id`
- `allocated_by`
- `start_date`
- `expected_end_date`
- `actual_end_date`
- `allocation_status`
- `notes`
- `created_at`
- `updated_at`

Foreign keys:

- `student_id` references `student_profiles.id`
- `room_id` references `rooms.id`
- `allocated_by` references `users.id`

Required fields:

- `student_id`
- `room_id`
- `allocated_by`
- `start_date`
- `allocation_status`

Unique fields:

- A student should have only one active allocation. This may need a partial unique rule during implementation.

Suggested status values:

- `pending`
- `active`
- `completed`
- `cancelled`

Relationships:

- One student may have many room allocations over time.
- One room may have many room allocations over time.
- One Admin user may create many room allocations.

Timestamps:

- `created_at`
- `updated_at`

### `maintenance_requests`

Purpose: Stores maintenance issues submitted by students and assigned to maintenance staff.

Primary key:

- `id`

Important fields:

- `student_id`
- `room_id`
- `assigned_staff_id`
- `title`
- `description`
- `priority`
- `status`
- `submitted_at`
- `completed_at`
- `created_at`
- `updated_at`

Foreign keys:

- `student_id` references `student_profiles.id`
- `room_id` references `rooms.id`
- `assigned_staff_id` references `users.id`

Required fields:

- `student_id`
- `room_id`
- `title`
- `description`
- `priority`
- `status`
- `submitted_at`

Unique fields:

- None required by the current scope.

Suggested priority values:

- `low`
- `medium`
- `high`
- `urgent`

Suggested status values:

- `submitted`
- `assigned`
- `in_progress`
- `completed`
- `rejected`
- `cancelled`

Relationships:

- One student may submit many maintenance requests.
- One room may have many maintenance requests.
- One Maintenance Staff user may be assigned many maintenance requests.
- One maintenance request may have many maintenance updates.

Timestamps:

- `created_at`
- `updated_at`

### `maintenance_updates`

Purpose: Stores progress notes and status history for maintenance requests.

Primary key:

- `id`

Important fields:

- `maintenance_request_id`
- `updated_by`
- `status`
- `note`
- `created_at`
- `updated_at`

Foreign keys:

- `maintenance_request_id` references `maintenance_requests.id`
- `updated_by` references `users.id`

Required fields:

- `maintenance_request_id`
- `updated_by`
- `status`

Unique fields:

- None required by the current scope.

Suggested status values:

- Same as `maintenance_requests.status`.

Relationships:

- One maintenance request may have many maintenance updates.
- One user may create many maintenance updates.

Timestamps:

- `created_at`
- `updated_at`

### `visitors`

Purpose: Stores visitor requests registered by students and reviewed by Admin users.

Primary key:

- `id`

Important fields:

- `student_id`
- `visitor_name`
- `visitor_phone`
- `identification_type`
- `identification_number`
- `visit_date`
- `expected_entry_time`
- `expected_exit_time`
- `purpose`
- `approval_status`
- `approved_by`
- `created_at`
- `updated_at`

Foreign keys:

- `student_id` references `student_profiles.id`
- `approved_by` references `users.id`

Required fields:

- `student_id`
- `visitor_name`
- `visitor_phone`
- `visit_date`
- `purpose`
- `approval_status`

Unique fields:

- None required by the current scope.

Suggested approval status values:

- `pending`
- `approved`
- `rejected`
- `expired`

Relationships:

- One student may register many visitors.
- One Admin user may approve many visitors.
- One visitor may have one or more visitor verification records.

Timestamps:

- `created_at`
- `updated_at`

### `visitor_verifications`

Purpose: Stores Security Staff visitor entry and exit verification records.

Primary key:

- `id`

Important fields:

- `visitor_id`
- `verified_by`
- `entry_time`
- `exit_time`
- `verification_status`
- `notes`
- `created_at`
- `updated_at`

Foreign keys:

- `visitor_id` references `visitors.id`
- `verified_by` references `users.id`

Required fields:

- `visitor_id`
- `verified_by`
- `entry_time`
- `verification_status`

Unique fields:

- None required by the current scope.

Suggested status values:

- `checked_in`
- `checked_out`
- `cancelled`

Relationships:

- One visitor may have one or more verification records.
- One Security Staff user may verify many visitor entries.

Timestamps:

- `created_at`
- `updated_at`

### `announcements`

Purpose: Stores announcements created by Admin users.

Primary key:

- `id`

Important fields:

- `title`
- `message`
- `created_by`
- `target_role`
- `published_at`
- `expires_at`
- `status`
- `created_at`
- `updated_at`

Foreign keys:

- `created_by` references `users.id`

Required fields:

- `title`
- `message`
- `created_by`
- `status`

Unique fields:

- None required by the current scope.

Suggested status values:

- `draft`
- `published`
- `expired`
- `archived`

Relationships:

- One Admin user may create many announcements.
- One announcement may have many announcement recipient records.

Timestamps:

- `created_at`
- `updated_at`

### `announcement_recipients`

Purpose: Stores which users received or read an announcement.

Primary key:

- `id`

Important fields:

- `announcement_id`
- `user_id`
- `read_at`
- `created_at`
- `updated_at`

Foreign keys:

- `announcement_id` references `announcements.id`
- `user_id` references `users.id`

Required fields:

- `announcement_id`
- `user_id`

Unique fields:

- `announcement_id` and `user_id` together should be unique.

Suggested status values:

- Uses `read_at` to show read or unread state.

Relationships:

- One announcement may have many recipient records.
- One user may receive many announcement records.

Timestamps:

- `created_at`
- `updated_at`

### `notifications`

Purpose: Stores user notifications such as allocation, visitor, maintenance, announcement, and payment updates.

Primary key:

- `id`

Important fields:

- `user_id`
- `notification_type`
- `title`
- `message`
- `related_entity_type`
- `related_entity_id`
- `read_at`
- `created_at`
- `updated_at`

Foreign keys:

- `user_id` references `users.id`

Required fields:

- `user_id`
- `notification_type`
- `title`
- `message`

Unique fields:

- None required by the current scope.

Suggested status values:

- Uses `read_at` to show read or unread state.

Relationships:

- One user may receive many notifications.

Timestamps:

- `created_at`
- `updated_at`

### `payments`

Purpose: Stores simulated payment records only. These records demonstrate payment tracking without processing real money.

Primary key:

- `id`

Important fields:

- `student_id`
- `room_allocation_id`
- `amount`
- `payment_method`
- `transaction_reference`
- `payment_date`
- `payment_status`
- `recorded_by`
- `notes`
- `created_at`
- `updated_at`

Foreign keys:

- `student_id` references `student_profiles.id`
- `room_allocation_id` references `room_allocations.id`
- `recorded_by` references `users.id`

Required fields:

- `student_id`
- `amount`
- `payment_method`
- `payment_date`
- `payment_status`

Unique fields:

- `transaction_reference` should be unique when provided.

Suggested status values:

- `pending`
- `paid`
- `failed`
- `rejected`
- `reversed`

Relationships:

- One student may have many payment records.
- One room allocation may have many payment records.
- One Admin user may record or update many payment records.

Payment restrictions:

- Do not store payment gateway tokens.
- Do not store card numbers.
- Do not store M-Pesa credentials.
- Do not store bank credentials.
- Do not store external provider callback information.
- Payment records do not represent real money transfers.

Timestamps:

- `created_at`
- `updated_at`

### `audit_logs`

Purpose: Stores important system actions for accountability.

Primary key:

- `id`

Important fields:

- `user_id`
- `action`
- `entity_type`
- `entity_id`
- `description`
- `ip_address`
- `created_at`
- `updated_at`

Foreign keys:

- `user_id` references `users.id`

Required fields:

- `user_id`
- `action`
- `entity_type`
- `description`
- `created_at`

Unique fields:

- None required by the current scope.

Suggested status values:

- Not needed.

Relationships:

- One user may create many audit log records.

Timestamps:

- `created_at`
- `updated_at`

## Important Database Rules

1. One user email must be unique.
2. One student number must be unique.
3. One staff number must be unique.
4. A student should not have more than one active room allocation.
5. Room occupancy must not exceed room capacity.
6. Only Admin users can create, change, or end room allocations.
7. Maintenance requests must belong to a valid student and room.
8. Only assigned Maintenance Staff or Admin users should update maintenance request progress.
9. Only Admin users can approve or reject visitors.
10. Only approved visitors can be verified by Security Staff.
11. Security Staff cannot approve or reject visitors.
12. Payment records do not represent real money transfers.
13. Important Admin and staff actions should create audit logs.
14. Password hashes should be stored, but plain passwords must never be stored.
