# Frontend CSS Governance

This document defines the styling contract for `clink_front_end` to keep CSS clean, consistent, and maintainable.

**Cross-shell refactor (homepage navbar → sidebars, homepage cards, Register-style forms, booking wizard no-scroll, all roles):** follow `docs/CROSS_SHELL_UI_REFACTOR_SPEC.md` together with `HOMEPAGE_STYLE_SYSTEM.md`, `UI_PRIMITIVES_CATALOG.md`, `RESPONSIVE_SIZE_MATRIX.md`, and `REFRACTOR_TRACKER.md`. For the six core patient portal routes (dashboard, appointments, invoices, resources, recordings, account settings), follow **`docs/PATIENT_CORE_PAGES_ENTERPRISE_GLASS_SPEC.md`** as the phased playbook for enterprise glass + connected-app UX.

## 1) Authoritative Style Layers

- Sass design tokens: `src/assets/styles/_variables.scss`
- Clinical Sanctuary CSS custom properties: `src/assets/styles/_clinicalSanctuary.scss` (`.patientShell`, `.clinicalShell`)
- **Global motion (imported once in `index.scss` — not in CSS Modules):** `src/assets/styles/_animations.scss` — `fadeInUp` (24px), `fadeInUpShort` (12px), `fadeInUpMedium` (20px), `fadeInUpDeep` (30px)
- **Surface primitives:** `src/assets/styles/_surfaceSystem.scss` (`surface-primary`, `surface-secondary`, `surface-flat`, `surface-compact`, `surface-compact-interactive`, `surface-compact-selected`, `role-empty-glass`, `role-empty-glass-table-cell`, `role-empty-glass-icon` for role dashboard list/table empty states)
- **Wizard primitives:** `src/assets/styles/_wizardSystem.scss` (`wizard-step-band`, `wizard-sticky-actions`, `wizard-viewport-lock`)
- **Form primitives:** `src/assets/styles/_formSystem.scss` (`form-card`, `form-field-cluster`, `form-input`, `form-actions`)
- **Patient surface primitives:** `src/assets/styles/_patientSurface.scss` (`patient-card`, `patient-panel`, `patient-card-title`, `patient-action-bar`)
- **Patient form row primitives:** `src/assets/styles/_patientFormRow.scss` (`input`, `textarea`, `input-row`, `checkbox-card`, `option-card`, `label`, `hint`) — e.g. booking Step 1 `BookingBillingPathToggle` composes `option-card` for Medicare vs private.
- **Patient tab primitives:** `src/assets/styles/_patientTabs.scss` (`tab-row`, `tab-pill`)
- **Patient page chrome (shared partial):** `src/assets/styles/_patientPageChrome.scss` — consumed by `PatientShellPage.module.scss` and `PatientShellChrome.module.scss` for aligned headers/wrap/CTAs (do not fork duplicate headers in feature modules).
- **Site-wide glass map (where to use it, where to hold back):** `docs/WEBSITE_GLASSMORPHISM_GUIDE.md`
- Shared glassmorphism mixins: `src/assets/styles/_mixins.scss` (`glass-card`, `glass-hover`)
- Shared dashboard button system: `src/assets/styles/_buttonSystem.scss`
- Shared compact portal sizing/surfaces: `src/assets/styles/_portalCompact.scss`
- Shared/global primitives: `src/assets/styles/*`, `src/components/ui/ui.scss`
- Feature styles: `src/**/*.module.scss`

Rule: feature modules consume tokens; they do not define new palette systems.

## 2) Professional CSS Standards

- Prefer token usage over raw color literals in feature modules.
- Prefer shared patterns/mixins for recurring button/card/badge treatments.
- Avoid duplicated keyframes; centralize common animation definitions.
- Keep module classes clear and stable with matching TSX usage.
- Avoid static inline style objects in TSX unless runtime-calculated values are required.

## 3) Anti-Churn Rules

- If similar pattern appears in 3+ places, extract shared style partial/utility.
- Large page modules should be split into focused files by section or component.
- Style changes must not bypass token layers in `_variables.scss` or `_clinicalSanctuary.scss`.
- Dashboard buttons must use shared button mixins/tokens, not per-page color/shadow inventions.
- Card surfaces should use shared glass primitives instead of ad-hoc blur/alpha patterns.
- Sidebar branding for authenticated shells must use `ShellBrandMark` (`src/components/shell/ShellBrandMark.tsx`) so patient/role shells stay consistent with `/logo-icon.png`.

## 4) High-Churn Decomposition Targets

Prioritize these files for refactoring into shared/reusable style segments:

- `src/pages/patient/PatientPages.module.scss`
- `src/pages/psychologist/PsychologistPages.module.scss`
- `src/pages/admin/AdminPages.module.scss`
- `src/pages/manager/ManagerPages.module.scss`

## 5) Required Doc Sync

When token/theme values change, update:

- `COLOR_THEME_GUIDE.md`
- `THEME_QUICK_REFERENCE.md`
- This document (`docs/CSS_GOVERNANCE.md`) if architecture rules changed.

## 6) Marketing homepage: hero under fixed nav

- Public marketing `Header` inner `.container` pill uses a **dark sage gradient** (not a light glass wash) so the mark and nav links stay legible; logo uses a light lift via `filter` for contrast.
- Primary nav CTA (`.registerButton`, e.g. “Start booking”) uses a **solid sage gradient** on tokens (`$btn-admin-primary` / `$primary-color`), not `glass-card`, so it does not read as metallic/silver on the dark bar.
- `Layout` exposes `overlayPublicHeader` (used only on `Homepage`). That sets `Header` `heroOverlay`, moving glass styling to the inner `.container` pill so the outer `<header>` is a full-width transparent track.
- `Homepage.module.scss` fixes the header (`> header { position: fixed }`) and offsets the hero slider upward so background imagery meets the top of the viewport under the nav (safe-area aware). The hero block uses `min-height: 100dvh` (with `100svh` fallback) and the slider uses `bottom: 0` so backgrounds meet the bottom of the viewport without a white gap. Other public routes keep the default sticky, full-glass header.
- `Layout.module.scss` applies shared top clearance to `.main` for fixed-header pages; complex surfaces that manage overlap directly (homepage hero, auth split layouts) should explicitly set `padding-top: 0` in their page scopes.

## 7) Homepage sectioning and rich text hierarchy

- Major homepage content sections should use a shared full-section shell (`min-height` with `dvh/svh` and centered content) so sections read as intentional chapters.
- For the current homepage chapter set (`benefitsStrip`, `quickMatch`, `costClarity`, `features`, `resourcesTeaser`, `howItWorks`, `spotlight`, `trustBand`, `accessFunding`, `testimonials`, `bottomCta`), keep all sections on the shared full-section shell for consistent narrative rhythm.
- Alternate subtle section surface treatments/borders to reinforce separation without harsh color jumps.
- For richer copy, enforce kicker/title/lead hierarchy with constrained line-lengths (`~60-70ch`) and relaxed line-height for readability.
- Section media should be intentional and curated (not decorative filler): keep consistent aspect treatment, meaningful `alt` text, and balanced copy/media density across breakpoints.
- Preserve CTA route structure while expanding copy; content changes should not alter navigation semantics.

## 8) PR Checklist for Styling Work

- [ ] Uses existing tokens (no new raw palette in feature modules)
- [ ] No duplicate pattern introduced when a shared option exists
- [ ] Module scope remains clear and component-aligned
- [ ] Theme reference docs updated if token values changed
- [ ] Dashboard button classes map to shared role variants (`patient`, `psychologist`, `admin`, `manager`)
- [ ] Card-like containers use centralized glass mixins/tokens (role-mapped where possible)
- [ ] If changing homepage hero/header stacking, keep `overlayPublicHeader` + `heroOverlay` paired and safe-area calcs in sync (`Homepage.module.scss`, `Header.module.scss`)
- [ ] Public/legal/info cards and auth form shells prefer shared `glass-card`/`glass-hover` primitives over manual white card shadows

## 9) Role dashboard glass rollout

- All role dashboard surfaces use `@include surface-primary` / `surface-secondary` from `_surfaceSystem.scss`.
- Legacy systems removed: `--shell-*` (RoleAppShell), `--tp-*` (all pages), `$admin-primary/$admin-accent` (AdminPages), `glass-card(admin/manager)` calls.
- All role shells (PatientAppShell, RoleAppShell) now use `--cs-*` tokens exclusively.
- Patient workspace chrome: sticky shell (`topBar`) wraps a centered **glass pill** (`topBarPill`, ~14px radius, `cs-glass-*` borders/shadows — homepage par language); notifications are an **icon-only** control (`notifBtn`, no white tile). Route title from `patientShellPageTitle.ts`; same referral notification poll as before.
- Track completion in `docs/REFRACTOR_TRACKER.md`.

## 10) Compact dashboard contract

- Authenticated dashboards/tabs must default to compact surfaces (`surface-compact*`) over deep hover elevations.
- Hover/click depth is capped to subtle lifts (`~1px`) and small shadows; avoid large blur stacks and dramatic jumps.
- Selected cards/buttons must use tinted token backgrounds + token borders with readable text (no high-contrast glow-only states).
- Shell main-content paddings should stay in compact range to increase information density without reducing touch targets.

## 11) Website-wide scaling and accessibility rhythm

- Use shared sizing tokens from `src/assets/styles/_variables.scss` (`$page-gutter-inline`, `$card-padding-lg`, `$surface-radius-lg`, `$min-touch-target`) for page rhythm before adding per-page values.
- Keep shell parity between `PatientAppShell` and `RoleAppShell` for collapse breakpoint, main-content padding, nav row density, and minimum control target size.
- TSX inline style blocks for spacing/typography are disallowed for static UI; move them to module classes and reuse shared rhythm helpers.
- Public/auth/dashboard pages should align to the same vertical density baseline so route transitions feel consistent.
- Patient booking flow: use `bookingFlowMain` + `formActionsSticky` from `PatientPages.module.scss` so Continue/Back stays reachable on small viewports; use shared `Badge` for unavailable session-type labels, not ad-hoc badge divs.
- Booking route model: `/appointments/book-appointment` is the wizard host. Use `?step=1..5` plus state params (`service`, `psychologist`, `appointment_id`). Legacy step routes (`/appointments/psychologist-selection`, `/appointments/date-time`, `/appointments/details`, `/appointments/payment`) are direct redirects into the wizard host and must preserve existing query params.
- Date/time booking step: root sets `data-patient-booking-viewport`; `PatientAppShell` `.main:has([data-patient-booking-viewport])` keeps the shell from scrolling so the page owns overflow. Compose `bookingFlowMain` with `DateTimeSelection.module.scss` `bookingMainLock` (no vertical scroll on the happy path; `:has(.errorState|.loadingState|.emptyState)` may scroll). Date and time options live in horizontal strips (`overflow-x: auto` only). At `lg+`, fee summary lives in `bookingSummaryAside` beside `bookingDatetimeMain`; mobile stacks aside above strips.
- Booking flow chrome: use `src/components/patient/BookingFlowProgress/BookingFlowProgress.tsx` (segmented bar, 4 px height, 4 px gap, steps 1–5) at the top of the booking `.container` on **all** wizard steps (service → payment); do not duplicate “Step N of 5” kickers in page bodies. Inactive segments: `var(--cs-surface-high)` solid fill. Active: `var(--cs-primary → cs-primary-container)` gradient. Service selection: centered editorial hero, pill search, service cards with simplified content (icon well → title → 3-line description → single meta line → text CTA row) and `3px` left pillar accent on hover/selected. No verbose pricing table in cards. Three info boxes replaced by a single `.helpStrip` row. Psychologist selection: `bookingSplit` with sticky `bookingSidebar` (back + filters) and `bookingMainCanvas` with editorial header + **single-column horizontal-row cards** (`psychologistAvatarWrap` | `psychologistMeta` | `cardActions`).
- **Radius standard:** all booking flow cards and buttons use `var(--cs-radius-xl, 0.75rem)` — never hardcode `2rem`, `1.75rem`, or `50px` for booking UI. The token value `0.75rem` (12 px) is defined in `_clinicalSanctuary.scss`.
- **Button standard (booking flow):** back/ghost = `.bookingBackButton` (transparent, `cs-outline` border, `cs-primary` text, `cs-radius-xl`); primary next = `.bookingNextButton` (gradient `cs-primary → cs-primary-container`, `cs-on-primary` text, `cs-radius-xl`, soft shadow). Both defined in `PatientPages.module.scss`. Never apply `error-red` hover on cancel/back actions.
- **Kicker colour:** `.bookingFlowKicker` uses `var(--cs-on-tertiary-fixed-variant, #4f4633)` for warm-contrast step label. Do not use `$patient-primary` or `$secondary-color` for the kicker.
- **Wizard spacing rhythm:** keep booking step wrappers on a shared baseline (`~1rem` top, `~0.9rem` bottom), keep top header blocks at `~1rem` bottom margin, and keep sticky action regions at `>= 0.6rem` bottom safe-area padding so steps 1–5 feel visually continuous.
- Date/time booking step: root sets `data-patient-booking-viewport`; `PatientAppShell` `.main:has([data-patient-booking-viewport])` keeps the shell from scrolling so the page owns overflow. Compose `bookingFlowMain` with `DateTimeSelection.module.scss` `bookingMainLock` (no vertical scroll on the happy path). Page title uses `clamp(1.35rem, 3vw, 2rem)`. Header is flat (no glass-card). Date and time options live in horizontal strips (`overflow-x: auto` only). At `lg+`, fee summary lives in `bookingSummaryAside` beside `bookingDatetimeMain`; mobile stacks aside above strips.
- For API query params that represent a **local calendar date** (e.g. `start_date`), use `src/utils/dateLocal.ts` `formatLocalDateYYYYMMDD` instead of `toISOString().split('T')[0]` to avoid UTC day boundary drift.

## 12) Patient setup wizard (2026-04-19)

- Post-auth for patients always routes through `/patient/setup`. The server is the source of truth via `GET/PATCH /api/auth/patient/setup/` and `POST /api/auth/patient/setup/complete/`; draft state must not live in `localStorage`.
- Wizard chrome: `src/components/patient/SetupWizardChrome/SetupWizardChrome.{tsx,module.scss}` — progress band + title block + sticky action bar. Uses Clinical Sanctuary tokens only.
- Step content: `src/pages/patient/setup/steps/*` (`WelcomeStep`, `ContactStep`, `PrivacyTelehealthStep`, `BillingPathStep`, `ReferralStep`, `IntakeMinStep`, `IntakeFullStep`, `ReviewStep`). Steps share styles from `SetupStep.module.scss`.
- Global wizard CTAs: `patient-cta-primary` / `patient-cta-secondary` are exposed from `SetupWizardChrome.module.scss` via `:global`. Do not redefine per step.
- Legacy `PatientIntakeFormPage` is removed. `/patient/intake-form` is now a `<Navigate>` redirect to `/patient/setup`.
- Dashboard: the patient dashboard no longer renders `OnboardingProgress` and instead surfaces a single readiness banner + setup card driven by `GET /api/auth/booking-readiness/`.
- Shared primitives planned for adoption across patient pages: `_patientSurface.scss`, `_patientFormRow.scss`, `_patientTabs.scss`. New patient feature work should consume these mixins instead of growing `PatientPages.module.scss`.
