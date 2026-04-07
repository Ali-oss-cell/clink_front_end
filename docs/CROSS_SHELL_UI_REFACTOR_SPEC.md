# Cross-Shell UI Refactor — Execution Spec

This document is the **primary execution brief** for unifying the entire product UI. It translates product intent into concrete deliverables. Cursor and humans should follow this together with:

| Document | Role |
|----------|------|
| `HOMEPAGE_STYLE_SYSTEM.md` | Visual direction and source-of-truth files |
| `UI_PRIMITIVES_CATALOG.md` | Named primitive categories to implement and reuse |
| `RESPONSIVE_SIZE_MATRIX.md` | Spacing, breakpoints, control sizes |
| `REFRACTOR_TRACKER.md` | Status and batch checklist |
| `CSS_GOVERNANCE.md` | Architecture rules and PR expectations |
| `.cursor/rules/21-homepage-design-system-source-of-truth.mdc` | Always-on enforcement |

---

## 1) North Star

- **One visual language** across public site, auth, and all role shells (Patient, Psychologist, Admin, Practice Manager).
- **Homepage** (`src/pages/public/Homepage.module.scss` + related header/nav) is the **aesthetic source of truth**: warm, modern, elegant glass and tonal surfaces.
- **Clinical Sanctuary tokens** (`_clinicalSanctuary.scss`) remain the **semantic color/type token layer** for app shells; homepage mood maps onto tokens and shared mixins, not one-off hex forests in feature modules.
- **No acceptable drift**: sidebar that looks like “dashboard 2015”, cards that look flat-white while homepage cards glow, or forms that ignore the register pattern.

---

## 2) Shell Navigation — Homepage Navbar → All Sidebars

**Intent:** The **same style language as the homepage navbar** (glass pill, tonal border, hover/focus, typography rhythm) applies to **every role sidebar** for:

- Patient (`PatientAppShell` and equivalents)
- Psychologist (role shell sidebar)
- Admin (role shell sidebar)
- Practice Manager (role shell sidebar)

**Deliverables:**

1. Extract or align sidebar chrome to shared primitives (background, border, blur if used, nav item states, active indicator, section spacing).
2. Reuse the same **control density** and **touch targets** as homepage nav affordances where applicable.
3. Brand/logo treatment stays consistent with existing shell rules (`ShellBrandMark`, etc.); do not invent a second brand row style.

**Out of scope for “copy-paste”:** Marketing header is fixed overlay on homepage; sidebars are vertical. **Match tokens, glass, borders, and interaction**, not pixel-identical layout.

**Files to converge (audit and normalize):**

- `src/components/patient/PatientAppShell/`
- Role shell components parallel to patient (admin / manager / psychologist) — locate via `RoleAppShell`, `*Shell*.module.scss`, sidebar modules.

---

## 3) Cards Everywhere — Homepage Card Language

**Intent:** Any **card-like surface** (dashboard tiles, list rows elevated to cards, wizard panels, summaries) uses the **same card system as the homepage** (warm glass, layered shadow, border, hover elevation where appropriate — respecting `prefers-reduced-motion`).

**Deliverables:**

1. Implement **one or two** shared card primitives (primary + secondary emphasis) in shared Sass (see `UI_PRIMITIVES_CATALOG.md`), derived from homepage patterns and `--cs-*` tokens.
2. Replace page-local “white box + random shadow” with those primitives across all four account types.
3. Remove duplicate card definitions from large page modules after migration.

**Reference assets:** `the fix/stitch/*/screen.png` and `code.html` for **layout density and sectioning**; **colors** stay on Clink tokens + homepage-led surfaces.

---

## 4) Forms — Register Page as the Baseline

**Intent:** All **forms** (auth, settings, intake, booking details, admin CRUD, etc.) should feel like the **Register** flow: consistent field spacing, labels, input shells, focus rings, error/help text, and primary/secondary actions.

**Deliverables:**

1. Audit `src/components/auth/Register/` and `Register.module.scss` (and related auth pages) and extract **form field + layout primitives** where they are not already shared.
2. Apply the same patterns to:
   - Patient booking wizard steps that collect data
   - Psychologist / Admin / Manager forms
   - Any modal or inline form in dashboards
3. Do not maintain parallel “old form” styles in feature modules.

---

## 5) Appointment Wizard — Layout, No Scroll, All Steps Work

**Intent:**

- **One laptop viewport** should present the wizard **without vertical or horizontal scrolling** on the **happy path** (reference: `the fix/stitch/` — everything has a place; no overflow strips).
- **All five steps** must remain **fully functional** (navigation, guards, API behavior, back/next, payment flows unchanged).
- Sectioning must be **deliberate**: progress, context, primary content, sticky actions — same rhythm as the reference layouts.

**Hard requirements:**

| Requirement | Detail |
|-------------|--------|
| No scroll (happy path) | Main wizard viewport uses flex/grid + `min-height: 0` + shell cooperation (`data-patient-booking-viewport`, `PatientAppShell` main rules). No `overflow-y: auto` on the outer wizard column unless error/loading/empty states require it. |
| No horizontal scroll | Date/time and similar controls **wrap or fit** within width; no horizontal strip scroll for core choices. |
| All steps work | Step query params, redirects, booking API, Stripe return URLs, and back navigation stay correct after layout changes. |
| Reference | Use `the fix/stitch/` for **structure and density**, not for importing alien colors. |

**Deliverables:**

1. Single wizard shell: progress bar, content region, action row — visually unified with homepage glass + register form discipline.
2. Remove opaque white “footer box” around actions if product wants integrated actions; keep buttons and behavior.
3. Verify each step 1–5 in patient shell at **~1280×800** and **1440×900** without unintended scroll.

---

## 6) Scope — All Tabs / Pages Per Account Type

Apply the above **across every surface** for:

- **Patient** — dashboard, appointments, booking wizard, intake, invoices, resources, recordings, account/settings as present in app.
- **Psychologist** — dashboard and all sub-routes.
- **Admin** — dashboard and all sub-routes.
- **Practice Manager** — dashboard and all sub-routes.

**Method:** Work in **batches** (update `REFRACTOR_TRACKER.md` per batch): primitives first, then shell sidebars, then cards on high-traffic pages, then forms, then wizard polish.

---

## 7) Implementation Order (Recommended)

1. **Shared primitives** — sidebar chrome, card, form field, wizard shell, sticky actions (transparent/fade per spec).
2. **Shell sidebars** — all four roles using one system.
3. **High-traffic dashboards** — cards + sections.
4. **Auth and settings forms** — register-aligned.
5. **Booking wizard** — viewport-locked layout + reference sectioning.
6. **Sweep** — remove dead classes, fix lints, update tracker.

---

## 8) Quality Gates (Every Batch)

- [ ] Uses tokens (`--cs-*`) and shared mixins; no new raw palette systems.
- [ ] Sidebar matches homepage navbar **language** (glass, border, interaction).
- [ ] Cards match homepage card **language**.
- [ ] Forms match Register **language**.
- [ ] Wizard: happy path **no vertical/horizontal scroll** at target laptop sizes; steps 1–5 verified.
- [ ] Accessibility: focus visible, contrast, minimum targets.
- [ ] `CSS_GOVERNANCE.md` + `REFRACTOR_TRACKER.md` updated for the batch.

---

## 9) Explicit Non-Goals

- Rewriting business logic or API contracts unless a UI change **requires** a documented contract update (then follow `WORKFLOW_PLAYBOOK.md` / backend docs).
- Pixel-perfect clone of `the fix/` HTML in non-Clink colors.
- Adding new scroll-based UX patterns inside the wizard happy path.

---

## 10) Quick Reference Map

| User said | Implementation anchor |
|-----------|------------------------|
| Homepage navbar → sidebars | Shared sidebar primitive + tokenized glass/border/nav states |
| Cards like homepage | Shared `surface/glass-primary` (or named mixin) from homepage patterns |
| Forms like Register | Shared form primitives from Register/auth modules |
| Wizard no scroll, one screen | Flex viewport contract + shell + step layouts per `the fix/stitch/` density |
| All roles | Patient + Psychologist + Admin + Practice Manager shells and pages |

This spec is **complete for Cursor-led execution** when read with the linked docs above.
