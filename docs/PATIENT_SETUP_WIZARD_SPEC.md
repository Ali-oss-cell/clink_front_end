# Patient post-auth experience: setup wizard, booking north star, and dashboard refresh

**Status:** Draft product + technical spec (for implementation follow-up)  
**Last updated:** 2026-04-18  
**Owner:** Product + eng (Clink)  
**Related:** `clink_front_end/docs/CSS_GOVERNANCE.md`, `clink_front_end/docs/CROSS_SHELL_UI_REFACTOR_SPEC.md`, `clink_front_end/src/assets/styles/_clinicalSanctuary.scss` (tokens)

---

## 1. Problem statement

### 1.1 What users experience today

- After **register** or **login**, patients land on **`/patient/dashboard`** with many concurrent obligations (tiles, onboarding checklist, intake, referral/Medicare messaging, telehealth consent, booking prerequisites).
- **Booking an appointment** is the primary value, but the app often feels like “do admin work first” with no single narrative.
- Styling is split across large module files (e.g. `PatientPages.module.scss`) and can be hard to maintain; the *root* issue is often **information architecture and flow**, not only CSS syntax.

### 1.2 Outcome we want

- **One clear story** after login: “Finish what’s needed so we can book safely.”
- **Draft saves** so users can leave and resume without losing progress.
- **Dashboard** becomes a **calm hub** after setup (appointments first, secondary links), not a second onboarding wall.
- **Clinical/practice rules** stay enforced via backend (readiness, billing path, referral), not duplicated ad hoc in the UI.

---

## 2. Principles (non-negotiable)

1. **Booking is the north star** — Primary CTA path: get to **`/appointments/book-appointment`** (or equivalent) as soon as business rules allow.
2. **Server truth** — “Can this user book?” and “What’s missing?” come from **one coherent contract** (see existing `getBookingReadiness` / backend readiness concept). UI only *displays* and *routes*.
3. **Minimal before first appointment** — Define explicitly which fields are **required before first book** vs **deferrable** (e.g. full clinical intake within 7 days of first session).
4. **No duplicate design systems** — Wizard and dashboard use the same **Clinical Sanctuary tokens**, shared shell, and primitives (see workspace design rules).
5. **Accessibility** — Focus states, labels, errors, keyboard flow; wizard steps must not trap or skip error announcement.

---

## 3. Current codebase anchors (do not reinvent)

Use these as integration points rather than parallel logic:

| Area | Likely location / concept |
|------|---------------------------|
| Post-register redirect | `Register.tsx` → `navigate('/patient/dashboard')` |
| Post-login redirect | `Login.tsx` → `getDashboardPathForRole` |
| Patient routes | `AppRoutes.tsx` (`/patient/dashboard`, `/patient/intake-form`, `/patient/appointment`, `/appointments/book-appointment`, …) |
| Booking prerequisites | `authService.getBookingReadiness` + consumers (`PatientDashboardPage`, `ServiceSelectionPage`, …) |
| Privacy gate | `ProtectedRoute` + privacy policy flow for patients |
| Booking UI chrome | `BookingFlowProgress` and booking step routes |

Any new “setup wizard” **must consume the same readiness API** (or an extension of it), not fork a second checklist.

---

## 4. Product decisions to lock before build

Answer these in writing; implementation depends on them.

| # | Question | Options / notes |
|---|----------|-----------------|
| D1 | **Hard gate vs soft gate** | Hard: cannot open dashboard until setup complete. Soft: dashboard visible but dominated by “Continue setup”. |
| D2 | **Minimum before first booking** | e.g. profile + billing path + telehealth consent + referral upload OR “private pay” declaration. |
| D3 | **Intake timing** | Full intake before booking vs minimal + deadline after booking. |
| D4 | **Returning users** | If readiness regresses (e.g. referral rejected), does setup wizard reopen? |
| D5 | **Draft semantics** | Autosave every N seconds + on blur + on “Next”; conflict if two tabs open. |

**Default recommendation for D1:** **soft gate** — less jarring; **one** persistent primary CTA until `is_ready_to_continue` (or equivalent).

---

## 5. Target user journeys

### 5.1 New patient (happy path)

1. Register / login.
2. Land on **`/patient/setup`** (new) **or** dashboard with modal/banner until setup progress > 0 (depends on D1).
3. Wizard steps (see §6) — save draft at each step.
4. When readiness allows → **primary CTA: Book appointment** → existing booking wizard.
5. Post-booking: dashboard shows **next appointment** + optional “complete intake” if deferred.

### 5.2 Returning patient

1. Login → if **no blocking prerequisites** → dashboard **without** wizard.
2. If **blocking** items exist (referral pending, consent missing) → **resume wizard** at first incomplete step (from server state).

---

## 6. Proposed setup wizard (steps — expand/collapse per clinic rules)

> Step **names** are illustrative; map each to **existing APIs** or **new draft endpoints**.

### Phase A — Account & safety baseline

| Step ID | Purpose | Typical data | Completion rule |
|---------|---------|--------------|-----------------|
| `welcome` | Orientation, expectations | None / legal links | Acknowledged or skipped per policy |
| `contact` | Reachability | Phone, emergency contact if required | Validated fields stored |
| `privacy_telehealth` | Align with existing flows | Privacy acceptance, telehealth consent | Matches `bookingReadiness.telehealth_consent_complete` |

### Phase B — Billing path (Medicare vs private)

| Step ID | Purpose | Notes |
|---------|---------|-------|
| `billing_path` | Medicare vs private | Drives `getBookingReadiness({ billing_path })` |
| `referral` | Referral document / GP details | Links to existing referral intake pages/APIs |

### Phase C — Clinical intake (splittable)

| Step ID | Purpose | Notes |
|---------|---------|-------|
| `intake_min` | Minimum questions for booking | Only if policy allows deferral |
| `intake_full` | Full intake | Optional here or post-booking |

### Phase D — Ready to book

| Step ID | Purpose |
|---------|---------|
| `review` | Summary + “Book appointment” CTA |
| `book` | Navigate to **`/appointments/book-appointment`** |

**Rule:** Wizard **step order** should mirror **readiness.actions.next** when possible so the user never fights the booking flow.

---

## 7. Technical design

### 7.1 Routing

| Route | Purpose |
|-------|---------|
| `/patient/setup` | Main wizard shell (nested steps or query `?step=`). |
| `/patient/dashboard` | Hub (simplified layout). |
| Existing booking routes | Unchanged unless consolidating entry. |

**Redirect logic (after login):**

- If `readiness` shows **blocking incomplete** and `setup_complete === false` (if you add such a flag) → `/patient/setup`.
- Else → `/patient/dashboard`.

Implement in **one place** (e.g. small helper used by Login/Register/App) to avoid drift.

### 7.2 State model

**Client:**

- Wizard **UI state**: current step, validation errors, dirty flag.
- **Optimistic** display after save success.

**Server (recommended):**

- **`PatientSetupDraft`** (or generic JSON draft + schema version): `{ step_id, payload, updated_at, version }`.
- **`PatientSetupProgress`**: `{ completed_steps[], last_step, completed_at }` OR derive entirely from readiness + persisted profile.

**Avoid** relying only on `localStorage` for mandatory data.

### 7.3 API sketch (backend follow-up)

Document in `clink-backend/docs/API_CONTRACT.md` when implemented:

- `GET /api/patient/setup/` — resume: draft + computed next step + readiness summary.
- `PATCH /api/patient/setup/` — save draft for a step (partial allowed).
- `POST /api/patient/setup/complete/` — optional explicit completion when all required steps satisfied.

Use transactions and validate **per-step** schemas.

### 7.4 Alignment with `bookingReadiness`

- **Single source:** Backend aggregates profile + consent + referral + billing into readiness.
- Wizard steps **write** domain objects that readiness already reads.
- Dashboard **reads** readiness only — no second checklist logic.

---

## 8. Dashboard redesign scope (after wizard)

### 8.1 Layout priorities

1. **Next appointment** / **Book** CTA (if no appointment).
2. Short **status** strip (referral, intake incomplete) — **not** twelve tiles.
3. Secondary: resources, account, messages.

### 8.2 Navigation / tabs

- Reduce parallel entry points to the same task (e.g. one path to intake).
- Align tab labels with mental model: **Home**, **Appointments**, **Care plan / Intake**, **Account**.

### 8.3 SCSS / CSS strategy

- **Phase 1:** Restructure **within** existing token + module system (extract wizard + dashboard primitives; shrink `PatientPages.module.scss` by moving chunks to focused modules).
- **Phase 2 (optional):** Migrate selected trees to **`.module.css`** with **same class names/tokens** — incremental, route-by-route.
- **Avoid** a big-bang “rewrite everything to plain CSS” without token parity; it duplicates effort and breaks consistency.

---

## 9. Implementation phases (for agents)

### Phase 0 — Discovery (read-only)

- [ ] Map every **blocking** condition from `getBookingReadiness` and backend.
- [ ] List all **patient** routes and what each collects.
- [ ] Document **D1–D5** decisions with stakeholder answers.

### Phase 1 — Contract & backend draft

- [ ] Add draft/progress model + migrations (if needed).
- [ ] Implement GET/PATCH setup endpoints; tests; update **API_CONTRACT.md** / matrix.

### Phase 2 — Wizard frontend

- [ ] Create `/patient/setup` shell using shared tokens + **wizard progress** component (reuse patterns from booking `BookingFlowProgress` where appropriate — same **control language**).
- [ ] Wire autosave and resume.
- [ ] Connect post-login/register redirect helper.

### Phase 3 — Dashboard simplification

- [ ] Reduce tile overload; single readiness summary; primary CTA.
- [ ] Remove duplicate CTAs that also exist in wizard.

### Phase 4 — Hardening

- [ ] E2E or integration: register → setup → book.
- [ ] Accessibility pass on wizard.
- [ ] Performance: lazy load heavy steps.

### Phase 5 — Optional CSS modularization

- [ ] Split `PatientPages.module.scss` by **feature**; document in `CSS_GOVERNANCE.md` if structure changes.

---

## 10. Acceptance criteria (MVP)

- [ ] New user can **save draft**, **logout**, **login**, and **resume** at correct step.
- [ ] When backend says user **can book**, wizard (or dashboard) shows **Book appointment** leading into existing booking flow without dead ends.
- [ ] **No conflicting** checklist: dashboard and booking use same readiness data.
- [ ] UI follows **homepage / Clinical Sanctuary** tokens; no new ad-hoc palette.
- [ ] Docs updated: `clink-backend/docs/API_CONTRACT.md` (and other repo rules when API or standards change).

---

## 11. Open questions

- Exact **Medicare** step order vs **referral upload** timing.
- Whether **psychologist matching** stays inside booking only or surfaces on dashboard.
- Notifications for referral **approved/rejected** — tie into existing notification work without doubling prompts.

---

## 12. References (in-repo)

- `clink_front_end/src/routes/AppRoutes.tsx`
- `clink_front_end/src/pages/patient/PatientDashboardPage.tsx` (`getBookingReadiness`)
- `clink_front_end/src/pages/patient/ServiceSelectionPage.tsx` (readiness gating)
- `clink_front_end/src/services/api/auth.ts` (`getBookingReadiness`)
- `clink_front_end/docs/CSS_GOVERNANCE.md`
- `clink_front_end/docs/CROSS_SHELL_UI_REFACTOR_SPEC.md`

---

_End of document._
