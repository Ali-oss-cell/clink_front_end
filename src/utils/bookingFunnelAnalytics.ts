/**
 * Fire once per browser session per step (deduped) for Plausible custom events.
 * In Plausible, add each `booking_funnel_*` string as a custom event goal (or use funnels).
 */

const STORAGE_KEY = 'clink_booking_funnel_tracked';

export type BookingFunnelStepKey = 'service' | 'psychologist' | 'datetime' | 'confirmation';

function readTracked(): Record<string, boolean> {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}') as Record<string, boolean>;
  } catch {
    return {};
  }
}

export function trackBookingFunnelStep(step: BookingFunnelStepKey): void {
  try {
    const plausible = (window as Window & { plausible?: (name: string) => void }).plausible;
    if (typeof plausible !== 'function') return;

    const tracked = readTracked();
    if (tracked[step]) return;
    tracked[step] = true;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(tracked));

    plausible(`booking_funnel_${step}`);
  } catch {
    /* ignore */
  }
}
