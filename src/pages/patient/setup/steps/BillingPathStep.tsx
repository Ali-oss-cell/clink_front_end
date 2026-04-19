import { useState, type FC } from 'react';
import type { SetupStepComponentProps } from './setupStepTypes';
import styles from './SetupStep.module.scss';

type BillingPath = 'medicare' | 'private';

export const BillingPathStep: FC<SetupStepComponentProps> = ({
  state,
  onAdvance,
  saving,
  error,
}) => {
  const [choice, setChoice] = useState<BillingPath>(state.billing_path || 'medicare');

  return (
    <div className={styles.form}>
      <p className={styles.formFull}>
        How would you like to pay for sessions? You can change this later
        when you book an appointment.
      </p>

      <div className={`${styles.formFull} ${styles.optionCards}`}>
        <button
          type="button"
          className={styles.optionCard}
          aria-pressed={choice === 'medicare'}
          onClick={() => setChoice('medicare')}
        >
          <span className={styles.optionTitle}>Medicare (rebated)</span>
          <span className={styles.optionDesc}>
            Requires a current Mental Health Treatment Plan from your GP.
            Up to 10 rebated sessions per calendar year.
          </span>
        </button>

        <button
          type="button"
          className={styles.optionCard}
          aria-pressed={choice === 'private'}
          onClick={() => setChoice('private')}
        >
          <span className={styles.optionTitle}>Private / self-pay</span>
          <span className={styles.optionDesc}>
            No referral needed. Pay full session fee directly; some private
            health funds may rebate a portion.
          </span>
        </button>
      </div>

      {error && <p className={`${styles.formFull} ${styles.error}`}>{error}</p>}

      <div
        className={styles.formFull}
        style={{ display: 'flex', justifyContent: 'flex-end' }}
      >
        <button
          type="button"
          className="patient-cta-primary"
          disabled={saving}
          onClick={() => void onAdvance({ billing_path: choice })}
        >
          {saving ? 'Saving…' : 'Continue'}
        </button>
      </div>
    </div>
  );
};

export default BillingPathStep;
