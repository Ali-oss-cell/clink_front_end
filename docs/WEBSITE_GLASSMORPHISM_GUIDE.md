# Website-wide glassmorphism guide

**Intent:** Glassmorphism (frosted translucent panels over rich backgrounds) is a **primary visual language** for Clink — warm, clinical, modern — but it must stay **token-driven** and **accessible**. This document names **where** to apply it, **how** (shared primitives only), and **where not** to.

**How to use this document:** Check off `- [ ]` items in **§6** when work merges. Before every PR that touches glass, run **§4** (implementation checklist). After each batch: update **§6** checkboxes; when a **priority wave** completes, update [REFRACTOR_TRACKER.md](REFRACTOR_TRACKER.md) **§9**; run `npm run build`. If governance rules change, update `CSS_GOVERNANCE.md` in the same change.

**Related (read first):**

| Document | Role |
|----------|------|
| `CSS_GOVERNANCE.md` | Anti-churn rules, PR checklist, homepage vs dashboard exceptions |
| `UI_PRIMITIVES_CATALOG.md` | L1/L2 surfaces, `glass-card` vs `surface-*` vs `patient-card` |
| `CROSS_SHELL_UI_REFACTOR_SPEC.md` | Shells, cards, forms aligned to homepage |
| `PATIENT_CORE_PAGES_ENTERPRISE_GLASS_SPEC.md` | Patient hub routes: enterprise glass playbook |
| `HOMEPAGE_STYLE_SYSTEM.md` | Homepage as mood reference |

**Code sources of truth:**

| Location | What you get |
|----------|----------------|
| `src/assets/styles/_clinicalSanctuary.scss` | `--cs-glass-bg`, `--cs-glass-bg-strong`, `--cs-glass-border`, `--cs-glass-shadow`, etc. |
| `src/assets/styles/_mixins.scss` | `@mixin glass-card`, `glass-hover`, `card-surface` |
| `src/assets/styles/_surfaceSystem.scss` | `surface-primary`, `surface-secondary`, compact variants — **preferred** for most dashboard cards; **`role-empty-glass`** (+ **table-cell** / **icon**) for role dashboard empty lists |
| `src/assets/styles/_patientSurface.scss` | `@mixin patient-card`, `patient-panel` — patient L1/L2 |
| `src/pages/public/Homepage.module.scss` | Reference for depth, chapter rhythm, and nav “glass pill” language |

---

## 1) Rules of engagement

1. **No ad-hoc `backdrop-filter` in feature modules** unless you are extending a documented primitive or fixing a bug with a follow-up to consolidate. Compose from `glass-card`, `surface-*`, `patient-card` / `patient-panel`, or tokenized `--cs-glass-*` patterns already used in shells (`PatientAppShell`, `RoleAppShell`, public `Header`).
2. **At most two distinct glass depths per viewport** (e.g. section band + card). A third tier only if the catalog already defines it (e.g. nested list row).
3. **Contrast first:** glass is wrong if body text fails WCAG on real backgrounds — adjust token alpha/tint, not random hex.
4. **Marketing nav exception:** the public header **inner pill** often uses a **dark sage gradient** for legibility, not a light frosted wash — still “glass family” for border/hover/sticky behavior; do not slap `glass-card` on the primary CTA if it reads metallic (see `CSS_GOVERNANCE.md` §6).
5. **Data-dense UI:** put glass on the **container** (table card, list shell), not on every cell or row.
6. **Motion:** respect `prefers-reduced-motion` for lifts and route transitions (already wired in several patient flows).

---

## 2) Where glass applies well (by area)

**§6** is the **execution backlog** (checkboxes). The tables below stay the narrative rollout map.

### A) Public marketing & content

| Place | Typical surfaces | Notes |
|-------|------------------|--------|
| `Homepage.tsx` + `Homepage.module.scss` | Section bands, cards, testimonial/feature tiles | Already the aesthetic north star; extend consistently to new homepage sections |
| `ServicesPage`, `AboutPage`, `ContactPage`, `ResourcesPage`, `GetMatchedPage` | Page hero strip, info cards, form panels | Prefer `glass-card` / shared card patterns over flat white boxes |
| `MedicareRebatesPage`, `TelehealthRequirementsPage`, `PrivacyPolicyPage` | Content cards, callouts | Long-form readability: strong glass bg or solid token surface for text blocks if blur hurts legibility |
| Global `Header` / `Layout` | Sticky nav track, inner pill | Homepage uses overlay + inner pill; other public routes may use full-glass header — keep in sync with `Layout.module.scss` |

### B) Auth

| Place | Typical surfaces | Notes |
|-------|------------------|--------|
| `LoginPage`, `RegisterPage`, `ForgotPasswordPage`, `ResetPasswordPage` | Form shell, secondary panels | `form-card` / `glass-card` per `CSS_GOVERNANCE`; align with Register baseline |

### C) Patient app (authenticated)

| Place | Typical surfaces | Notes |
|-------|------------------|--------|
| `PatientAppShell` | Sidebar, `topBarPill`, menu toggle, notification dropdown | Dark sage glass + blur; notifications use `--cs-glass-bg-strong` |
| `PatientDashboardPage`, `PatientAppointmentsPage`, `PatientInvoicesPage`, `PatientResourcesPage`, `PatientAccountPage` | Section cards, lists, tabs, tables wrapper | Follow `PATIENT_CORE_PAGES_ENTERPRISE_GLASS_SPEC.md`; L1/L2 via `patient-card` / `patient-panel` |
| `RecordingsPage` (patient) | Recording cards | `patient-card` parity |
| Booking wizard (`BookingWizardPage`, `ServiceSelectionPage`, `PsychologistSelectionPage`, `DateTimeSelectionPage`, `PaymentPage`, etc.) | Step panels, service cards, summary aside | Wizard bands + sticky actions; **date/time step** header stays flatter per governance (no competing glass stacks) |
| `PatientSetupPage` + `SetupWizardChrome` | Wizard chrome, step cards | Already uses frosted chrome; align future steps to same tokens |
| `AppointmentDetailsPage`, `ConfirmationPage`, `ResourceDetailPage` | Detail layout, receipts, metadata cards | Glass on summary blocks; keep legal/print paths readable |

### D) Psychologist portal

| Place | Typical surfaces | Notes |
|-------|------------------|--------|
| `PsychologistDashboardPage`, `PsychologistSchedulePage`, `PsychologistPatientsPage`, `PsychologistNotesPage`, `PsychologistRecordingsPage`, `PsychologistPatientProfilePage`, `PsychologistProfilePage` | Dashboard tiles, filters, tables, modals | `surface-primary` / `surface-secondary` + role tint; glass on outer sections, compact density inside |

### E) Admin portal

| Place | Typical surfaces | Notes |
|-------|------------------|--------|
| `AdminDashboardPage`, `AdminAppointmentsPage`, `AdminPatientsPage`, `UserManagementPage`, `AdminStaffPage`, `AdminBillingPage`, `AdminResourcesPage`, `AdminReferralsPage`, `AdminAnalyticsPage`, `AdminAuditLogsPage`, `AdminSettingsPage`, `AdminDataDeletionPage` | KPI bands, tables, forms, dialogs | Same as other roles: tokenized surfaces; avoid per-page shadow inventions |

### F) Practice manager portal

| Place | Typical surfaces | Notes |
|-------|------------------|--------|
| `PracticeManagerDashboardPage`, `ManagerAppointmentsPage`, `ManagerPatientsPage`, `ManagerStaffPage`, `ManagerResourcesPage`, `ManagerBillingPage` | Dashboard + operational tables | Mirror psychologist/admin surface language |

### G) System / video / misc

| Place | Typical surfaces | Notes |
|-------|------------------|--------|
| `VideoCallPage` | Pre-call panels, device settings | Glass optional on control strips; prioritize contrast and reduced clutter |
| `PrivacyPolicyModal` | Modal scrim | Light blur on overlay — keep focus trap and readability |
| Shared UI: `Modal`, drawers, dropdowns | Panel + backdrop | Prefer tokenized `backdrop-filter` + `--cs-glass-bg-strong` for dropdowns |

---

## 3) Where to be careful or say no

| Situation | Guidance |
|-----------|----------|
| Primary CTAs on dark bars | Solid gradient buttons (`$btn-admin-primary`), not silver `glass-card` |
| Dense data tables | Glass on **wrapper** only; inner rows use compact neutrals |
| Long legal or medical copy | Prefer opaque or **strong** glass tokens; blur can tire the eye |
| Charts / analytics | Chart canvas stays clean; glass on surrounding **card** only |
| Repeated third depth | Merge with an existing tier or extract a primitive (governance “3+ places”) |

---

## 4) Implementation checklist (per feature)

When closing an item in **§6**, run through this list for that change.

- [ ] Pick **L1 or L2** from `UI_PRIMITIVES_CATALOG.md` — do not invent a third stack.
- [ ] Use `surface-primary` / `surface-secondary` or `@include patient-card` / `patient-panel` as appropriate.
- [ ] Wire **hover** via `glass-hover` or the surface’s built-in hover, not duplicate shadows.
- [ ] Verify **focus-visible** rings and touch targets (`$min-touch-target`).
- [ ] Run **contrast** on real page background (not gray placeholder).
- [ ] If you change semantics of “what is glass here,” update `CSS_GOVERNANCE.md` or this file in the same PR.

---

## 5) Priority waves (optional ordering)

Ship **§6** in waves so scope stays manageable. Detailed checkboxes are in **§6** below.

- **Wave 1 — Public secondary & long-form:** marketing pages + legal/info pages (`Services`, `About`, `Contact`, etc.).
- **Wave 2 — Auth:** Forgot + Reset parity with Login/Register shells.
- **Wave 3 — Video + overlays:** `VideoCallPage`; `PrivacyPolicyModal`; shared modal/dropdown token audit.
- **Wave 4 — Role dashboards:** psychologist/admin/manager glass audit + optional shared empty-state glass card.

Roll up completed waves in `REFRACTOR_TRACKER.md` **§9**.

---

## 6) Execution backlog (checkboxes)

### Priority waves (rollup targets)

These mirror §5; tick when **all** enclosed slice tasks for that wave are done (or consciously deferred with a note in §9).

- [x] **Wave 1 — Public secondary & long-form** complete (see §6.A; 2026 pass: services/about/contact/get-matched/Medicare/telehealth SCSS + legacy `tp-brand-card` removals where replaced by `surface-*`).
- [x] **Wave 2 — Auth** complete (see §6.B; forgot/reset use `Login.module.scss` glass + `credentialCluster` + Register link in footer).
- [x] **Wave 3 — Video + overlays** complete (see §6.G: `VideoCallPage` sage frosted bars; privacy + recording modals `--cs-glass-*` + scrim blur; shell notification dropdown verified).
- [x] **Wave 4 — Role dashboards + empty states** complete (see §6.D–F and empty-state bullet in §6.G; shared `role-empty-glass` / `role-empty-glass-table-cell` / `role-empty-glass-icon` in `_surfaceSystem.scss`, applied in Psychologist/Admin/Manager `*Pages.module.scss`).

### A) Public marketing & content

- [x] **Homepage** (`src/pages/public/Homepage.tsx`, `Homepage.module.scss`) — unchanged this pass (existing chapter glass remains source of truth); audit on future homepage edits.
- [x] **`ServicesPage`** — compact glass cards (`surface-compact-interactive`), `surface-flat` meta strip, gradient section bands, CTA `surface-primary-no-hover`.
- [x] **`AboutPage`** — `surface-primary-no-hover` content shell, gradient body, feature chips `surface-flat`, CTA warm gradient callout; removed duplicate `tp-brand-card` wrappers.
- [x] **`ContactPage`** — contact + form panels `surface-primary-no-hover`, sage gradient band, `--cs-*` typography.
- [x] **`ResourcesPage`** — already on `surface-compact-interactive` / homepage-led patterns via [`PublicPages.module.scss`](../src/pages/public/PublicPages.module.scss); verified, no regression this pass.
- [x] **`GetMatchedPage`** — main step `.card` uses `surface-primary-no-hover`.
- [x] **`MedicareRebatesPage`** — `surface-secondary` info articles + `surface-flat` disclaimer + gradient band; legacy `tp-brand-card` wrapper removed.
- [x] **`TelehealthRequirementsPage`** — hero header + sections use `surface-primary-no-hover` / `surface-secondary`, page gradient band; eyebrow uses `--cs-primary`.
- [x] **`PrivacyPolicyPage`** — unchanged (long-form prose + surfaces already in `PublicPages.module.scss` `.privacyPolicyPage`).
- [x] **`Header` + `Layout`** — verified: [`Header.module.scss`](../src/components/common/Header/Header.module.scss) inner pill uses `glass-card` + sage gradient (`CSS_GOVERNANCE` §6); [`Layout.tsx`](../src/components/common/Layout/Layout.tsx) fixed header clearance unchanged.

### B) Auth

- [x] **LoginPage + RegisterPage** — baseline `form-card` / shared auth shell (`CSS_GOVERNANCE`); spot-audit on regressions only.
- [x] **`ForgotPasswordPage` / [`ForgotPassword.tsx`](../src/components/auth/ForgotPassword/ForgotPassword.tsx)** — shares Login shell (`glass-card` form + `credentialCluster` + [`AuthPages.module.scss`](../src/pages/auth/AuthPages.module.scss) split layout); footer matches Login CTAs (register + sign-in).
- [x] **`ResetPasswordPage` / [`ResetPassword.tsx`](../src/components/auth/ResetPassword/ResetPassword.tsx)** — same shell + clustered password fields + footer links.

### C) Patient app (authenticated)

- [x] **PatientAppShell** — sidebar, `topBarPill`, notifications dropdown (`--cs-glass-*`); baseline complete — spot-audit only.
- [x] **Core hub pages** (dashboard, appointments, invoices, resources, account) — enterprise glass per `PATIENT_CORE_PAGES_ENTERPRISE_GLASS_SPEC.md` / REFRACTOR_TRACKER §8; spot-audit only.
- [x] **RecordingsPage** (patient context) — `patient-card` parity; spot-audit only.
- [x] **Booking wizard** (`BookingWizardPage`, service/psychologist/date-time/payment/confirmation routes) — wizard surfaces per governance; spot-audit for stray flat panels / competing glass on date-time step.
- [x] **PatientSetupPage + SetupWizardChrome** — frosted chrome baseline; spot-audit only.
- [ ] **AppointmentDetailsPage** — summary / metadata cards: glass on summary blocks; legal/print/readable paths preserved.
- [ ] **ConfirmationPage** — same.
- [ ] **ResourceDetailPage** (`src/pages/patient/ResourceDetailPage`) — same.

### D) Psychologist portal

- [x] **Glass audit — psychologist module** — `PsychologistPages.module.scss`: Clinical Sanctuary shell overrides + compact cards already tokenized; **empty states** use `@include role-empty-glass` + **empty icon well** `role-empty-glass-icon`. Dashboard bento remains in `PsychologistDashboard.module.scss` (existing `--cs-glass-*` surfaces).

### E) Admin portal

- [x] **Glass audit — admin module** — `AdminPages.module.scss`: shell + KPI/dashboard glass layers unchanged this pass; **`.emptyState`** aligned to shared `role-empty-glass`.

### F) Practice manager portal

- [x] **Glass audit — manager module** — `ManagerPages.module.scss`: **`managerLayout`** transparent under `.clinicalShell`; block empty states use `role-empty-glass`; **table** empty rows use `role-empty-glass-table-cell` on `td.emptyState`.

### G) System / video / misc

- [x] **`VideoCallPage`** ([`VideoCallPage.module.scss`](../src/pages/video/VideoCallPage.module.scss)) — header, telehealth strip, and control dock use shared **sage gradient + blur** mixin (`$btn-admin-primary` band); control tiles frosted; `prefers-reduced-motion` on hover lifts.
- [x] **`PrivacyPolicyModal`** ([`PrivacyPolicyModal.module.scss`](../src/components/common/PrivacyPolicyModal/PrivacyPolicyModal.module.scss)) — scrim `color-mix` + **10px** blur; panel `var(--cs-glass-bg-strong)` / border / shadow / radii; TSX focus trap unchanged.
- [x] **`RecordingDetailModal`** ([`RecordingDetailModal.module.scss`](../src/components/recordings/RecordingDetailModal.module.scss)) — overlay blur + tokenized panel (parity with privacy modal).
- [x] **Patient shell notification dropdown** — already `backdrop-filter` + `var(--cs-glass-bg-strong)` in [`PatientAppShell.module.scss`](../src/components/patient/PatientAppShell/PatientAppShell.module.scss) (`.notifDropdown`); verified, no code change.
- [x] **Empty states (admin/manager lists)** — shared primitives: `role-empty-glass` (block empty), `role-empty-glass-table-cell` (`td` colspan empty rows), `role-empty-glass-icon` (psychologist schedule/patients/notes icon well).

---

## 7) Follow-up after each merge

1. Mark the relevant **§6** line items `[x]`.
2. When a **priority wave** (§6 top) completes, update **REFRACTOR_TRACKER.md §9**.
3. Run `npm run build` from `clink_front_end`.
4. Update `CSS_GOVERNANCE.md` only if architecture or global glass rules changed.
