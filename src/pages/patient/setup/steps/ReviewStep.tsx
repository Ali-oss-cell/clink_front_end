import type { FC } from 'react';
import type { SetupStepId } from '../../../../services/api/patientSetup';
import type { SetupStepComponentProps } from './setupStepTypes';
import styles from './SetupStep.module.scss';

interface ReviewStepProps extends SetupStepComponentProps {
  onComplete: () => void | Promise<void>;
  completing?: boolean;
  onNavigateToStep?: (step: SetupStepId) => void;
}

const HUMAN_BLOCKERS: Record<string, string> = {
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

/** First wizard step to send the user to for a blocker code. */
const BLOCKER_TO_STEP: Record<string, SetupStepId> = {
  intake_min_incomplete: 'intake_min',
  intake_incomplete: 'intake_min',
  setup_contact_incomplete: 'contact',
  setup_privacy_incomplete: 'privacy_telehealth',
  setup_billing_incomplete: 'billing_path',
  telehealth_consent_missing: 'privacy_telehealth',
  referral_step_incomplete: 'referral',
};

const STEP_BUTTON_LABEL: Partial<Record<SetupStepId, string>> = {
  intake_min: 'About you',
  contact: 'Contact details',
  privacy_telehealth: 'Privacy & telehealth',
  billing_path: 'How you pay',
  referral: 'Upload referral',
};

function firstBlockerStep(blockers: string[]): SetupStepId | null {
  for (const b of blockers) {
    if (BLOCKER_TO_STEP[b]) {
      return BLOCKER_TO_STEP[b];
    }
    if (b.startsWith('referral_')) {
      return 'referral';
    }
  }
  return null;
}

export const ReviewStep: FC<ReviewStepProps> = ({
  state,
  onComplete,
  completing,
  error,
  onNavigateToStep,
}) => {
  const readiness = state.readiness;
  const canFinish = readiness.is_ready_to_continue;
  const blockers = readiness.blocking_reasons || [];

  const referralLabel = readiness.referral_status.replace(/_/g, ' ');
  const intakeMinStep = state.steps.find((s) => s.id === 'intake_min');
  const intakeMinDone = intakeMinStep?.status === 'complete';

  const nextStep = firstBlockerStep(blockers);
  const nextLabel = nextStep ? STEP_BUTTON_LABEL[nextStep] : null;

  return (
    <div className={styles.form}>
      <p className={styles.formFull}>
        Almost there. Here&apos;s a quick snapshot of what we have on file. You can
        come back and update any of this later from your dashboard.
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
      </ul>

      {!canFinish && blockers.length > 0 && (
        <div
          className={`${styles.formFull} ${styles.reviewPendingPanel}`}
          role="alert"
        >
          <p className={styles.reviewPendingLead}>
            <strong>Finish the steps above before wrapping up.</strong>
          </p>
          <p className={styles.reviewPendingHint}>
            We&apos;ll enable <strong>Finish setup</strong> once everything needed for
            booking is done — that way you won&apos;t get stuck at the last screen.
          </p>
          <ul className={styles.reviewPendingList}>
            {blockers.map((b) => (
              <li key={b}>{HUMAN_BLOCKERS[b] ?? b.replace(/_/g, ' ')}</li>
            ))}
          </ul>
          {onNavigateToStep && nextStep && nextLabel && (
            <button
              type="button"
              className={`patient-cta-secondary ${styles.reviewNavButton}`}
              onClick={() => onNavigateToStep(nextStep)}
            >
              Go to {nextLabel}
            </button>
          )}
        </div>
      )}

      {error && <p className={`${styles.formFull} ${styles.error}`}>{error}</p>}

      <div
        className={styles.formFull}
        style={{ display: 'flex', justifyContent: 'flex-end' }}
      >
        <button
          type="button"
          className="patient-cta-primary"
          onClick={() => void onComplete()}
          disabled={completing || !canFinish}
          title={
            !canFinish
              ? 'Complete the outstanding items above first.'
              : undefined
          }
        >
          {completing ? 'Finishing…' : 'Finish setup'}
        </button>
      </div>
    </div>
  );
};

export default ReviewStep;
