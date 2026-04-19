# Booking Wizard Simplification Program

Purpose: reduce booking friction on `/appointments/book-appointment` while preserving clinical and billing safety checks.

This is the execution board for product, frontend, and backend changes. Work in waves, track metrics every release, and only mark waves done after data confirms improvement.

### Goals vs waves
- Goals in §1 describe the long-term outcomes we want.
- Metrics in §2 are how we judge whether those outcomes improve by release window.
- Waves in §4 are delivery increments only. A wave can be marked `DONE` when shipped, while program goals remain pending until §2 data checks confirm improvement.

## 1) Goals and guardrails

### Primary goals
- Lower drop-off between step entry and successful booking confirmation.
- Reduce cognitive load (too many simultaneous options and controls).
- Keep required compliance checks explicit (consent, referral, billing path constraints).

### Guardrails
- Do not remove legally required or billing-required checks.
- Keep accessibility intact (focus-visible, touch targets, readable contrast).
- Keep wizard state resumable (`save draft`, reopen, continue from canonical server state).

## 2) North-star metrics (tracked per release)

Use the same date window for before/after comparison (minimum 7 days each).

| Metric | Definition | Owner | Baseline | Target |
|---|---|---|---|---|
| Start -> Confirm conversion | `booking_confirmed / wizard_started` | Product + Backend | TBD | +15% |
| Step completion rate | completion ratio per step | Product | TBD | +10% on weakest step |
| Time to complete wizard | median time from step 1 enter to confirm | Product | TBD | -20% |
| Backtrack rate | `% sessions with 2+ back navigations` | Frontend | TBD | -25% |
| Blocker hit rate | `% sessions blocked by readiness checks` | Backend | TBD | stable or lower |
| Support pain signal | # booking-related support tickets/week | Ops | TBD | -20% |

### Baseline capture sheet (Wave 0 product handoff)

**Policy:** do not enter placeholder or invented percentages. Leave cells as TBD until Product/Ops has a real 7-day window and counts from production (or staging) data. The program’s “data confirms improvement” bar depends on honest baselines.

| Release tag | Date window start | Date window end | Start -> Step 2 | Step 2 -> Step 3 | Start -> Confirm | Notes |
|---|---|---|---|---|---|---|
| TBD | TBD | TBD | TBD | TBD | TBD | Product/Ops fills from admin metrics after each 7-day window. See **Mapping admin API → this table** below. |

**Mapping admin API → this table**

- **Date window start / end:** the `start` and `end` in the JSON `window` object returned by `GET /api/auth/admin/wizard-funnel-metrics/?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD` (or `days=7`). Use the same calendar window you ship under for “before/after” comparisons.
- **Release tag:** choose the build identifier you are measuring (for example from `breakdown_by_release_tag` or your deploy `X-Release-Tag` / `VITE_RELEASE_TAG`).
- **Start → Confirm:** align with persisted funnel analytics — `funnel_summary.ratio_booking_confirmed_per_wizard_started` (i.e. `booking_confirmed` / `wizard_started`, where `wizard_started` mirrors `wizard_state_loaded` in the API). This matches the North-star definition `booking_confirmed / wizard_started` in §2.
- **Start → Step 2** and **Step 2 → Step 3:** these are not returned as ready-made ratios in `funnel_summary`. Derive them from `WizardFunnelEvent` rows with `event_name = wizard_step_saved` and `step_id` (per-session ordering), or add a future backend rollup if Product wants one-click step transition rates in the admin API.

## 3) Event schema (minimum instrumentation)

Track these events with `wizard_session_id`, `patient_id`, `step_id`, `billing_path`, `ts`, and `release_tag`.

### Frontend events
- `wizard_viewed`
- `wizard_step_viewed`
- `wizard_step_advanced`
- `wizard_step_back`
- `wizard_step_save_exit`
- `wizard_recommended_selected`
- `wizard_manual_mode_enabled`
- `wizard_filter_expanded`
- `wizard_time_window_selected`
- `wizard_slot_selected`
- `wizard_complete_clicked`

### Backend events (or derivable logs)
- `wizard_state_loaded`
- `wizard_step_saved`
- `wizard_complete_succeeded`
- `wizard_complete_rejected` (with blocker codes)
- `booking_confirmed`

## 4) Wave plan

Status legend: `NOT_STARTED`, `IN_PROGRESS`, `DONE`, `BLOCKED`

### Wave 0 — Baseline instrumentation (must ship first)
- [x] `DONE` Frontend: emit step-level funnel events and recommended/manual mode events (optional headers `X-Release-Tag`, `X-Wizard-Session-Id` supported by backend).
- [x] `DONE` Backend: `WizardFunnelEvent` rows + `GET /api/auth/admin/wizard-funnel-metrics/` (release_tag + billing_path dimensions; blocker codes on rejected complete).
- [ ] `NOT_STARTED` Product: capture baseline metrics table for current experience.

### Wave 1 — Quick UX wins (low-risk, high-impact)
- [x] `DONE` Frontend: progressive disclosure (show top options first, "Show more" for advanced).
- [x] `DONE` Frontend: collapse non-critical filters under "More filters".
- [x] `DONE` Frontend: simplify CTA hierarchy (single primary action per step).
- [x] `DONE` Content: plain-language helper text ("You can change this later").
- [ ] `NOT_STARTED` Data check: compare start->step2 and step2->step3 completion rates vs baseline.

### Wave 2 — Recommended path and decision reduction
- [x] `DONE` Frontend: add "Continue with recommended" path (`Continue with first available` on psychologist step; navigates to date/time with slot preselected when API returns a match).
- [x] `DONE` Backend: recommendation payload endpoint `GET /api/appointments/booking-recommendation/` (patient-only; earliest bookable slot among clinicians offering the selected service).
- [x] `DONE` Frontend: secondary "Browse all psychologists" path (`wizard_manual_mode_enabled`).
- [ ] `NOT_STARTED` Data check: recommended-path adoption + conversion delta.

### Wave 3 — Date/time simplification
- [x] `DONE` Frontend: switch to time-of-day first (Morning/Afternoon/Evening), then slots (`DateTimeSelectionPage`; `wizard_time_window_selected` telemetry).
- [x] `DONE` Frontend: reduce visual noise — date strip and times reflect only the chosen band; clearer empty copy when `NO_SLOTS_IN_TIME_WINDOW`.
- [x] `DONE` Backend: optional `time_window` on `GET /api/appointments/available-slots/` (local-hour bands; ascending `start_time` unchanged).
- [ ] `NOT_STARTED` Data check: median time on date/time step and backtrack rate.

### Wave 4 — Blockers and completion confidence
- [x] `DONE` Frontend: concise blocker banner with single "Fix now" action (`BookingBlockerBanner`; setup review, setup complete, payment).
- [x] `DONE` Frontend: defer long blocker lists behind expand/collapse (`<details>` on 2+ blockers).
- [x] `DONE` Backend: normalize blocker reason codes and resolver step mapping (`primary_recovery_next` + `API_CONTRACT.md` table).
- [ ] `NOT_STARTED` Data check: completion click failure rate and blocker recovery rate.

### Wave 5 — Mobile polish and accessibility hardening
- [ ] `NOT_STARTED` Frontend: mobile-first step layout and touch spacing audit.
- [ ] `NOT_STARTED` Frontend: keyboard/screen-reader pass for all controls and states.
- [ ] `NOT_STARTED` QA: responsive and a11y sign-off checklist.
- [ ] `NOT_STARTED` Data check: mobile conversion parity and drop-off by device class.

## 5) Execution board (rolling)

| Item | Wave | FE | BE | Data | Status | Owner | Notes |
|---|---|---|---|---|---|---|---|
| Baseline funnel events | 0 | Yes | Yes | Yes | IN_PROGRESS | TBD | FE+BE instrumentation shipped; Product baseline table population pending. |
| Progressive disclosure | 1 | Yes | No | Yes | DONE | TBD | Service cards now use top-N + show-more disclosure; psychologist sidebar uses "More filters". |
| Recommended path | 2 | Yes | Yes | Yes | IN_PROGRESS | TBD | BE+FE shipped; data check pending. |
| Time-window-first slots | 3 | Yes | Yes | Yes | IN_PROGRESS | TBD | FE+BE shipped; Product data check pending. |
| Blocker UX + codes | 4 | Yes | Yes | Yes | DONE | TBD | FE+BE shipped; Product data check pending. |
| Mobile + a11y hardening | 5 | Yes | Optional | Yes | NOT_STARTED | TBD | |

## 6) Change log template (copy per release)

```
Release tag:
Date range observed:
Wave:

Shipped:
- ...

Metrics vs baseline:
- Start -> Confirm:
- Weakest step completion:
- Time to complete:
- Backtrack rate:
- Blocker hit/recovery:

Decision:
- Keep / iterate / rollback

Next wave:
- ...
```

## 7) Definition of done (per wave)

- [ ] Features behind the wave are merged and build is green.
- [ ] Event instrumentation for the wave is verified in logs/dashboard.
- [ ] 7-day post-release metric comparison captured in this doc.
- [ ] Outcome documented as Keep / Iterate / Rollback.

