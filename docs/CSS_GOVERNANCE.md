# Frontend CSS Governance

This document defines the styling contract for `clink_front_end` to keep CSS clean, consistent, and maintainable.

## 1) Authoritative Style Layers

- Sass design tokens: `src/assets/styles/_variables.scss`
- Shared dashboard button system: `src/assets/styles/_buttonSystem.scss`
- Shared glassmorphism mixins: `src/assets/styles/_mixins.scss` (`glass-card`, `glass-hover`)
- Scoped patient CSS variables: `src/assets/styles/_clinicalSanctuary.scss`
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

- Admin, psychologist, and practice-manager dashboard surfaces should follow the same glass baseline used in patient surfaces.
- Apply changes via shared role modules first (`AdminPages.module.scss`, `PsychologistPages.module.scss`, `ManagerPages.module.scss`) before per-page exceptions.
- Track cross-page completion in `docs/ROLE_DASHBOARD_GLASS_ROLLOUT.md` so scope remains explicit and auditable.

## 10) Website-wide scaling and accessibility rhythm

- Use shared sizing tokens from `src/assets/styles/_variables.scss` (`$page-gutter-inline`, `$card-padding-lg`, `$surface-radius-lg`, `$min-touch-target`) for page rhythm before adding per-page values.
- Keep shell parity between `PatientAppShell` and `RoleAppShell` for collapse breakpoint, main-content padding, nav row density, and minimum control target size.
- TSX inline style blocks for spacing/typography are disallowed for static UI; move them to module classes and reuse shared rhythm helpers.
- Public/auth/dashboard pages should align to the same vertical density baseline so route transitions feel consistent.
