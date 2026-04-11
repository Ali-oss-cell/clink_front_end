# Frontend analytics and funnel measurement

## Environment variables

Set in `.env` or your host’s build environment (see `.env.example`):

| Variable | Purpose |
|----------|---------|
| `VITE_PLAUSIBLE_DOMAIN` | Plausible “domain” setting (e.g. `clink.example.com`). When set, loads `https://plausible.io/js/script.js` once. |
| `VITE_HOTJAR_ID` | Numeric Hotjar site ID. When set, loads Hotjar’s script once. |

`App.tsx` calls `initThirdPartyAnalytics()` on mount so scripts are injected client-side only when variables are present.

## Booking funnel events (Plausible)

`trackBookingFunnelStep` in `src/utils/bookingFunnelAnalytics.ts` fires **once per browser tab session** per step (deduped in `sessionStorage`) when users reach:

- `booking_funnel_service` — service selection step
- `booking_funnel_psychologist` — psychologist selection (when a service is in the URL)
- `booking_funnel_datetime` — date/time step
- `booking_funnel_confirmation` — confirmation page after a successful load

In Plausible, add each event name as a **custom event goal** (or build a funnel from these goals). Compare drop-off between steps to see where copy, trust, or layout may be failing.

## Hotjar / user tests

- Use **recordings** and **heatmaps** on `/register`, `/appointments/book-appointment`, and `/services` first.
- Complement with **~5 moderated user tests** (task: book a session, register, find rebate info) to separate “UI confusion” from “analytics-only” drop-off.

## Privacy

Only enable these tools where your privacy policy and consent approach allow. Prefer Plausible for lower personal data footprint versus full-suite analytics.
