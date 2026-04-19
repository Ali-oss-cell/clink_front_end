import type { FC } from 'react';
import type { SetupStepComponentProps } from './setupStepTypes';
import styles from './SetupStep.module.scss';
import { BookingBlockerBanner } from '../../../../components/patient/BookingBlockerBanner/BookingBlockerBanner';

interface ReviewStepProps extends SetupStepComponentProps {
  onComplete: () => void | Promise<void>;
  completing?: boolean;
}

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
  const intakeMinStep = state.steps.find((s) => s.id === 'intake_min');
  const intakeMinDone = intakeMinStep?.status === 'complete';

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
        <div className={styles.formFull}>
          <BookingBlockerBanner
            blockingReasons={blockers}
            actions={readiness.actions}
            variant="alert"
          >
            <p className={styles.reviewPendingLead} style={{ marginTop: 0 }}>
              <strong>Finish the steps above before wrapping up.</strong>
            </p>
            <p className={styles.reviewPendingHint}>
              We&apos;ll enable <strong>Finish setup</strong> once everything needed for
              booking is done — that way you won&apos;t get stuck at the last screen.
            </p>
          </BookingBlockerBanner>
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
