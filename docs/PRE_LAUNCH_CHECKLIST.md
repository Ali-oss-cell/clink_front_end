# Pre-launch verification checklist

Use this before a release or hard deadline. Work **top-down**: revenue-critical flows first, then each role, then polish.

## A. Environment and build (once)

- [ ] `VITE_API_BASE_URL` points at the correct backend for this environment.
- [ ] `VITE_STRIPE_PUBLISHABLE_KEY` is set wherever **card payment** runs (never commit secret keys).
- [ ] `npm run build` succeeds and the deployed artifact matches what you test in the browser.

## B. Public (unauthenticated)

Routes: `/`, `/about`, `/services`, `/telehealth-requirements`, `/privacy-policy`, `/resources`, `/contact`, `/get-matched`, `/medicare-rebates`.

- [ ] Each page loads without runtime errors.
- [ ] Main CTAs go to the intended destinations (login, register, booking, contact).
- [ ] Header/footer and legal links behave as expected.

## C. Auth

- [ ] **Register** → account is created; with a normal patient signup you should land on **`/patient/dashboard`** while already signed in (tokens from `/register/patient/`). App shell must refresh auth via `onRegisterSuccess` (wired in `AppRoutes`).
- [ ] **Login** → redirect by role: patient → `/patient/dashboard`, psychologist → `/psychologist/dashboard`, practice_manager → `/manager/dashboard`, admin → `/admin/dashboard` (shared helper: `getDashboardPathForRole` in `src/utils/authRedirects.ts`).
- [ ] **Forgot password** → POST succeeds; email arrives with link to **`/reset-password?token=…`** (backend `FRONTEND_URL` / email template must match your deployed site).
- [ ] **Reset password** → new password accepted; redirect to login (or sign in with new password).

**Implementation notes**

- Reset link query param is **`token`** (matches `send_password_reset_email` in the backend).
- “Remember me” was removed from the login form (it was not wired); session length is governed by JWT/backend.

## D. Patient — critical path (end-to-end on staging)

Complete in order:

1. [ ] **Dashboard** (`/patient/dashboard`) loads with expected data.
2. [ ] **Booking wizard** (`/appointments/book-appointment`): service → psychologist → date/time → details → **payment** → success/confirmation.
3. [ ] **Telehealth consent**: booking blocked when required; clear path to fix (e.g. account / privacy / consent).
4. [ ] **Appointments list** (`/patient/appointments`).
5. [ ] **Invoices** (`/patient/invoices`) including PDF/download if applicable.
6. [ ] **Account** (`/patient/account`) — profile, privacy, related tabs.
7. [ ] **Intake form** (`/patient/intake-form`) — submit and re-open.
8. [ ] **Resources** (`/patient/resources`, `/patient/resources/:id`) — open, bookmark/rate if used.
9. [ ] **Video session** (`/video-session/:appointmentId`) with a valid appointment id.
10. [ ] **Recordings** (`/recordings`) if in scope for launch.

## E. Psychologist

- [ ] `/psychologist/dashboard`
- [ ] `/psychologist/profile`
- [ ] `/psychologist/schedule`
- [ ] `/psychologist/patients`
- [ ] `/psychologist/notes`

## F. Practice manager

- [ ] `/manager/dashboard`
- [ ] `/manager/staff`
- [ ] `/manager/patients`
- [ ] `/manager/appointments`
- [ ] `/manager/billing`
- [ ] `/manager/resources`

## G. Admin

- [ ] `/admin/dashboard`
- [ ] `/admin/users`
- [ ] `/admin/appointments`
- [ ] `/admin/patients`
- [ ] `/admin/staff`
- [ ] `/admin/billing`
- [ ] `/admin/settings`
- [ ] `/admin/analytics`
- [ ] `/admin/audit-logs`
- [ ] `/admin/data-deletion`
- [ ] `/admin/resources`

## H. Edge cases and security

- [ ] Wrong role opening another role’s URL → blocked or redirected (`ProtectedRoute`).
- [ ] Logged-out user → protected routes redirect to login (or home, per product rules).
- [ ] Unknown path → 404 (`*` route).
- [ ] **Mobile** layouts on booking wizard and main dashboards (high-risk UX area).

## I. Backend and operations (quick)

- [ ] Network tab or server logs: APIs return expected status codes for the flows above.
- [ ] Background jobs (e.g. Celery) and reminders: confirm what is actually wired vs promised in UI copy.

---

## Known gaps and technical notes (codebase audit)

Review before promising features in marketing or support.

| Item | Location | Notes |
|------|-----------|--------|
| Legacy appointment request (no API) | `src/pages/patient/PatientAppointmentPage.tsx` | `TODO: Submit appointment request to API` — currently simulates success. If any navigation still points to **`/patient/appointment`**, users may believe a request was sent. Prefer **`/appointments/book-appointment`** or implement the API. |
| Medicare (service step) | `src/pages/patient/ServiceSelectionPage.tsx` | **Rebate/gap:** uses `medicare_rebate` and `out_of_pocket_cost` from `GET /api/services/`. **Specializations:** still not exposed on the service list serializer—keep empty or extend API later. |
| Add to calendar | `src/pages/patient/ConfirmationPage.tsx` | Placeholder `alert`; real calendar invites may depend on backend/notifications. |
| WhatsApp reminder | `clink-backend/appointments/tasks.py` | `TODO: Send WhatsApp reminder` — align UI copy with what is deployed. |
| `alert()` usage | Multiple patient pages | Functional but rough UX; consider toasts/modals when time allows. |

---

## Suggested order when time is short

1. One full **patient** journey on staging: register (or test user) → book → pay → confirm → see appointment in list.
2. One **psychologist** and one **admin** smoke: login, open schedule/patients, one admin list screen.
3. Decide fate of **`/patient/appointment`**: remove links or wire to API.
4. Confirm **Stripe** and **API base URL** on production.
5. Polish (alerts, calendar, copy) after the above are green.

---

## Route map (frontend)

Canonical definitions live in `src/routes/AppRoutes.tsx`. Use that file when adding or renaming routes so this checklist stays aligned.
