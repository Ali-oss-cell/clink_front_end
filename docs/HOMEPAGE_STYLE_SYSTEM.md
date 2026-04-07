# Homepage Style System

This document defines the visual source of truth for all frontend surfaces.

**Execution brief (shells, cards, forms, wizard, all roles):** see `CROSS_SHELL_UI_REFACTOR_SPEC.md`.

## 1) Source of Truth

- Primary visual reference: `src/pages/public/Homepage.module.scss`
- Token source: `src/assets/styles/_clinicalSanctuary.scss`
- Shared effects/mixins: `src/assets/styles/_mixins.scss`
- Governance: `docs/CSS_GOVERNANCE.md`

If a style cannot be traced to these sources, treat it as drift and refactor.

## 2) Visual Direction

- Mood: modern, elegant, warm, calm.
- Surfaces: soft glass, layered depth, restrained highlights.
- Contrast: clear text hierarchy, accessible controls, low-noise backgrounds.
- Motion: subtle, smooth, never distracting.

## 3) Core Surface Language

- Use shared glass primitives for card-like containers.
- Prefer atmospheric shadows (`--cs-shadow-atmospheric`) over heavy dark shadows.
- Use border radii from tokens (`--cs-radius-xl`, `--cs-radius-2xl`).
- Avoid creating per-page card systems that duplicate global primitives.

## 4) Control Language

- Buttons, inputs, selects, and search fields must use shared primitives.
- Keep focus treatment consistent and visible.
- Keep touch targets at or above `$min-touch-target`.
- Use one ghost button model and one primary gradient model across dashboards.

## 5) Typography and Rhythm

- Headline and body fonts come from shared tokens.
- Keep heading/lead/body scale consistent between pages.
- Align sections to shared spacing rhythm; avoid one-off vertical spacing.

## 6) Responsive Behavior

- Use shared breakpoint system and spacing scale.
- Preserve layout readability at mobile/tablet/desktop.
- Avoid page-specific random breakpoints unless justified and documented.

## 7) Acceptance Checklist

- [ ] Uses homepage-led visual system and Clinical Sanctuary tokens.
- [ ] No ad-hoc color/shadow/radius systems added.
- [ ] Shared controls and surfaces reused.
- [ ] Responsive behavior validated.
- [ ] Accessibility basics preserved (focus, contrast, target size).
