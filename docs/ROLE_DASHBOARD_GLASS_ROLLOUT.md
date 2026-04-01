# Role Dashboard Glass Rollout

Date: 2026-03-31

Objective: apply the same modern glass style language used in patient surfaces across all role dashboards and related role pages, with consistent cards/buttons/inputs.

## Scope list (page-by-page)

### Admin pages
- [x] `AdminDashboardPage`
- [x] `UserManagementPage`
- [x] `AdminAppointmentsPage`
- [x] `AdminPatientsPage`
- [x] `AdminStaffPage`
- [x] `AdminBillingPage`
- [x] `AdminSettingsPage`
- [x] `AdminAnalyticsPage`
- [x] `AdminResourcesPage`
- [x] `AdminAuditLogsPage`
- [x] `AdminDataDeletionPage`

### Psychologist pages
- [x] `PsychologistDashboardPage`
- [x] `PsychologistProfilePage`
- [x] `PsychologistSchedulePage`
- [x] `PsychologistPatientsPage`
- [x] `PsychologistNotesPage`

### Practice manager pages
- [x] `PracticeManagerDashboardPage`
- [x] `ManagerStaffPage`
- [x] `ManagerPatientsPage`
- [x] `ManagerAppointmentsPage`
- [x] `ManagerBillingPage`
- [x] `ManagerResourcesPage`

## Booking flow (2026-04-02)

- Sticky primary actions + scrollable main: `bookingFlowMain` / `formActionsSticky` on patient booking steps (`ServiceSelection`, `PsychologistSelection`, `DateTimeSelection`, `AppointmentDetails`).
- Date/time API params: `formatLocalDateYYYYMMDD` from `src/utils/dateLocal.ts`.

## Implementation notes

- Shared glass button behavior is centralized in:
  - `src/assets/styles/_buttonSystem.scss`
  - `src/components/ui/ui.scss`
- Role dashboard card/button harmonization is applied in:
  - `src/pages/admin/AdminPages.module.scss`
  - `src/pages/psychologist/PsychologistPages.module.scss`
  - `src/pages/manager/ManagerPages.module.scss`

## Scaling normalization pass (2026-03-31)

- Shell parity aligned for role and patient shells: sidebar rhythm, nav density, and collapse breakpoint behavior.
- Dashboard sizing rhythm normalized across role modules using shared tokens (page gutters, card padding/radius, control target size).
- `PsychologistDashboardPage` inline spacing/typography styles were migrated into SCSS classes for maintainability and predictable responsive behavior.

