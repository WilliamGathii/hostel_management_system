# UI Reference Guide

This document records visual ideas found in the read-only UI reference project. It is for planning only. No React pages, components, routes, forms, authentication logic, API logic, backend code, database code, or feature implementation are created in this step.

## Project Paths

Target project:

- `/Users/williamgathii/Documents/hostel_management_system`

Read-only reference project:

- `/Users/williamgathii/Documents/University/SWE3040XA/Group Project/habittracker`

Only the target project may be edited. The reference project must remain unchanged.

## Inspection Summary

Target project files reviewed:

- `frontend/package.json`
- `frontend/src/`
- `README.md`
- `docs/system-design/system-scope.md`
- `docs/system-design/api-contract.md`
- `docs/system-design/rbac-matrix.md`

Reference project files reviewed:

- `Habit_tracker/package.json`
- `Habit_tracker/src/`
- `Habit_tracker/src/assets/`
- `Habit_tracker/src/components/`
- `Habit_tracker/src/pages/`
- `Habit_tracker/src/routes/`
- `Habit_tracker/src/index.css`
- `Habit_tracker/vite.config.js`

No reference environment files, secrets, backend files, database files, migrations, private data, or credentials were inspected or copied.

## 1. General Visual Style

The reference project uses a calm application style with:

- A full-height app shell.
- A fixed desktop sidebar.
- A sticky top navigation bar.
- A mobile bottom navigation bar.
- Light cards over a soft page background.
- Simple icon-led navigation and actions.
- Dashboard sections that mix summary cards, charts, lists, and focused action areas.

For the Hostel Management System, this can be adapted into a professional operations interface. The design should feel clear, structured, and easy to scan because Admin, Maintenance Staff, and Security Staff will use it repeatedly for daily hostel work.

## 2. Colour Palette

Reference palette patterns:

- Warm off-white page background.
- Stone or dark neutral text.
- White translucent card surfaces.
- Brown accent colour for primary actions and active navigation.
- Green for success states.
- Amber for warning or pending states.
- Red for error or destructive states.
- Soft borders and shadows.

Suggested Hostel adaptation:

- Use a clean neutral base such as off-white or light gray.
- Use one strong primary colour for active navigation and primary buttons.
- Use green for available, approved, completed, paid, and checked-out states.
- Use amber for pending, assigned, and in-progress states.
- Use red for rejected, failed, cancelled, urgent, and inactive states.
- Avoid copying the exact reference brand colour if the group chooses a different hostel identity.

## 3. Typography

Reference typography patterns:

- System sans-serif stack with Inter-style fallback.
- Strong but simple headings.
- Small muted helper text.
- Medium-weight labels.
- Compact body text for cards and lists.

Suggested Hostel adaptation:

- Use a readable sans-serif font stack.
- Keep dashboard headings clear and not too large.
- Use short labels for operational data.
- Use helper text only where it explains empty states, validation, or important workflow status.

## 4. Page Width and Spacing

Reference layout patterns:

- Main content is centered with a maximum width.
- Desktop content uses generous horizontal padding.
- Page sections use vertical spacing between groups.
- Cards use internal padding.
- Grids change columns at responsive breakpoints.

Suggested Hostel adaptation:

- Use a maximum content width for normal pages.
- Use wider table pages for Admin reports and management screens.
- Keep dashboard cards in responsive grids.
- Use consistent spacing between filters, tables, forms, and detail panels.

## 5. Sidebar Design

Reference sidebar patterns:

- Fixed desktop sidebar.
- App name area at the top.
- Vertical navigation links with icons.
- Active link has a filled background.
- Secondary card or action area near the bottom.
- Sidebar is hidden on smaller screens.

Suggested Hostel adaptation:

- Use one sidebar layout for authenticated users.
- Change visible links by role.
- Student sidebar should focus on dashboard, profile, allocation, maintenance, visitors, announcements, notifications, and payments.
- Admin sidebar should include students, rooms, allocations, maintenance, visitors, announcements, payments, reports, and audit logs.
- Maintenance Staff sidebar should focus on dashboard, assigned requests, request details, and history.
- Security Staff sidebar should focus on dashboard, approved visitors, entry verification, exit verification, and history.
- Do not copy the reference app name, logo, sidebar text, or feature labels.

## 6. Top Navigation Design

Reference topbar patterns:

- Sticky top header inside the authenticated layout.
- Current page title.
- Short greeting or context line.
- Search input.
- Date display.
- User initials avatar.

Suggested Hostel adaptation:

- Show the current module name.
- Show the signed-in user role.
- Add search only where it is useful.
- Show notifications access later when the notification feature is built.
- Use initials or a simple avatar placeholder.
- Do not expose private data in the topbar.

## 7. Card Design

Reference card patterns:

- Light card surfaces.
- Thin borders.
- Soft shadows.
- Rounded corners.
- Muted text for labels and descriptions.
- Status pills inside cards.

Suggested Hostel adaptation:

- Use cards for dashboard summaries, detail panels, notification items, visitor verification cards, and maintenance request summaries.
- Use tighter cards for dense Admin screens.
- Use tables for large management lists instead of too many large cards.
- Keep card styling consistent across roles.
- Avoid copying reference card content or habit-specific labels.

## 8. Button Styles

Reference button patterns:

- Filled primary buttons.
- Soft outlined secondary buttons.
- Red destructive buttons.
- Rounded pill-style actions.
- Icons used beside many action labels.
- Disabled state for submitting forms.

Suggested Hostel adaptation:

- Primary: create, submit, save, approve, verify entry, verify exit.
- Secondary: cancel, view details, reset filters.
- Warning or danger: reject, end allocation, cancel request, deactivate.
- Use clear labels for important actions.
- Later UI implementation should prefer a consistent button component.

## 9. Form and Input Styles

Reference form patterns:

- Labels above inputs.
- Rounded input fields.
- Light input backgrounds.
- Focus ring using the primary accent.
- Form grids on larger screens.
- Full-width fields on mobile.
- Inline error and success messages.

Suggested Hostel adaptation:

- Use the same general form pattern for registration, profile updates, visitor registration, maintenance requests, room forms, allocation forms, and simulated payment forms.
- Use role-specific forms only when the workflow requires it.
- Keep validation messages close to the field or form.
- Use `react-hook-form`, already installed in the target frontend, when implementation begins.

## 10. Table Styles

The reference project does not use a full table-heavy design. It uses list rows and card rows for repeated records.

Suggested Hostel adaptation:

- Admin pages should use tables for students, rooms, allocations, maintenance requests, visitors, payments, reports, and audit logs.
- Tables should support search, filters, status chips, actions, and empty states.
- On mobile, table rows can collapse into stacked cards.
- Do not force large management screens into card-only layouts.

## 11. Modal and Notification Styles

Reference patterns:

- No major modal system was found.
- Success notices appear as soft green message blocks.
- Error notices appear as soft red message blocks.
- Empty and loading states use centered card messages.

Suggested Hostel adaptation:

- Use inline notices for simple success and error states.
- Use confirmation modals later for risky actions such as ending allocations, rejecting visitors, or changing payment status.
- Use notification list items for system notifications.
- Keep notification text simple and action-oriented.

## 12. Dashboard Layout

Reference dashboard patterns:

- Top hero or summary section.
- Four summary statistic cards.
- Two-column middle section for charts or focused panels.
- Repeated item list below.
- Status or reminder block near the bottom.

Suggested Hostel dashboard adaptation:

- Student dashboard: current room allocation, maintenance status, visitor status, announcements, notifications, and payment summary.
- Admin dashboard: room availability, occupancy, pending visitors, pending maintenance, simulated payment summary, and recent audit activity.
- Maintenance dashboard: assigned requests, urgent requests, in-progress requests, completed requests, and recent notes.
- Security dashboard: approved visitors expected today, checked-in visitors, pending exits, and recent verifications.

## 13. Mobile and Responsive Behaviour

Reference responsive patterns:

- Desktop sidebar is hidden on small screens.
- Mobile bottom navigation shows the most important links.
- Cards stack vertically on mobile.
- Form grids collapse to one column.
- Horizontal filter chips can scroll.
- Content keeps safe spacing above the mobile bottom nav.

Suggested Hostel adaptation:

- Use mobile bottom navigation for the most common role actions.
- Keep Admin tables readable on small screens by switching to cards or horizontal overflow.
- Make visitor verification quick on mobile for Security Staff.
- Keep form fields large enough for touch input.

## 14. Reusable Component Patterns

Patterns that can be adapted:

- App layout with sidebar, topbar, main content, and mobile nav.
- Role-aware navigation item lists.
- Stat cards.
- Status chips.
- Search and filter bar.
- Form field wrapper.
- Action button styles.
- Empty state card.
- Loading state card.
- Alert or notice block.
- Detail summary panel.
- Responsive card grid.

The actual Hostel components should use Hostel names, Hostel data, and Hostel routes.

## 15. Packages Used for the UI

Reference project UI-related packages:

- `react`
- `react-dom`
- `react-router-dom`
- `axios`
- `react-icons`
- `tailwindcss`
- `@tailwindcss/vite`
- `vite`
- `@vitejs/plugin-react`

Target frontend packages already installed:

- `react`
- `react-dom`
- `react-router-dom`
- `axios`
- `react-hook-form`
- `recharts`
- `vite`
- `@vitejs/plugin-react`
- `oxlint`

Packages that may be needed later if the team chooses to follow the reference closely:

- `tailwindcss`
- `@tailwindcss/vite`
- `react-icons` or another approved icon library

No packages are installed in this review step.

## 16. Parts That Can Be Adapted

The following can be adapted as design ideas:

- Sidebar and mobile bottom navigation pattern.
- Topbar structure.
- Dashboard section structure.
- Summary stat cards.
- Status pill styling.
- Search and filter layout.
- Form layout and focus states.
- Inline success and error notices.
- Empty, loading, and not-found page patterns.
- Responsive grid behaviour.

These should be rewritten for Hostel content and should not be copied directly.

## 17. Parts That Should Not Be Copied

Do not copy:

- The reference project name.
- The reference logo or branding.
- Habit-specific feature names.
- Habit-specific page text.
- Mock habit data.
- API service logic.
- Authentication logic.
- Token storage logic.
- Context state logic.
- Backend or database code.
- Environment files or secrets.
- Images, unless separately approved and licensed for this project.
- Any route names that belong only to the reference app.

## 18. Changes Required for the Hostel Management System

Required changes before UI implementation:

- Create role-based routing based on the approved four roles.
- Build a Hostel-specific authenticated layout.
- Create role-specific sidebar navigation.
- Create Hostel-specific dashboard cards and metrics.
- Add table patterns for Admin management screens.
- Add forms for Hostel workflows only when feature development begins.
- Use the approved REST API contract.
- Respect the approved RBAC matrix.
- Keep simulated payments clearly marked as simulated.
- Do not connect to a real payment provider.
- Keep the frontend separate from the reference project.

## Proposed Hostel Page Structure

This page structure is proposed for future implementation only.

### Public Pages

- Login
- Student registration
- Forgot password placeholder
- Unauthorized page
- Not found page

### Student Pages

- Student dashboard
- Profile
- Room allocation
- Maintenance requests
- Visitor registration
- Announcements
- Notifications
- Simulated payment records

### Admin Pages

- Admin dashboard
- Student management
- Room management
- Room allocation
- Maintenance management
- Visitor approvals
- Announcement management
- Simulated payment records
- Reports
- Audit logs

### Maintenance Staff Pages

- Maintenance dashboard
- Assigned requests
- Request details
- Maintenance history

### Security Staff Pages

- Security dashboard
- Approved visitors
- Visitor entry verification
- Visitor exit verification
- Visitor history

## Compatibility Notes

- The reference frontend uses Tailwind CSS, but the target frontend does not currently have Tailwind installed.
- The reference frontend uses `react-icons`, but the target frontend does not currently have an icon package installed.
- The target frontend already has `recharts`, which is useful for Hostel reports and dashboard statistics.
- The target frontend already has `react-hook-form`, which should be useful for Hostel forms.
- The target project currently keeps the original Vite React placeholder files. They should not be changed until the approved frontend implementation step begins.

## Decisions Requiring Confirmation

These design decisions should be confirmed before frontend implementation:

- Whether to use Tailwind CSS or plain CSS modules/global CSS.
- Which icon library to use.
- Final primary colour for the Hostel Management System.
- Whether Admin tables should use sticky headers or simple tables.
- Whether mobile Admin tables should become cards or scroll horizontally.
- Whether the public login page should use a background image or a simple centered panel.
- Whether notifications remain in-app only for the first version.

## Final Rule

The reference project is only a visual guide. The Hostel Management System must keep its own content, routes, API contract, roles, business rules, and project identity.
