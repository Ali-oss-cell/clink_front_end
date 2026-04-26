# Account Style Unification - Wave Plan

This document is the execution plan to apply the polished patient dashboard/wizard style language across all account types:

- Patient
- Psychologist
- Admin
- Practice Manager

It is intentionally practical: current-state audit, what is unclear, and the waves we will execute in order.

## 1) Goal and Source of Truth

### Target style baseline

- Primary visual language: `src/pages/patient/*` (especially booking and shell polish done recently).
- Design/token source: `src/assets/styles/_clinicalSanctuary.scss`.
- Governance source: `docs/CSS_GOVERNANCE.md`.
- Cross-shell execution source: `docs/CROSS_SHELL_UI_REFACTOR_SPEC.md`.

### North-star outcome

- Same shell/navigation language across all roles.
- Same card and form language across all role pages.
- No page-level one-off visual systems that conflict with shared primitives.
- Clear, wave-based delivery with verification at each wave.

## 2) Current-State Audit (What We Have Today)

## Shell layer

- `PatientAppShell` is relatively advanced (top pill/header rhythm, notifications, polished route chrome).
- `RoleAppShell` is shared for admin/psychologist/manager, but role pages still diverge heavily in local page styling and interaction rhythm.

## Role page surface modules

- `src/pages/patient/PatientPages.module.scss` is the largest style hub and already includes many normalized patterns.
- `src/pages/admin/AdminPages.module.scss` still has dashboard-era patterns and inline icon/color styles in TSX.
- `src/pages/manager/ManagerPages.module.scss` has similar legacy dashboard patterns.
- Psychologist is split (`PsychologistPages.module.scss` + `PsychologistDashboard.module.scss`), and dashboard style differs from patient patterns.

## High-size pages (likely highest complexity/risk)

From current TSX sizes (rough complexity proxy):

- `manager/ManagerResourcesPage.tsx` (1132)
- `admin/AdminResourcesPage.tsx` (1106)
- `admin/UserManagementPage.tsx` (1037)
- `patient/PatientAccountPage.tsx` (895)
- `psychologist/PsychologistSchedulePage.tsx` (877)
- `psychologist/PsychologistProfilePage.tsx` (818)

These are likely to need careful staged migration (not one-shot).

## 3) Wave 0 Decisions (Locked)

Wave 0 finalized the ambiguities and set clear standards for all subsequent waves:

1. **Visual strictness level**
   - Locked: **Role-adapted parity**.
   - Meaning: same style language and token system as patient pages, while allowing role-specific layout nuances where needed.
2. **Dashboard interaction style**
   - Locked: **Simplify heavy reveal/scroll animations**.
   - Meaning: reduce to subtle motion only; avoid distracting intersection-observer reveal choreography.
3. **Density target**
   - Locked: **Compact enterprise density everywhere**.
   - Meaning: all account pages follow compact spacing rhythm unless accessibility needs force exceptions.
4. **Status/badge color policy**
   - Locked: **Replace all inline status colors now**.
   - Meaning: use tokenized semantic classes; no page-level hardcoded status color literals.
5. **Acceptance gate**
   - Locked: **Visual QA after every wave**.
   - Meaning: each wave must pass visual and interaction checks before the next wave begins.

## Wave 0 acceptance checklist (completed)

- [x] 5 standards decisions locked and documented.
- [x] Wave plan and sequencing confirmed (Waves 1-5).
- [x] Tracker row added in `docs/REFRACTOR_TRACKER.md` for cross-account parity waves.
- [x] QA cadence set to per-wave review.
- [x] Before/after screenshot requirement added for each implementation wave.

## 4) Scope Inventory by Role

### Admin pages

- `AdminDashboardPage.tsx`
- `UserManagementPage.tsx`
- `AdminAppointmentsPage.tsx`
- `AdminPatientsPage.tsx`
- `AdminStaffPage.tsx`
- `AdminBillingPage.tsx`
- `AdminReferralsPage.tsx`
- `AdminResourcesPage.tsx`
- `AdminAnalyticsPage.tsx`
- `AdminAuditLogsPage.tsx`
- `AdminSettingsPage.tsx`
- `AdminDataDeletionPage.tsx`

### Psychologist pages

- `PsychologistDashboardPage.tsx`
- `PsychologistSchedulePage.tsx`
- `PsychologistPatientsPage.tsx`
- `PsychologistPatientProfilePage.tsx`
- `PsychologistNotesPage.tsx`
- `PsychologistRecordingsPage.tsx`
- `PsychologistProfilePage.tsx`

### Practice Manager pages

- `PracticeManagerDashboardPage.tsx`
- `ManagerAppointmentsPage.tsx`
- `ManagerPatientsPage.tsx`
- `ManagerStaffPage.tsx`
- `ManagerBillingPage.tsx`
- `ManagerResourcesPage.tsx`

### Patient pages (reference set + final pass)

- `PatientDashboardPage.tsx`
- `PatientAppointmentsPage.tsx`
- `PatientInvoicesPage.tsx`
- `PatientResourcesPage.tsx`
- `PatientAccountPage.tsx`
- Booking flow pages already being polished; final harmonization wave still required.

## 5) Wave Plan (Execution Order)

## Wave 0 - Finalize standards and acceptance checklist

Deliverables:

- Confirm the 5 unclear decisions in section 3.
- Lock visual acceptance checklist (spacing, cards, forms, shell parity, mobile behavior).
- Add before/after screenshots list to PR template for UI waves.

Output:

- This doc updated with final decisions and checkbox table.

## Wave 1 - Shared primitives hardening (lowest-risk base)

Deliverables:

- Extract/normalize role-facing shared classes/mixins for:
  - Page header rhythm
  - Card shell variants
  - Section heading + icon row
  - Empty state shell
  - Status/badge variants
- Remove inline style-driven visual values where easily replaceable.

Target files:

- `src/assets/styles/_surfaceSystem.scss`
- `src/assets/styles/_formSystem.scss`
- `src/assets/styles/_patientPageChrome.scss`
- role/page modules that consume these primitives

Gate:

- Build passes, no lints on changed files, no visual regression in shell chrome.

## Wave 2 - Shell parity across account types

Deliverables:

- Align `RoleAppShell` chrome, nav interaction, and top-area rhythm with patient shell language.
- Ensure role pages use consistent content wrapper spacing and header treatment.

Target files:

- `src/components/role/RoleAppShell/*`
- route wrappers/layout consumers in admin/manager/psychologist pages

Gate:

- Same spacing/interaction behavior across all role shells at desktop/tablet/mobile breakpoints.

## Wave 3 - Dashboard unification (all roles)

Deliverables:

- Normalize dashboard card hierarchy, stat strips, quick actions, empty states.
- Replace any hardcoded inline visual styles in TSX with module classes/token-driven classes.
- Keep data/behavior unchanged.

Target files:

- `AdminDashboardPage.tsx`
- `PsychologistDashboardPage.tsx`
- `PracticeManagerDashboardPage.tsx`
- related module files

Gate:

- Side-by-side dashboard comparison matches agreed pattern language.

## Wave 4 - Forms and dense management pages

Deliverables:

- Apply register/patient form language to heavy CRUD/filter forms and management screens.
- Prioritize biggest pages first:
  - `UserManagementPage.tsx`
  - `AdminResourcesPage.tsx`
  - `ManagerResourcesPage.tsx`
  - `PsychologistSchedulePage.tsx`
  - `PsychologistProfilePage.tsx`
  - `PatientAccountPage.tsx` (reference-quality pass)

Gate:

- Shared controls visually consistent (inputs, selects, toggles, action bars, sticky actions where present).

## Wave 5 - Final cleanup and QA lock

Deliverables:

- Remove dead classes/legacy style branches in touched pages.
- Accessibility pass (focus, contrast, touch target).
- Responsive pass (mobile/tablet/desktop).
- Update docs/tracker and produce final sign-off checklist.

Gate:

- `npm run build` clean.
- No lint errors in changed files.
- QA checklist complete.

## 6) Working Method Per Wave

For each wave:

1. Make a short page list (small batch only).
2. Implement style-only changes (no behavior changes unless required).
3. Run build and lint checks.
4. Capture before/after screenshots for the pages included in that wave.
5. Update docs and tracker.
6. Stop for review before next wave.

This keeps risk controlled and avoids style churn.

## 7) Tracking Checklist

- [x] Wave 0 finalized
- [x] Wave 1 completed *(shared role primitives in `_surfaceSystem.scss`; consumed across admin/manager/psychologist dashboards and key dense pages — see `REFRACTOR_TRACKER.md` §11 Wave 1.)*
- [x] Wave 2 completed
- [x] Wave 3 completed
- [x] Wave 4 completed
- [x] Wave 5 completed

### 7.1 Optional follow-up (shell wrap backlog)

These routes still use Bootstrap-style `className="container"` for inner width; consider migrating to `shell.wrap` + `shell.pageHeader` for full parity with Wave 2–4 pages (style-only, batch when touching each file):

**Admin:** `AdminStaffPage`, `AdminBillingPage`, `AdminReferralsPage`, `AdminAnalyticsPage`, `AdminAuditLogsPage`, `AdminSettingsPage`, `AdminDataDeletionPage`. *(Done: `AdminAppointmentsPage`, `AdminPatientsPage` — `shell.wrap` + shell header chrome.)*

**Manager:** `ManagerStaffPage`, `ManagerBillingPage` *(plus any loading branches in `PracticeManagerDashboardPage` that still nest `container`)*. *(Done: `ManagerAppointmentsPage`, `ManagerPatientsPage` — `shell.wrap` + shell header chrome.)*

## 8) Related Documents

- `docs/CSS_GOVERNANCE.md`
- `docs/CROSS_SHELL_UI_REFACTOR_SPEC.md`
- `docs/REFRACTOR_TRACKER.md`
- `docs/BOOKING_WIZARD_SIMPLIFICATION_PROGRAM.md`
