import type { FC } from 'react';
import type { PatientSetupState } from '../../../services/api/patientSetup';
import styles from './steps/SetupStep.module.scss';

function formatCompletedAt(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

const BLOCKER_LABELS: Record<string, string> = {
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

export interface SetupCompleteStatusProps {
  state: PatientSetupState;
}

/**
 * Shown when `completed_at` is set — replaces redirect-as-only outcome so patients
 * can see booking readiness and profile status after finishing the wizard.
 */
export const SetupCompleteStatus: FC<SetupCompleteStatusProps> = ({ state }) => {
  const readiness = state.readiness;
  const referralLabel = readiness.referral_status.replace(/_/g, ' ');
  const intakeMinStep = state.steps.find((s) => s.id === 'intake_min');
  const intakeMinDone = intakeMinStep?.status === 'complete';
  const blockers = readiness.blocking_reasons ?? [];
  const completedLabel = state.completed_at
    ? formatCompletedAt(state.completed_at)
    : '';

  return (
    <div className={styles.form}>
      <p className={styles.formFull} style={{ marginTop: 0 }}>
        You&apos;ve finished onboarding{completedLabel ? ` — ${completedLabel}` : ''}. Here&apos;s what we
        have on file for booking and care.
      </p>

      <ul className={`${styles.formFull} ${styles.summaryList}`}>
        <li>
          <span>Billing path</span>
          <strong>
            {state.billing_path === 'medicare'
              ? 'Medicare (with GP referral)'
              : state.billing_path === 'private'
                ? 'Private / self-funded'
                : 'Not chosen yet'}
          </strong>
        </li>
        <li>
          <span>Privacy &amp; telehealth consent</span>
          <strong>
            {readiness.telehealth_consent_complete ? 'Signed' : 'Not signed'}
          </strong>
        </li>
        <li>
          <span>GP referral</span>
          <strong>{referralLabel}</strong>
        </li>
        <li>
          <span>Minimum intake (About you)</span>
          <strong>{intakeMinDone ? 'Complete' : 'Not finished yet'}</strong>
        </li>
        <li>
          <span>Ready to book</span>
          <strong>{readiness.is_ready_to_continue ? 'Yes' : 'Needs attention'}</strong>
        </li>
        {readiness.billing_path === 'medicare' &&
          readiness.medicare_sessions_remaining != null && (
            <li>
              <span>Medicare sessions (remaining this year)</span>
              <strong>{readiness.medicare_sessions_remaining}</strong>
            </li>
          )}
      </ul>

      {blockers.length > 0 && (
        <div
          className={`${styles.formFull} ${styles.reviewPendingPanel}`}
          role="status"
        >
          <p className={styles.reviewPendingLead}>
            <strong>Booking checks</strong>
          </p>
          <p className={styles.reviewPendingHint}>
            These items may still affect booking until they&apos;re resolved. You can update details
            anytime from your account or by returning to setup steps.
          </p>
          <ul className={styles.reviewPendingList}>
            {blockers.map((b) => (
              <li key={b}>{BLOCKER_LABELS[b] ?? b.replace(/_/g, ' ')}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SetupCompleteStatus;
