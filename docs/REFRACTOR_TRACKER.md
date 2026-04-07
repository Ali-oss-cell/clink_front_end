# Frontend Refactor Tracker

Tracks migration to homepage-led, token-driven, shared-primitives styling.

**Primary spec:** `CROSS_SHELL_UI_REFACTOR_SPEC.md` (what to build and in what order).

## Status Legend

- `NOT_STARTED`
- `IN_PROGRESS`
- `DONE`
- `BLOCKED`

## Workstreams

### 0) Compact Glass Rollout (All Authenticated Dashboards)

- [x] `DONE` Add compact primitives in `_surfaceSystem.scss` (`surface-compact`, `surface-compact-interactive`, `surface-compact-selected`).
- [x] `DONE` Refactor booking service + psychologist cards to compact hover/selected behavior.
- [x] `DONE` Compact patient dashboard/tabs (`PatientPages`, `PatientAppointments`, `PatientDashboard`, `PatientInvoicesPage`).
- [x] `DONE` Compact psychologist/admin/manager dashboard surfaces and action states.
- [x] `DONE` Reduce shell padding/density in `PatientAppShell` and `RoleAppShell`.
- [x] `DONE` Update governance docs and verify build.

### 1) Shared Foundations

- [x] `DONE` Define final primitives and naming map (`_surfaceSystem.scss`, `_wizardSystem.scss`, `_formSystem.scss`).
- [x] `DONE` Remove duplicate surface/action/control systems (`--shell-*` removed, `--tp-*` removed, `$admin-*` removed).
- [x] `DONE` Enforce rule coverage in `.cursor/rules/21-homepage-design-system-source-of-truth.mdc`.

### 2) Patient Area

- [x] `DONE` Booking wizard (steps bar via `wizard-step-band`, search surface, `wizard-sticky-actions` shell, unified surfaces).
- [x] `DONE` PatientPages.module.scss + 9 sub-modules migrated to surface primitives and `--cs-*` tokens.
- [x] `DONE` Appointments/invoices/resources visual normalization (shadow + border-radius tokenized).

### 3) Psychologist Area

- [x] `DONE` Migrate pages to shared surfaces and controls (63 replacements in PsychologistPages.module.scss).
- [x] `DONE` Normalize filters/tables/forms to shared input/action language (form primitives applied).

### 4) Admin Area

- [x] `DONE` Migrate role dashboards to homepage-led surface system (`$admin-*` removed, `glass-card(admin)` → surface primitives).
- [x] `DONE` Remove page-local button/card variants (hardcoded badge colors → token-mapped status).

### 5) Manager Area

- [x] `DONE` Align manager shell pages with shared primitives (`--tp-*` fully removed, `glass-card(manager)` → surface primitives).
- [x] `DONE` Consolidate inconsistent spacing and section hierarchy (form primitives applied).

### 6) Auth + Public

- [x] `DONE` Auth pages aligned with shared form-card language (`.authCard` → `form-card` mixin).
- [x] `DONE` Homepage remains style source of truth.

### 7) Shell Sidebars

- [x] `DONE` PatientAppShell — fully `--cs-*` tokenized, remaining hardcoded rgba replaced.
- [x] `DONE` RoleAppShell — legacy `--shell-*` base removed, rewritten to use `--cs-*` tokens exclusively.

## Cleanup Targets

- [x] Removed `--tp-*` variable definitions from `_base.scss` and all `var(--tp-*)` usages across 5 page modules.
- [x] Removed `$admin-primary` / `$admin-accent` local variable definitions from AdminPages.
- [x] Removed `--shell-*` custom property system from RoleAppShell.
- [x] Replaced duplicate `.formActionsSticky` blocks with `@include wizard-sticky-actions` mixin.
- [x] Consolidated duplicate `.pageHeader` definitions in PatientPages (3 → 1).
- [ ] Duplicate `@keyframes fadeInUp` across 7 files (CSS Modules scopes them independently — low priority).

## Quality Gates

- [x] Build passes (`vite build` — clean exit; Sass deprecation warnings remain unrelated to this rollout).
- [x] No linter errors on new/edited files.
- [ ] Responsive check (mobile/tablet/desktop) — visual QA pending.
- [ ] Focus/contrast/touch-target check — visual QA pending.
- [x] Docs updated (`CSS_GOVERNANCE.md`, `REFRACTOR_TRACKER.md`).
