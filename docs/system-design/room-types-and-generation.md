# Room Types and Generation

## Approved Room Types

| Code | Name            | Monthly Rate | Capacity |
| ---- | --------------- | ------------ | -------- |
| A    | Twin Room       | KSh 10,000   | 2        |
| B    | Studio          | KSh 14,000   | 1        |
| C    | Superior Studio | KSh 16,500   | 1        |
| D    | One Bedroom     | KSh 20,000   | 1        |
| E    | Two Bedroom     | KSh 30,000   | 2        |

Room types may be active or inactive. An inactive type cannot be used to
generate rooms. The code cannot be edited. Rate and default-capacity changes
apply to future work only and do not rewrite existing rooms or allocations.

## Room Codes

A room stores its room type, floor number, room number, and full room code in
separate fields. The full code uses:

`room type code + floor number + two-digit room number`

Examples:

- Type A, Floor 9, Room 6 becomes `A906`.
- Type A, Floor 10, Room 6 becomes `A1006`.
- `A901` and `B901` are both valid because their room types differ.

Floor numbers are positive integers. Room numbers are from 1 to 99 and may
restart for each room type on the same floor.

## Bulk Generation

Admin selects an active room type, a floor, a starting room number, and a
quantity. The interface previews every code before confirmation. The backend
checks all full codes and structured room identities before inserting.

The complete batch is created in one PostgreSQL transaction. A conflict or
insert error cancels the whole batch. Each room inherits the type's default
capacity and starts with operational status `active`.

## Occupancy and Allocation

Occupancy is calculated from active room allocations. It is not entered
manually.

Display states are:

- `available`: no active occupants
- `partially_occupied`: below capacity
- `full`: at capacity
- `under_maintenance`: cannot receive allocations
- `inactive`: cannot receive allocations

Admin controls room creation and allocation. Students only view their current
allocation. A student may have one active allocation, and a room cannot exceed
capacity.

When Admin creates or changes an allocation, the current room-type monthly rate
is saved as `monthly_rate_at_allocation`. Later room-type rate changes do not
change that saved value.

## Current Limitations

Room numbers stop at 99 for each room type and floor. This feature does not
calculate invoices, balances, debt, payment schedules, or fee splitting.
