# Hostel Management System UI Design System

## Purpose

This guide describes the shared frontend design for the Hostel Management
System. New pages should follow these rules.

## Visual Style

The interface should feel calm, clear, and suitable for regular hostel work.
It uses light page backgrounds, white work areas, navy actions, and
periwinkle highlights.

The interface should not look like a generic dashboard template. Pages should
focus on the main task for each role.

## Colour Palette

Shared colours are defined in `frontend/src/styles/theme.css`.

| Name | Value | Main use |
| --- | --- | --- |
| Midnight Navy | `#182653` | Main actions, branding, strong emphasis |
| Periwinkle | `#A7B8E5` | Active navigation and secondary emphasis |
| Light Periwinkle | `#D9E1F5` | Soft actions and selected areas |
| Mist Background | `#EEF2FA` | Page background |
| White | `#FFFFFF` | Main panels and fields |
| Main Text | `#182033` | Headings and important text |
| Muted Text | `#68738D` | Supporting text |
| Border | `#D8DFEC` | Table and form separation |
| Success | `#CDEEDB` / `#176A43` | Successful states |
| Warning | `#F5D58A` / `#7A5200` | Warning states |
| Error | `#F2B8B5` / `#8A2722` | Error states |
| Information | `#D7E6FA` / `#245AA5` | General information |

Do not add page-specific colours. Add or change colours through the shared
theme.

## Typography

The frontend uses Poppins with a system font fallback.

- Page titles use bold text.
- Panel titles use smaller bold text.
- Body text stays short and readable.
- Letter spacing is not reduced.
- Long values may wrap instead of leaving their container.

## Application Layout

Desktop pages use:

- A mist page canvas
- A floating white sidebar
- Role-aware navigation
- The current user, role, and sign-out action in the sidebar
- Page headings inside the page content
- A maximum content width

Mobile and tablet pages use:

- A compact page header
- A floating bottom navigation
- The same role-aware routes
- A visible sign-out action

Changing routes returns the page to the top.

## Panel System

Use no more than these three panel styles:

1. Functional panels for forms, tables, and main work areas
2. Summary cards for short values or statuses
3. Notice panels for success, warning, error, or information messages

Do not place cards inside cards. Simple rows and muted page areas may be used
inside a functional panel.

## Navigation and Icons

Use `react-icons` only.

- Use icons to support a clear label.
- Icon-only buttons must have an accessible name.
- Do not place every icon inside a coloured square.
- The active navigation item uses light periwinkle and navy text.

## Buttons

- Primary buttons use navy with white text.
- Secondary buttons use light periwinkle with navy text.
- Destructive buttons use the error colour.
- Ghost buttons are used for low-priority actions.
- Buttons must keep visible focus states.
- Important actions must remain visible on mobile.

## Forms

- Every field must have a visible label.
- Required fields use text and a required marker.
- Validation messages appear near the related field.
- Fields use white backgrounds and a visible focus ring.
- Related fields may be grouped with a fieldset and legend.
- Forms become one column on small screens.

## Tables

Admin tables are used on medium and large screens.

On small screens:

- Student table rows become stacked record cards.
- Important values remain visible.
- The record action remains easy to select.
- Horizontal page scrolling is not allowed.

Use horizontal table scrolling only when a record cannot be simplified.

## Loading, Empty, and Error States

- Use skeletons for page and record loading where practical.
- Empty states must describe the related record type.
- Do not mention development steps or missing APIs.
- Error messages must be safe and should offer a retry action when possible.
- Never display private server details.

Examples:

- No rooms have been added.
- No maintenance requests are available.
- No visitor approvals are waiting.
- No announcements have been published.
- No simulated payment records have been added.
- No student accounts matched your search.

## Role Dashboards

Each dashboard has a different main work area.

- Admin: Hostel Occupancy and daily operations
- Student: My Stay and personal hostel services
- Maintenance Staff: Maintenance Queue and work status
- Security Staff: Visitor Timeline and entry or exit workflow

Do not invent totals, rooms, requests, visitors, charts, or activity. Show a
clear empty state until real data is available.

## Authentication

Desktop login uses a split layout. The left side shows the system identity and
hostel service areas. The right side contains the sign-in form.

Mobile login uses one centred white panel.

Public student registration is not available. Admins create student accounts
from Student Management.

## Accessibility

- Use semantic headings, navigation, forms, tables, and lists.
- All fields need labels.
- Icon-only controls need accessible names.
- Status must use text as well as colour.
- Keyboard focus must remain visible.
- Text and controls must keep readable contrast.
- Reduced-motion preferences are respected.
- Pages must not scroll horizontally.

## Packages

The frontend design uses:

- React
- Tailwind CSS
- React Icons
- React Hook Form
- React Router
- Axios

Do not add another UI framework or icon library without team review.
