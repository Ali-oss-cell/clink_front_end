/**
 * Calendar date in the user's local timezone as YYYY-MM-DD (not UTC).
 * Avoids `toISOString().split('T')[0]` shifting the day near midnight or in non-UTC zones.
 */
export function formatLocalDateYYYYMMDD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
