/**
 * Canonical human labels for backend `blocking_reasons` codes (booking readiness,
 * setup wizard, final revalidation). Keep in sync with API_CONTRACT.md.
 */

export const BLOCKER_LABELS: Record<string, string> = {
  telehealth_consent_missing: 'Privacy & telehealth consent',
  intake_min_incomplete: 'Minimum intake (About you)',
  intake_incomplete: 'Minimum intake questions',
  referral_missing: 'GP referral (Medicare)',
  referral_rejected: 'GP referral (previous upload rejected)',
  referral_expired: 'GP referral (previous referral expired)',
  medicare_session_limit_reached: 'Medicare session limit reached for this year',
  setup_contact_incomplete: 'Emergency contact details',
  setup_privacy_incomplete: 'Privacy & telehealth acknowledgements',
  setup_billing_incomplete: 'How you pay',
  referral_step_incomplete: 'GP referral',
};

export function labelForBlocker(code: string): string {
  return BLOCKER_LABELS[code] ?? code.replace(/_/g, ' ');
}

export type RecoveryActionsLike = {
  next: string | null;
  setup_next?: string | null;
};

/** Prefer server-computed `next`; optional `setup_next` only when `next` is absent. */
export function primaryFixUrl(actions: RecoveryActionsLike): string | null {
  if (actions.next) return actions.next;
  if (actions.setup_next) return actions.setup_next;
  return null;
}
