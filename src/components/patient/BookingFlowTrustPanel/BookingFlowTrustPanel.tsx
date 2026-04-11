import type { FC } from 'react';
import styles from './BookingFlowTrustPanel.module.scss';

export type BookingFlowTrustVariant = 'service' | 'psychologist' | 'datetime';

const COPY: Record<
  BookingFlowTrustVariant,
  { title: string; body: string; bullets?: string[] }
> = {
  service: {
    title: 'Why you can trust this step',
    body:
      'Every session type here is delivered by AHPRA-registered psychologists using evidence-based approaches. Fees and rebates are shown clearly before you pay—no surprises at checkout.',
  },
  psychologist: {
    title: 'Choosing your clinician',
    body:
      'Profiles show real qualifications, specialties, and registration details so you can pick someone who fits—not just the next available name. Ratings and experience are there to support your decision, not replace it.',
    bullets: ['AHPRA registration on each profile', 'You can change your mind before you lock in a time'],
  },
  datetime: {
    title: 'Before you pick a time',
    body:
      'Choose what actually works for your week. After you confirm, you can still reschedule within our policy if something comes up—we would rather you attend than force a bad fit.',
  },
};

interface BookingFlowTrustPanelProps {
  variant: BookingFlowTrustVariant;
  className?: string;
  /** Span full content column (e.g. psychologist grid step). */
  wide?: boolean;
}

export const BookingFlowTrustPanel: FC<BookingFlowTrustPanelProps> = ({
  variant,
  className,
  wide,
}) => {
  const { title, body, bullets } = COPY[variant];
  return (
    <aside
      className={`${styles.panel} ${wide ? styles.panelWide : ''} ${className ?? ''}`}
      aria-label={title}
    >
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.body}>{body}</p>
      {bullets && bullets.length > 0 && (
        <ul className={styles.list}>
          {bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      )}
    </aside>
  );
};
