import type { FC, ReactNode } from 'react';
import styles from './PatientShellPage.module.scss';

interface PatientShellPageProps {
  children: ReactNode;
  className?: string;
}

/**
 * Wraps patient-area main content with consistent max-width and typography context.
 * Use with classes from the same module (pageTitle, surfaceCard, etc.) on children.
 */
export const PatientShellPage: FC<PatientShellPageProps> = ({ children, className = '' }) => (
  <div className={`${styles.page} ${className}`.trim()}>{children}</div>
);

export const patientShellPageStyles = styles;
