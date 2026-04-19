import { type FC, type ReactNode } from 'react';
import type {
  SetupStepId,
  SetupStepMeta,
} from '../../../services/api/patientSetup';
import styles from './SetupWizardChrome.module.scss';

export interface SetupWizardChromeProps {
  /** Full ordered list of applicable steps as returned by the API. */
  steps: SetupStepMeta[];
  /** Current step the UI is rendering. */
  currentStepId: SetupStepId;
  /** Step title to show above body content. */
  title: string;
  /** Optional short helper line shown under the title. */
  subtitle?: ReactNode;
  /** Content of the step (form body). */
  children: ReactNode;
  /** Render sticky actions (Back, Save & exit, Next). */
  actions?: ReactNode;
  /** Subtle banner content rendered below progress (e.g. autosave hint). */
  banner?: ReactNode;
}

/**
 * Visual shell for every patient setup step:
 *  - Stepper pips (clickable only via parent)
 *  - Progress bar reflecting # complete / # total
 *  - Title block + body slot
 *  - Sticky action bar (Back / Save & exit / Next)
 *
 * Styling mirrors `BookingFlowProgress` so the wizard feels like part of the
 * same Clinical Sanctuary surface system.
 */
export const SetupWizardChrome: FC<SetupWizardChromeProps> = ({
  steps,
  currentStepId,
  title,
  subtitle,
  children,
  actions,
  banner,
}) => {
  const total = steps.length;
  const currentIndex = Math.max(
    0,
    steps.findIndex((s) => s.id === currentStepId),
  );
  const completedCount = steps.filter((s) => s.status === 'complete').length;
  const progressPct = total === 0 ? 0 : Math.round((completedCount / total) * 100);

  return (
    <section className={styles.root} aria-label="Patient setup wizard">
      <header className={styles.progressHeader}>
        <div className={styles.progressMeta}>
          <span className={styles.stepCount}>
            Step {currentIndex + 1} of {total}
          </span>
          <span className={styles.progressPct} aria-live="polite">
            {progressPct}% complete
          </span>
        </div>

        <div
          className={styles.track}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={completedCount}
          aria-label={`${completedCount} of ${total} steps complete`}
        >
          {steps.map((step, idx) => {
            const active = step.id === currentStepId;
            const passed = idx < currentIndex || step.status === 'complete';
            return (
              <div
                key={step.id}
                className={[
                  styles.segment,
                  passed ? styles.segmentPassed : '',
                  active ? styles.segmentActive : '',
                  !passed && !active ? styles.segmentPending : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-current={active ? 'step' : undefined}
                aria-label={`${step.title} (${step.status})`}
              />
            );
          })}
        </div>

        <ol className={styles.stepLabels} aria-hidden>
          {steps.map((step) => (
            <li
              key={step.id}
              className={[
                styles.stepLabel,
                step.id === currentStepId ? styles.stepLabelActive : '',
                step.status === 'complete' ? styles.stepLabelComplete : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <span className={styles.stepDot} aria-hidden />
              <span className={styles.stepText}>{step.title}</span>
            </li>
          ))}
        </ol>
      </header>

      {banner && <div className={styles.banner}>{banner}</div>}

      <div className={styles.card}>
        <div className={styles.titleBlock}>
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
        <div className={styles.body}>{children}</div>
      </div>

      {actions && <div className={styles.actions}>{actions}</div>}
    </section>
  );
};

export default SetupWizardChrome;
