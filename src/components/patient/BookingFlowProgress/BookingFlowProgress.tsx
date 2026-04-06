import styles from './BookingFlowProgress.module.scss';

export const BOOKING_FLOW_TOTAL_STEPS = 5;

type BookingFlowProgressProps = {
  /** 1-based step index (1 = service, 5 = payment when extended). */
  currentStep: number;
  totalSteps?: number;
};

export function BookingFlowProgress({
  currentStep,
  totalSteps = BOOKING_FLOW_TOTAL_STEPS,
}: BookingFlowProgressProps) {
  const safeTotal = Math.max(1, totalSteps);
  const clamped = Math.min(Math.max(currentStep, 1), safeTotal);

  return (
    <div className={styles.progressStripe}>
      <div
        className={styles.track}
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={safeTotal}
        aria-valuenow={clamped}
        aria-label={`Booking step ${clamped} of ${safeTotal}`}
      >
        {Array.from({ length: safeTotal }, (_, i) => {
          const step = i + 1;
          const active = step <= clamped;
          return (
            <div
              key={step}
              className={`${styles.segment} ${active ? styles.segmentActive : styles.segmentInactive}`}
            />
          );
        })}
      </div>
    </div>
  );
}
