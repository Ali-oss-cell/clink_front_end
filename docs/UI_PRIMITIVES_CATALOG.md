# UI Primitives Catalog

This catalog defines reusable UI styling primitives and their intended usage.

## 1) Surfaces — `_surfaceSystem.scss`

- `@include surface-primary`
  - Primary container surface for major panels, interactive cards, and dashboard feature cards.
  - Provides: glass bg, border, shadow, radius, hover lift, `::before` radial highlight.
  - Respects `prefers-reduced-motion`.
- `@include surface-primary-no-hover`
  - Same as `surface-primary` but without hover transform. Use for static containers.
- `@include surface-secondary`
  - Softer variant for nested areas, filter panels, or low-emphasis sections.
- `@include surface-flat`
  - Minimal neutral container for utility strips and compact metadata.

## 2) Wizard Chrome — `_wizardSystem.scss`

- `@include wizard-step-band`
  - Full-width tonal strip for the booking progress bar.
- `@include wizard-sticky-actions`
  - Transparent/fade sticky action shell. Replaces opaque white footer boxes.
- `@include wizard-viewport-lock`
  - Flex column contract for no-scroll viewport (`height: 100%; min-height: 0; overflow: hidden`).

## 3) Forms — `_formSystem.scss`

- `@include form-card`
  - Glass card wrapper for form containers (derived from Register.module.scss).
- `@include form-field-cluster`
  - Inner grouping container for related form fields.
- `@include form-input`
  - Input base with consistent border, padding, focus ring.
- `@include form-label`
  - Label styling: block display, 600 weight, small font.
- `@include form-actions`
  - Action row: flex, gap, border-top, margin-top.
- `@include form-button-primary`
  - Primary CTA button: min-height 48px, gradient, rounded.
- `@include form-button-ghost`
  - Secondary/ghost button: min-height 48px, outline style.

## 4) Legacy Mixins — `_mixins.scss`

- `@include glass-card($role, $blur, $strong)` — lower-level glass helper. Prefer `surface-primary` for new code.
- `@include glass-hover($role)` — hover lift + glow. Included in `surface-primary`.
- `@include card-surface($role, $strong)` — wrapper combining `glass-card` + radius + padding.

## 5) Governance Rules

- Add new primitive only when existing primitives cannot satisfy requirements.
- If a visual pattern appears in 3+ places, it must be represented as a primitive.
- Feature modules should consume primitives, not reinvent them.
- Prefer `surface-primary` / `surface-secondary` over raw `glass-card` calls in new code.

## 6) Patient hub elevation — `_patientSurface.scss` (L1 / L2)

Used by the patient portal core pages (dashboard, appointments, invoices, resources, account, recordings). See `docs/PATIENT_CORE_PAGES_ENTERPRISE_GLASS_SPEC.md`.

| Tier | Mixin / primitive | Use |
|------|-------------------|-----|
| **L1** | `@mixin patient-card` (or `@include surface-primary` from `_surfaceSystem.scss` when the homepage-style glass lift is required) | Primary page sections, outer list containers, hero cards |
| **L2** | `@mixin patient-panel` | Rows, nested summaries, inset metadata inside an L1 card |

Rules: prefer at most **two** distinct surface depths per viewport; no ad-hoc `backdrop-filter` in feature modules — compose from `patient-card` / `patient-panel` / `surface-*` / `glass-card`.

## 7) Migration Notes

When refactoring legacy modules:

1. Map local class to nearest primitive mixin.
2. Replace local visual system with `@include` directive.
3. Remove the individual properties the mixin provides (background, border, shadow, radius, backdrop-filter).
4. Keep only semantic/layout rules in the feature module (padding, margin, width, display, etc.).
