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
- [x] `DONE` Patient setup wizard (`/patient/setup`) replaces `PatientIntakeFormPage`. Shell: `SetupWizardChrome`, steps: `src/pages/patient/setup/steps/*`, state hook: `useSetupDraft`.
- [x] `DONE` Post-auth redirect: `getPostAuthRedirect(user)` in `utils/authRedirects.ts` sends patients to `/patient/setup`; the page itself redirects to `/patient/dashboard` when the server reports wizard completion.
- [x] `DONE` Dashboard simplified: removed `OnboardingProgress`; single readiness banner + setup card driven by `GET /api/auth/booking-readiness/`.
- [x] `DONE` Extracted `_patientSurface.scss`, `_patientFormRow.scss`, `_patientTabs.scss` as shared primitives for the patient area to consume going forward.

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

### 8) Patient core enterprise glass (`PATIENT_CORE_PAGES_ENTERPRISE_GLASS_SPEC.md`)

- [x] `DONE` Phase 1 — L1/L2 documented (`UI_PRIMITIVES_CATALOG.md`, `_patientSurface.scss`); shared `_patientPageChrome.scss`; PatientShellPage + PatientShellChrome deduped.
- [x] `DONE` Phase 2 — PatientShellPage wrapper on dashboard, resources, invoices, account; `/recordings` (patient); shared chrome partial.
- [x] `DONE` Phase 3 — Dashboard L1 `patient-card`; appointments list cards respect reduced-motion on stagger.
- [x] `DONE` Phase 4 — Invoices tokenized surfaces + table shell; resources error icon tokenized.
- [x] `DONE` Phase 5 — Account `PatientShellPage`; recording cards `patient-card`.
- [x] `DONE` Phase 6 — PatientAppShell route enter + reduced-motion; QA: `npm run build` clean.

### 9) Website-wide glass expansion (`WEBSITE_GLASSMORPHISM_GUIDE.md`)

Roll up **priority waves** from §6 when each wave completes (do not duplicate every page-level checkbox here). Detailed backlog: [`WEBSITE_GLASSMORPHISM_GUIDE.md`](WEBSITE_GLASSMORPHISM_GUIDE.md) §6.

- [x] `DONE` **Wave 1 — Public secondary & long-form** — Services, About, Contact, Resources, GetMatched; Medicare/Rebates/Telehealth/Privacy; Header/Layout alignment (`WEBSITE_GLASSMORPHISM_GUIDE.md` §6.A).
- [x] `DONE` **Wave 2 — Auth** — ForgotPassword + ResetPassword parity with Login/Register shells (`credentialCluster`, shared `Login.module.scss`, split layout via `AuthPages.module.scss`).
- [x] `DONE` **Wave 3 — Video + overlays** — VideoCall sage bars; PrivacyPolicyModal + RecordingDetailModal token glass; PatientAppShell notif dropdown verified (`WEBSITE_GLASSMORPHISM_GUIDE.md` §6.G).
- [x] **Wave 4 — Role dashboards + empty states** — Psychologist / Admin / Manager `*Pages.module.scss`: shared `role-empty-glass`, `role-empty-glass-table-cell`, `role-empty-glass-icon` in `_surfaceSystem.scss`; manager shell transparent under `.clinicalShell`; `npm run build` verified.

## Cleanup Targets

- [x] Removed `--tp-*` variable definitions from `_base.scss` and all `var(--tp-*)` usages across 5 page modules.
- [x] Removed `$admin-primary` / `$admin-accent` local variable definitions from AdminPages.
- [x] Removed `--shell-*` custom property system from RoleAppShell.
- [x] Replaced duplicate `.formActionsSticky` blocks with `@include wizard-sticky-actions` mixin.
- [x] Consolidated duplicate `.pageHeader` definitions in PatientPages (3 → 1).
- [x] **`fadeInUp` keyframes:** centralized in `_animations.scss`, `@use` from `index.scss`; modules reference `fadeInUp` / `fadeInUpShort` / `fadeInUpMedium` / `fadeInUpDeep` by intent (homepage-led 24px baseline).

## Quality Gates

- [x] Build passes (`vite build` — clean exit; Sass deprecation warnings remain unrelated to this rollout).
- [x] No linter errors on new/edited files.
- [ ] Responsive check (mobile/tablet/desktop) — visual QA pending.
- [ ] Focus/contrast/touch-target check — visual QA pending.
- [ ] **Glass expansion (optional):** relevant §6 waves in [`WEBSITE_GLASSMORPHISM_GUIDE.md`](WEBSITE_GLASSMORPHISM_GUIDE.md) checked off + `npm run build` clean after each merged batch (see §7 in that doc).
- [x] Docs updated (`CSS_GOVERNANCE.md`, `REFRACTOR_TRACKER.md`).
