# Responsive Size Matrix

Defines shared sizing rhythm for all frontend pages.

## 1) Breakpoints

Use project token breakpoints only. Do not invent page-local breakpoints unless justified.

- `sm`: mobile baseline
- `md`: tablet portrait
- `lg`: tablet landscape / small desktop
- `xl`: desktop
- `2xl`: wide desktop

## 2) Spacing Scale

Use one spacing ladder consistently:

- `4`, `8`, `12`, `16`, `24`, `32`, `40`, `48` (px-equivalent rhythm)

Guidelines:

- Section-to-section spacing: medium/large steps.
- In-card spacing: small/medium steps.
- Avoid mixed one-off values that break rhythm.

## 3) Control Heights

- Compact controls: `40px`
- Default controls: `$min-touch-target` (`44px`)
- Prominent CTA: `48px`

All interactive controls should meet minimum touch target standards.

## 4) Button Metrics

- Ghost horizontal padding: `1.5rem`
- Primary horizontal padding: `1.75rem`
- Line-height: `1.2`
- Alignment: inline-flex, center/center

## 5) Radius Scale

- Standard controls/cards: `--cs-radius-xl`
- Large panels/hero cards: `--cs-radius-2xl`

Avoid ad-hoc radii in feature modules.

## 6) Typography Rhythm

Use shared heading/body ramps and keep line-height readable:

- Headlines: tighter tracking, clear hierarchy.
- Body/metadata: consistent scale and spacing cadence.

## 7) Layout Rhythm

- Shared top/bottom wrapper spacing across similar routes.
- Consistent sticky action spacing and safe-area handling.
- Keep content scan-friendly with predictable vertical flow.

## 8) Validation Checklist

- [ ] No random one-off sizes in touched scope.
- [ ] Controls meet minimum target size.
- [ ] Breakpoint behavior is consistent with adjacent pages.
- [ ] Visual rhythm is consistent across role dashboards.
