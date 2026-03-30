# Dashboard Button Audit

Date: 2026-03-31

Scope:

- `src/pages/patient/PatientDashboard.module.scss`
- `src/pages/psychologist/PsychologistPages.module.scss`
- `src/pages/admin/AdminPages.module.scss`
- `src/pages/manager/ManagerPages.module.scss`

## Findings by dashboard

### Patient dashboard

- Classes: `button.btnPrimary`, `button.btnGhost`
- State source:
  - Normal: `--cs-*` scoped CSS variables
  - Hover: mostly shadow/saturation tweaks
  - Active: movement only
- Issues:
  - Raw `rgba(...)` shadows in button styles
  - Mixed raw color in nearby tile hover (`#e3ebe0`)

### Psychologist dashboard

- Classes: `.actionButton`, `.retryButton`, `.successButton`, `.primaryButton`, `.secondaryButton`, `.videoJoinButton`, `.viewAllButton`
- State source:
  - Normal: mix of `$psychologist-*`, `$primary-*`, `$success-*`
  - Hover: mostly transform + shadow
  - Active: inconsistent usage across classes
- Issues:
  - Mixed token families in same dashboard
  - Raw blue rgba shadows in some video buttons

### Admin dashboard

- Classes in shared module used by dashboard and related admin screens: `.searchButton`, `.primaryButton`, `.actionButton`, `.editButton`, `.deleteButton`
- State source:
  - Normal: mix of `$admin-*` local constants and `$primary-*`
  - Hover: darken/lift, not standardized
- Issues:
  - Role colors split between local `$admin-*` and generic primary
  - No single hover/active model

### Manager dashboard

- Classes in shared module used by dashboard and manager pages: `.actionButton`, `.primaryButton`
- State source:
  - Normal/hover: generic `$primary-*`
- Issues:
  - Manager role has no explicit button-role mapping
  - Hover/active consistency differs from other role dashboards

## Standardization decision

Use one shared button foundation (base interaction and accessibility) with role variants:

- `patient`
- `psychologist`
- `admin`
- `manager`

All dashboard button classes should reuse shared mixins/tokens for:

- consistent normal/hover/active/disabled behavior
- role-consistent color mapping
- focus-visible ring behavior
