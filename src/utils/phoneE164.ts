import { parsePhoneNumber } from 'libphonenumber-js';

const DEFAULT_REGION = 'AU';

/**
 * Normalize user input to E.164 (+country…). Accepts international +… or local AU numbers.
 * Returns null if the number cannot be parsed as valid.
 */
export function normalizeToE164(raw: string | undefined | null): string | null {
  if (raw == null) return null;
  const s = String(raw).trim();
  if (!s) return null;
  try {
    const num = parsePhoneNumber(s, s.startsWith('+') ? undefined : DEFAULT_REGION);
    if (num?.isValid()) return num.format('E.164');
  } catch {
    return null;
  }
  return null;
}

/** Hint for form labels / helper text */
export const E164_PHONE_HINT =
  'Use international format with country code (e.g. +61 412 345 678 or +61 2 1234 5678).';
