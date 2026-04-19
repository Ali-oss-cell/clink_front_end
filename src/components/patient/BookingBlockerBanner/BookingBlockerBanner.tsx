import type { FC, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  labelForBlocker,
  primaryFixUrl,
  type RecoveryActionsLike,
} from '../../../utils/bookingBlockers';
import styles from './BookingBlockerBanner.module.scss';

export interface BookingBlockerBannerProps {
  blockingReasons: string[];
  actions: RecoveryActionsLike;
  variant?: 'alert' | 'status';
  /** Optional extra line (e.g. server `message` on revalidation). */
  supportingText?: string;
  className?: string;
  /** Extra content above the primary action (e.g. Review step intro copy). */
  children?: ReactNode;
}

export const BookingBlockerBanner: FC<BookingBlockerBannerProps> = ({
  blockingReasons,
  actions,
  variant = 'alert',
  supportingText,
  className,
  children,
}) => {
  const navigate = useNavigate();
  if (!blockingReasons.length) return null;

  const fixUrl = primaryFixUrl(actions);
  const firstLabel = labelForBlocker(blockingReasons[0]);
  const showDetails = blockingReasons.length > 1;

  return (
    <div
      className={`${styles.panel} ${className ?? ''}`}
      role={variant === 'alert' ? 'alert' : 'status'}
    >
      {children}
      <p className={styles.lead}>
        <strong>{firstLabel}</strong>
        {blockingReasons.length > 1 && (
          <span className={styles.moreCount}> · +{blockingReasons.length - 1} more</span>
        )}
      </p>
      {supportingText ? <p className={styles.supporting}>{supportingText}</p> : null}
      {fixUrl ? (
        <button
          type="button"
          className={`patient-cta-primary ${styles.fixButton}`}
          onClick={() => navigate(fixUrl)}
        >
          Fix now
        </button>
      ) : (
        <p className={styles.hint}>
          No automatic link is available for this item. Use your dashboard or contact the clinic.
        </p>
      )}
      {showDetails ? (
        <details className={styles.details}>
          <summary className={styles.detailsSummary}>All items</summary>
          <ul className={styles.list}>
            {blockingReasons.map((code) => (
              <li key={code}>{labelForBlocker(code)}</li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  );
};

export default BookingBlockerBanner;
