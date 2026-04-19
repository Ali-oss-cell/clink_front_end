# Booking wizard Step 1 (service selection) — UI enhancement spec

Purpose: make `/appointments/book-appointment` **Step 1 — “How can we help today?”** feel as intentional as the marketing homepage: clearer hierarchy, less empty vertical space, stronger trust/billing/service rhythm, without inventing a second visual system.

**Governance:** [`CSS_GOVERNANCE.md`](CSS_GOVERNANCE.md), homepage tokens in [`src/assets/styles/_clinicalSanctuary.scss`](../src/assets/styles/_clinicalSanctuary.scss), wizard primitives in [`_wizardSystem.scss`](../src/assets/styles/_wizardSystem.scss`). Cross-shell intent: [`CROSS_SHELL_UI_REFACTOR_SPEC.md`](CROSS_SHELL_UI_REFACTOR_SPEC.md).

---

## 1) Current implementation map

| Area | Primary files |
|------|----------------|
| Page shell + layout | [`ServiceSelectionPage.tsx`](../src/pages/patient/ServiceSelectionPage.tsx), [`PatientPages.module.scss`](../src/pages/patient/PatientPages.module.scss) (`.bookingFlow*`, `.billingPath*`, `.serviceCard*`, `.serviceSearch*`) |
| Step chrome | [`BookingFlowProgress`](../src/components/patient/BookingFlowProgress/BookingFlowProgress.tsx) |
| Trust strip | [`BookingFlowTrustPanel`](../src/components/patient/BookingFlowTrustPanel/BookingFlowTrustPanel.tsx) + [`BookingFlowTrustPanel.module.scss`](../src/components/patient/BookingFlowTrustPanel/BookingFlowTrustPanel.module.scss) |
| Patient shell | [`Layout`](../src/components/common/Layout/Layout.tsx) + `patientShell` |

---

## 2) Diagnosis (from live UI + code)

These match common feedback: “cards too large / lots of whitespace,” “trust box feels faint,” “search feels disconnected,” “sidebar icons feel small.”

1. **Vertical rhythm** — Hero → trust panel → billing path → (Medicare) referral → search → service grid reads as **five stacked blocks** with similar weight; the eye does not know what to do first after the headline.
2. **Billing path cards** — Two large touch targets with short copy create **empty interior** on wide viewports; unselected state can read “dimmed” rather than “available alternative.”
3. **Trust panel** — [`BookingFlowTrustPanel`](../src/components/patient/BookingFlowTrustPanel/BookingFlowTrustPanel.module.scss) uses a light gradient + small caps title; on a warm page background **contrast is acceptable but hierarchy is weak** (title and body compete with the hero).
4. **Search** — Sits **between** referral plumbing and the grid; visually it floats unless tied to the grid with a shared section label (“Choose a session type”) and spacing.
5. **Service cards** — Icon wells + title + description + meta + CTA row are correct structurally; at desktop **min-height / padding** may exaggerate emptiness when descriptions are short.
6. **Sidebar** — Nav density is controlled by [`PatientAppShell`](../src/components/patient/PatientAppShell/); improving Step 1 does not require sidebar changes, but a **future batch** can align nav icon size with [`RESPONSIVE_SIZE_MATRIX.md`](RESPONSIVE_SIZE_MATRIX.md) if Product wants.

---

## 3) Design goals (what “better” means here)

- **One primary task at a time:** first “how you pay” (Medicare vs private), then “which service,” with referral/upload clearly **supporting** Medicare only.
- **Tighter vertical story:** reduce perceived gap between intent (headline) and action (billing + services).
- **Token-led surfaces:** reuse `patient-panel` / `surface-*` / wizard band patterns from shared partials where possible — **no new hex palette** in the page module.
- **Accessibility:** keep focus rings, `aria-pressed` on billing toggles, keyboard grid; do not shrink touch targets below ~44px height for primary choices.

---

## 4) Recommendations (prioritized)

### Tier A — High impact, contained CSS/markup (good first PR)

| # | Change | Rationale | Where |
|---|--------|-----------|--------|
| A1 | Add a **page kicker** above the H1 using existing `.bookingFlowKicker` pattern (e.g. “Book a session” / “Step 1 — Service”) | Anchors the step and matches homepage section rhythm | [`ServiceSelectionPage.tsx`](src/pages/patient/ServiceSelectionPage.tsx), styles already in [`PatientPages.module.scss`](src/pages/patient/PatientPages.module.scss) |
| A2 | **Group “decision” blocks** — wrap trust + billing in a single visual **stack** with consistent `gap` (one module wrapper class, e.g. `.bookingFlowDecisionStack`) | Reads as one “prepare” cluster before the grid | TSX + SCSS |
| A3 | Billing options: switch from “two tall blocks” to **compact segmented control** feel — reduce vertical padding, add **short meta line** (e.g. “Best if you have a GP referral”) using `--cs-on-surface-variant`, keep selected state with `box-shadow` ring | Less empty space, clearer affordance | `.billingPathOption`, `.billingPathPanel` |
| A4 | **Trust panel title** — bump title contrast slightly (e.g. `color: var(--cs-on-surface)` for kicker, or increase letter-spacing margin) and add **1 bullet** on service variant (“Fees shown before you pay”) so the block scans faster | Addresses low-contrast / wall-of-text feel | [`BookingFlowTrustPanel`](src/components/patient/BookingFlowTrustPanel/) — optional `bullets` for `service` in COPY |
| A5 | **Search + grid** — introduce a subsection heading row: “Choose a session type” + optional count (“6 shown”) + search on same row on desktop, stacked on mobile | Visually attaches search to the grid | [`ServiceSelectionPage.tsx`](src/pages/patient/ServiceSelectionPage.tsx) |

### Tier B — Structural / reuse primitives (second PR) — **shipped (2026-04-19)**

| # | Change | Rationale | Where |
|---|--------|-----------|--------|
| B1 | Extract **billing path** UI into a small presentational component (`BookingBillingPathToggle`) styled with shared `option-card` / checkbox-card patterns from [`_patientFormRow.scss`](../src/assets/styles/_patientFormRow.scss) | Stops `PatientPages.module.scss` from growing; aligns with “cards everywhere” spec | [`BookingBillingPathToggle`](../src/components/patient/BookingBillingPathToggle/) |
| B2 | Service cards: cap **max card height** or use **CSS line-clamp** on description (2–3 lines) + “expand” only if needed | Prevents giant cards when copy is short | `.serviceCardDescription` now **2-line** clamp; **`height: 100%`** removed + **`align-items: start`** on `.servicesGrid` so row heights are content-driven |
| B3 | Align **service grid** gap and card radius with homepage card rhythm (`--cs-radius-xl`, shared shadow token) | Visual consistency across app | `.servicesGrid` gap `1.25rem`; cards still use `--cs-radius-xl` via existing rules |
| B4 | **Referral `<details>`** — align summary row with billing panel typography (same title scale) so Medicare users see one consistent “panel language” | Reduces visual noise between sections | `.bookingReferralSummary` title `0.92rem`; panel `border-radius: var(--cs-radius-xl)` |

### Tier C — Product / content (coordinate copy)

| # | Change | Notes |
|---|--------|------|
| C1 | Shorten hero lead to **two lines max** on desktop; move Medicare nuance to footnote-style helper under billing | Less cognitive load before choices |
| C2 | Medicare vs private: add **one differentiator icon** per option (subtle, token color) — only if icons exist in shared icon set | Reinforces meaning without new colors |

---

## 5) What not to do

- Do **not** add a second shadow/blur system unique to this page (see CSS governance anti-patterns).
- Do **not** shrink billing buttons below comfortable touch size on mobile.
- Do **not** move referral upload above billing path for Medicare users without clinical/billing sign-off (current order matches “choose path → then eligibility plumbing”).

---

## 6) Verification checklist (before merge)

- [ ] Mobile / tablet / desktop: billing toggle usable; no horizontal scroll regressions.
- [ ] Keyboard: Tab order hero → trust → billing → referral (if open) → search → service cards → sticky Continue.
- [ ] Focus visible on billing toggles and service cards (`:focus-visible`).
- [ ] `npm run build` clean; no new linter issues on touched files.
- [ ] Visual pass against [`Homepage.module.scss`](../src/pages/public/Homepage.module.scss) mood (warm, calm, not sterile white).

---

## 7) Suggested implementation order

1. **Tier A** in one PR (fast win, low risk).
2. **Tier B** as a follow-up once primitives are identified (may touch `CSS_GOVERNANCE.md` only if a reusable primitive is promoted).

Track completion in [`REFRACTOR_TRACKER.md`](REFRACTOR_TRACKER.md) or the booking program doc as appropriate.
