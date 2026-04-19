import { type FC } from 'react';
import type { SetupStepComponentProps } from './setupStepTypes';
import styles from './SetupStep.module.scss';

export const WelcomeStep: FC<SetupStepComponentProps> = ({
  onAdvance,
  saving,
}) => {
  return (
    <div className={styles.form}>
      <div className={styles.formFull}>
        <p>
          Welcome! We need a few quick details before your first session.
          The process is broken into short steps — you can save progress and
          come back any time.
        </p>
        <p>
          Nothing here is a quiz: everything you share helps your psychologist
          prepare, keeps your Medicare claim eligible where relevant, and makes
          booking frictionless.
        </p>
      </div>
      <div className={styles.formFull}>
        <button
          type="button"
          className="patient-cta-primary"
          disabled={saving}
          onClick={() => void onAdvance({ acknowledged: true })}
        >
          {saving ? 'Starting…' : "Let's begin"}
        </button>
      </div>
    </div>
  );
};

export default WelcomeStep;
