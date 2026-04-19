import { forwardRef } from 'react';
import styles from './BookingBillingPathToggle.module.scss';

export type BookingBillingPath = 'medicare' | 'private';

export interface BookingBillingPathToggleProps {
  value: BookingBillingPath;
  onChange: (next: BookingBillingPath) => void;
  className?: string;
}

/**
 * Medicare vs private path chooser for booking Step 1.
 * Uses shared `option-card` primitives (see `_patientFormRow.scss`).
 */
export const BookingBillingPathToggle = forwardRef<HTMLDivElement, BookingBillingPathToggleProps>(
  function BookingBillingPathToggle({ value, onChange, className }, ref) {
    return (
      <div ref={ref} className={`${styles.panel} ${className ?? ''}`}>
        <p className={styles.title}>How are you booking this session?</p>
        <p className={styles.helper}>You can switch this option before you confirm payment.</p>
        <div className={styles.options} role="radiogroup" aria-label="Booking payment path">
          <button
            type="button"
            className={styles.option}
            aria-pressed={value === 'medicare'}
            onClick={() => onChange('medicare')}
          >
            <span className={styles.optionLabel}>Claim Medicare rebate</span>
            <span className={styles.optionHint}>Referral and eligibility checks apply before booking.</span>
          </button>
          <button
            type="button"
            className={styles.option}
            aria-pressed={value === 'private'}
            onClick={() => onChange('private')}
          >
            <span className={styles.optionLabel}>Private booking</span>
            <span className={styles.optionHint}>No Medicare referral requirement; full private fee applies.</span>
          </button>
        </div>
      </div>
    );
  },
);

export default BookingBillingPathToggle;
