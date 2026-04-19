import type { FC } from 'react';
import type { SetupStepComponentProps } from './setupStepTypes';
import styles from './SetupStep.module.scss';

interface ReviewStepProps extends SetupStepComponentProps {
  onComplete: () => void | Promise<void>;
  completing?: boolean;
}

const HUMAN_BLOCKERS: Record<string, string> = {
  telehealth_consent_missing: 'Telehealth / privacy consent',
  intake_incomplete: 'Minimum intake questions',
  referral_missing: 'GP referral (required for Medicare)',
  referral_rejected: 'GP referral (previous upload rejected)',
  referral_expired: 'GP referral (previous referral expired)',
  medicare_session_limit_reached: 'Medicare session limit reached for this year',
};

export const ReviewStep: FC<ReviewStepProps> = ({
  state,
  onComplete,
  completing,
  error,
}) => {
  const readiness = state.readiness;
  const canFinish = readiness.is_ready_to_continue;
  const blockers = readiness.blocking_reasons || [];

  const referralLabel = readiness.referral_status.replace(/_/g, ' ');

  return (
    <div className={styles.form}>
      <p className={styles.formFull}>
        Almost there. Here's a quick snapshot of what we have on file. You can
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
          <span>Intake</span>
          <strong>
            {readiness.intake_completed ? 'Complete' : 'In progress'}
          </strong>
        </li>
      </ul>

      {!canFinish && blockers.length > 0 && (
        <div className={`${styles.formFull} ${styles.error}`}>
          Still needed before you can book:
          <ul style={{ margin: '.5rem 0 0', paddingLeft: '1.25rem' }}>
            {blockers.map((b) => (
              <li key={b}>{HUMAN_BLOCKERS[b] ?? b.replace(/_/g, ' ')}</li>
            ))}
          </ul>
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
              ? 'Finish the outstanding steps to complete setup.'
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
