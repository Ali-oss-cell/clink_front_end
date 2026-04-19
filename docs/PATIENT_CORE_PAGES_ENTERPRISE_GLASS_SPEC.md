# Patient Core Pages — Enterprise Glass + Connected App Shell

**Status:** execution playbook (follow in order).  
**Production URLs:** [Dashboard](https://tailoredpsychology.com.au/patient/dashboard), [Appointments](https://tailoredpsychology.com.au/patient/appointments), [Invoices](https://tailoredpsychology.com.au/patient/invoices), [Resources](https://tailoredpsychology.com.au/patient/resources), [Recordings](https://tailoredpsychology.com.au/recordings), [Account](https://tailoredpsychology.com.au/patient/account).

This spec targets a **cohesive, modern, enterprise-grade** patient experience: stronger **glassmorphism** (via **shared** primitives only), **app-like** continuity between routes, and **quiet** motion. It **does not** introduce a parallel visual system — it extends the homepage-led Clinical Sanctuary language already governed in `CSS_GOVERNANCE.md` and `CROSS_SHELL_UI_REFACTOR_SPEC.md`.

---

## 0) Canonical references (read before coding)

| Document | Use |
|----------|-----|
| `docs/CROSS_SHELL_UI_REFACTOR_SPEC.md` | North star: one language, homepage glass, Register forms |
| `docs/CSS_GOVERNANCE.md` | Tokens, `_patientSurface.scss`, `_mixins.scss` (`glass-card`, `glass-hover`), anti-churn rules |
| `docs/HOMEPAGE_STYLE_SYSTEM.md` | Homepage as aesthetic reference |
| `docs/UI_PRIMITIVES_CATALOG.md` | What to extract vs reuse |
| `docs/RESPONSIVE_SIZE_MATRIX.md` | Breakpoints, touch targets, density |
| `docs/REFRACTOR_TRACKER.md` | Log batches as you complete them |

**Source-of-truth files (tokens & glass):**

- `src/assets/styles/_clinicalSanctuary.scss` — `--cs-*` variables
- `src/assets/styles/_mixins.scss` — `glass-card`, `glass-hover`
- `src/assets/styles/_patientSurface.scss` — `patient-card`, `patient-panel`, etc.
- `src/pages/public/Homepage.module.scss` — mood reference for glass depth and warmth

---

## 1) Scope map — routes → implementation

| Route | Primary page component | Styles (starting points) | Notes |
|-------|------------------------|----------------------------|-------|
| `/patient/dashboard` | `src/pages/patient/PatientDashboardPage.tsx` | `PatientDashboard.module.scss`, `PatientShellChrome.module.scss` | Booking readiness hub; highest traffic |
| `/patient/appointments` | `src/pages/patient/PatientAppointmentsPage.tsx` | `PatientAppointments.module.scss`, `PatientShellPage` | Lists, session join, states |
| `/patient/invoices` | `src/pages/patient/PatientInvoicesPage.tsx` | `PatientInvoicesPage.module.scss` | Tables/cards, financial trust |
| `/patient/resources` | `src/pages/patient/PatientResourcesPage.tsx` | `PatientPages.module.scss` (shared), page module | Grid of resources; detail is `/patient/resources/:id` — align but out of strict “six pages” unless you extend scope |
| `/recordings` | `src/pages/RecordingsPage.tsx` | `RecordingsPage.module.scss` | **Cross-role** route (`RecordingsPage`); patient must feel same shell/chrome as other patient pages |
| `/patient/account` | `src/pages/patient/PatientAccountPage.tsx` | Account module styles / `PatientPages.module.scss` | Tabs/settings — forms baseline = Register discipline |

**Shared shell (affects all):**

- `src/components/patient/PatientAppShell/PatientAppShell.tsx` + `.module.scss` — nav, notifications, layout width
- `src/components/patient/PatientShellPage/PatientShellPage.tsx` — main content width wrapper

---

## 2) Design principles

### 2.1 Enterprise (restraint + clarity)

- **Hierarchy first:** one clear page title, optional kicker, one primary action per viewport where possible.
- **Predictable density:** align card padding, grid gaps, and section spacing to `RESPONSIVE_SIZE_MATRIX.md` — avoid one-off margins in each page module.
- **Trust signals:** invoices and account areas stay calm — no flashy gradients on data tables; glass is **surface**, not distraction.

### 2.2 Glassmorphism (strict)

- Use **existing** `@include glass-card` / `glass-hover` or `patient-card` / `patient-panel` patterns from `_patientSurface.scss` — **not** new `backdrop-filter` stacks in feature SCSS.
- Layered depth: background (shell) → section band → cards → interactive rows. Limit **distinct** glass levels to **two** per page (primary surface + nested item) unless a third is already in primitives.
- **Contrast:** glass is invalid if text fails WCAG — test on real backgrounds; adjust tokenized overlay/alpha, not random `#fff`.

### 2.3 “Connected app” feel

- **One chrome story:** same outer shell padding, same title rhythm (`PatientShellPage` / shared title classes), same card corner radius family across the six routes.
- **Nav continuity:** active nav state + scroll behavior already live in `PatientAppShell` — pages should not introduce conflicting sticky headers that fight the shell.
- **Cross-route cues:** optional subtle **page enter** (fade/slide **8–16px**, ~200–280ms) applied via a **single** wrapper later (Phase 4) — not per-page one-off animations.
- **Empty / loading / error:** unify copy tone and illustration-free layout (glass card + short message + one CTA) across all six — extract if repeated 3+ times (governance rule).

### 2.4 Motion (clean, accessible)

- **Defaults:** opacity + transform only; avoid animating layout-affecting properties (`width`, `height`, `margin`).
- **Timing:** prefer `180ms–240ms` for UI reveals; stagger lists **lightly** (30–50ms index cap) — no long bounces.
- **Accessibility:** always gate behind `@media (prefers-reduced-motion: reduce)` → disable translate/stagger, keep instant or opacity-only.
- **Single home for keyframes:** add shared animation partial only if keyframes are reused across pages (see `CSS_GOVERNANCE.md` §2).

---

## 3) UX patterns to converge

| Pattern | Intent |
|---------|--------|
| **Page header block** | Kicker (optional) + H1 + short lead + optional primary button aligned to grid |
| **Metric / summary strip** | Dashboard and appointments: use one shared “stat glass pill” row component styled via tokens |
| **Primary list/card** | Appointment rows, invoice rows, recording rows — same hover, same focus ring, same spacing |
| **Resource tiles** | Grid tiles match homepage card **interaction** (hover lift token), not new shadows |
| **Account tabs** | Align with `patientTabs` / Register tab patterns; no second tab visual language |

---

## 4) Execution phases (follow in order)

Complete each phase before the next. After each phase, update `REFRACTOR_TRACKER.md` and run `npx tsc --noEmit` + quick visual pass on mobile + desktop.

### Phase 1 — Inventory + primitives gap (no visual drama)

1. For each file in §1, list **unique** card/button/section classes that duplicate `patient-card` / `glass-card`.
2. Decide **one** elevation level for “main content card” vs “nested row” — document in a short comment in `_patientSurface.scss` or `UI_PRIMITIVES_CATALOG.md` if new names are added.
3. **Do not** add new token families; only compose existing `--cs-*` / mixins.

**Exit criteria:** checklist of duplicate patterns with “replace with X primitive” notes.

### Phase 2 — Shell + page wrapper cohesion

1. Normalize `PatientShellPage` outer padding and title styles so all six pages share the same top rhythm.
2. Align `PatientAppShell` main region with page content width (avoid max-width mismatch between sidebar and content).
3. `/recordings`: ensure patient experience uses the same shell header/title band as `/patient/*` (may require conditional chrome inside `RecordingsPage` for patient role only).

**Exit criteria:** screenshots at 1280px: six routes share obvious structural alignment.

### Phase 3 — High-traffic: Dashboard + Appointments

1. `PatientDashboardPage` — section bands (readiness, next actions, education) on shared glass surfaces; reduce one-off classes.
2. `PatientAppointmentsPage` — list/empty states; session CTAs use shared button mixins (`_buttonSystem.scss`).

**Exit criteria:** no raw hex clusters in modules; cards use shared primitives.

### Phase 4 — Invoices + Resources

1. Invoices: table or card list with **dense** enterprise readability; glass on **container**, not every cell.
2. Resources: tile grid harmonized with dashboard resource shortcuts (if present).

**Exit criteria:** invoice line items scannable at a glance; resources feel like same product as dashboard.

### Phase 5 — Account + Recordings

1. Account: tabbed surfaces + form clusters use `_formSystem.scss` / Register alignment.
2. Recordings: player/list layout with same card language; patient role tested for shell parity.

**Exit criteria:** long forms and media page both feel “Clink” not “generic admin”.

### Phase 6 — Motion + polish pass

1. Introduce optional **single** `PatientRouteTransition` (or layout-level `fade`) if approved — **only** after static layouts are stable.
2. Verify `prefers-reduced-motion` on all new transitions.
3. Final responsive sweep per `RESPONSIVE_SIZE_MATRIX.md`.

**Exit criteria:** motion enhances; never blocks comprehension.

---

## 5) Quality gates (every PR touching this scope)

- [ ] No new ad-hoc palette or shadow system in page modules (`CSS_GOVERNANCE.md`)
- [ ] Glass from shared mixins / `patient-*` primitives only
- [ ] Focus states visible on interactive elements
- [ ] Keyboard: tab order sensible on tiles and lists
- [ ] `tsc` clean; no console errors on route change
- [ ] `CSS_GOVERNANCE.md` updated if new **shared** primitive categories are introduced

---

## 6) Out of scope (unless explicitly extended)

- Psychologist/admin/manager dashboards (track separately in `ROLE_DASHBOARD_GLASS_ROLLOUT.md` patterns)
- Full booking wizard (`/appointments/book-*`) — covered by `CROSS_SHELL_UI_REFACTOR_SPEC.md` §5
- Backend API or copy for clinical content

---

## 7) Living document

When a phase completes, append a dated **changelog** subsection here (Phase, date, PR/link, screenshots note) so future work does not re-litigate decisions.

### Changelog

- **2026-04-19 — Phase 1 (inventory) + shared chrome partial**
  - Documented L1/L2 in [`UI_PRIMITIVES_CATALOG.md`](UI_PRIMITIVES_CATALOG.md) §6 and header comment in [`_patientSurface.scss`](../src/assets/styles/_patientSurface.scss).
  - Introduced [`_patientPageChrome.scss`](../src/assets/styles/_patientPageChrome.scss) as the single source for max-width column, page/welcome headers, and CTA button chrome; [`PatientShellPage.module.scss`](../src/components/patient/PatientShellPage/PatientShellPage.module.scss) and [`PatientShellChrome.module.scss`](../src/pages/patient/PatientShellChrome.module.scss) both consume it (role pages keep importing Chrome path).
- **2026-04-19 — Phase 2 (shell alignment)**
  - Core patient routes use [`PatientShellPage`](../src/components/patient/PatientShellPage/PatientShellPage.tsx) as the main column wrapper; `/recordings` uses the same for patients.
- **2026-04-19 — Phases 3–6 (surfaces + motion)**
  - Dashboard `.card` uses `@include patient-card` (L1); removed duplicate glass migration override on `.consentBanner`.
  - Invoices: tokenized layout classes in [`PatientInvoicesPage.module.scss`](../src/pages/patient/PatientInvoicesPage.module.scss); L1 table shell via `surface-primary-no-hover`; stats via `patient-card`.
  - Resources: emergency icon color uses `var(--cs-error)` (no raw `#c0392b`).
  - Account: wrapped in `PatientShellPage`.
  - Recordings list cards: [`RecordingCard.module.scss`](../src/components/recordings/RecordingCard.module.scss) uses `patient-card`.
  - [`PatientAppShell`](../src/components/patient/PatientAppShell/PatientAppShell.tsx): route enter animation (`patientRouteEnter`, 10px translate, 220ms) on `mainContent` keyed by `location.pathname`; respects `prefers-reduced-motion`.

### Phase 1 — Surface audit checklist (replace with primitives over later phases)

| Route / file | L1 candidates (outer sections) | L2 candidates (nested) | Notes |
|--------------|--------------------------------|--------------------------|--------|
| `PatientDashboardPage` + `PatientDashboard.module.scss` | `.card`, `.videoHero`, band sections | inner rows, Medicare ring | Many local `.card` — map to `patient-card` / `patient-panel` |
| `PatientAppointmentsPage` + `PatientAppointments.module.scss` | list container, modals | appointment row | Unify empty/loading with shared pattern |
| `PatientInvoicesPage` + `PatientInvoicesPage.module.scss` | page container, summary | table rows, status chips | Glass on outer container only |
| `PatientResourcesPage` + `PatientPages.module.scss` | category grid, resource cards | emergency cards | Raw icon color `#c0392b` — tokenize |
| `RecordingsPage` + `RecordingsPage.module.scss` | list container | `RecordingCard` | Cross-role: keep parity for patient |
| `PatientAccountPage` + `PatientPages.module.scss` | tab panels, form sections | fields | Align with `formSystem` / `patientFormRow` |
| `PatientAppShell` | (not L1 card — layout) | — | `main` padding vs `PatientShellPage` max-width |

Raw hex / legacy clusters: flagged in feature modules above; addressed incrementally in Phases 3–5 (no new palette).
