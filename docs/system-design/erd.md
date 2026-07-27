# ER Diagram

This document shows the planned entity relationships for the Smart Hostel Management System. It is a design document only. No SQL files, migrations, database tables, or generated database code are created from this diagram.

## Mermaid ER Diagram

```mermaid
erDiagram
  users ||--o| student_profiles : has
  users ||--o| staff_profiles : has
  student_profiles ||--o{ room_allocations : receives
  rooms ||--o{ room_allocations : contains
  users ||--o{ room_allocations : creates
  student_profiles ||--o{ maintenance_requests : submits
  rooms ||--o{ maintenance_requests : has
  users ||--o{ maintenance_requests : assigned_to
  maintenance_requests ||--o{ maintenance_updates : has
  users ||--o{ maintenance_updates : writes
  student_profiles ||--o{ visitors : registers
  users ||--o{ visitors : approves
  visitors ||--o{ visitor_verifications : has
  users ||--o{ visitor_verifications : verifies
  users ||--o{ announcements : creates
  announcements ||--o{ announcement_recipients : sends_to
  users ||--o{ announcement_recipients : receives
  users ||--o{ notifications : receives
  student_profiles ||--o{ payments : has
  room_allocations ||--o{ payments : relates_to
  users ||--o{ payments : records
  users ||--o{ audit_logs : creates

  users {
    uuid id PK
    string full_name
    string email UK
    string phone
    string password_hash
    string role
    string account_status
    datetime last_login_at
    datetime created_at
    datetime updated_at
  }

  student_profiles {
    uuid id PK
    uuid user_id FK
    string student_number UK
    string course
    int year_of_study
    string emergency_contact_name
    string emergency_contact_phone
    datetime created_at
    datetime updated_at
  }

  staff_profiles {
    uuid id PK
    uuid user_id FK
    string staff_number UK
    string department
    string job_title
    datetime created_at
    datetime updated_at
  }

  rooms {
    uuid id PK
    string room_number UK
    string room_type
    int capacity
    int current_occupancy
    string status
    string floor
    string description
    datetime created_at
    datetime updated_at
  }

  room_allocations {
    uuid id PK
    uuid student_id FK
    uuid room_id FK
    uuid allocated_by FK
    date start_date
    date expected_end_date
    date actual_end_date
    string allocation_status
    string notes
    datetime created_at
    datetime updated_at
  }

  maintenance_requests {
    uuid id PK
    uuid student_id FK
    uuid room_id FK
    uuid assigned_staff_id FK
    string title
    string description
    string priority
    string status
    datetime submitted_at
    datetime completed_at
    datetime created_at
    datetime updated_at
  }

  maintenance_updates {
    uuid id PK
    uuid maintenance_request_id FK
    uuid updated_by FK
    string status
    string note
    datetime created_at
    datetime updated_at
  }

  visitors {
    uuid id PK
    uuid student_id FK
    uuid approved_by FK
    string visitor_name
    string visitor_phone
    string identification_type
    string identification_number
    date visit_date
    datetime expected_entry_time
    datetime expected_exit_time
    string purpose
    string approval_status
    datetime created_at
    datetime updated_at
  }

  visitor_verifications {
    uuid id PK
    uuid visitor_id FK
    uuid verified_by FK
    datetime entry_time
    datetime exit_time
    string verification_status
    string notes
    datetime created_at
    datetime updated_at
  }

  announcements {
    uuid id PK
    uuid created_by FK
    string title
    string message
    string target_role
    datetime published_at
    datetime expires_at
    string status
    datetime created_at
    datetime updated_at
  }

  announcement_recipients {
    uuid id PK
    uuid announcement_id FK
    uuid user_id FK
    datetime read_at
    datetime created_at
    datetime updated_at
  }

  notifications {
    uuid id PK
    uuid user_id FK
    string notification_type
    string title
    string message
    string related_entity_type
    uuid related_entity_id
    datetime read_at
    datetime created_at
    datetime updated_at
  }

  payments {
    uuid id PK
    uuid student_id FK
    uuid room_allocation_id FK
    uuid recorded_by FK
    decimal amount
    string payment_method
    string transaction_reference UK
    date payment_date
    string payment_status
    string notes
    datetime created_at
    datetime updated_at
  }

  audit_logs {
    uuid id PK
    uuid user_id FK
    string action
    string entity_type
    uuid entity_id
    string description
    string ip_address
    datetime created_at
    datetime updated_at
  }
```

## Relationship Notes

1. One user may have one student profile.
2. One user may have one staff profile.
3. One student may have many room allocations over time.
4. One room may have many room allocations over time.
5. One Admin user may create many room allocations.
6. One student may submit many maintenance requests.
7. One room may have many maintenance requests.
8. One Maintenance Staff user may be assigned many maintenance requests.
9. One maintenance request may have many maintenance updates.
10. One student may register many visitors.
11. One Admin user may approve many visitors.
12. One visitor may have one or more visitor verification records.
13. One Security Staff user may verify many visitor entries and exits.
14. One Admin user may create many announcements.
15. One announcement may have many announcement recipient records.
16. One user may receive many notifications.
17. One student may have many simulated payment records.
18. One room allocation may have many simulated payment records.
19. One user may create many audit log records.

## Important Design Notes

1. The ER diagram matches the planned tables in `database/documentation/database-design.md`.
2. Payment records are simulated records only.
3. The diagram does not include payment provider tables, card data, bank credentials, M-Pesa credentials, or external gateway callbacks.
4. Room allocation is controlled by Admin users.
5. Visitor approval is controlled by Admin users.
6. Visitor entry and exit verification is handled by Security Staff.
