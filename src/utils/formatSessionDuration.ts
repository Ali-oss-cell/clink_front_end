/**
 * Human-readable session length (e.g. 50 min, 1 hr 30 min).
 */
export function formatSessionDurationMinutes(minutes: number | null | undefined): string {
  if (minutes == null || Number.isNaN(minutes) || minutes <= 0) {
    return '—';
  }
  const m = Math.round(minutes);
  if (m < 60) {
    return `${m} min`;
  }
  const h = Math.floor(m / 60);
  const rem = m % 60;
  const hrLabel = h === 1 ? '1 hr' : `${h} hr`;
  if (rem === 0) {
    return hrLabel;
  }
  return `${hrLabel} ${rem} min`;
}

const DAY = 86400;

/**
 * Countdown until session start. From 24h upward, uses days (e.g. "2 days", "2 days 3h").
 */
export function formatCountdownToStart(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  if (s >= DAY) {
    const days = Math.floor(s / DAY);
    const rem = s % DAY;
    const hours = Math.floor(rem / 3600);
    const dayWord = days === 1 ? 'day' : 'days';
    if (hours > 0) {
      return `${days} ${dayWord} ${hours}h`;
    }
    return `${days} ${dayWord}`;
  }

  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const secs = s % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}
