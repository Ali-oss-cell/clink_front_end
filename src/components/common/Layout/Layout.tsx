import { Header } from '../Header/Header';
import { Footer } from '../Footer/Footer';
import { PatientAppShell } from '../../patient/PatientAppShell/PatientAppShell';
import { RoleAppShell } from '../../role/RoleAppShell/RoleAppShell';
import type { User } from '../../../types/simple-auth';
import styles from './Layout.module.scss';

interface LayoutProps {
  children: React.ReactNode;
  user?: User | null;
  isAuthenticated?: boolean;
  showFooter?: boolean;
  className?: string;
  /** Patient-only: sidebar shell matching in-app design (no marketing header/footer). */
  patientShell?: boolean;
  /**
   * Legacy flag kept for compatibility; header now overlays globally on non-patient layouts.
   */
  overlayPublicHeader?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  user,
  isAuthenticated = false,
  showFooter = true,
  className = '',
  patientShell = false,
  overlayPublicHeader = false,
}) => {
  const usePatientShell =
    patientShell && isAuthenticated && user?.role === 'patient';
  const useClinicalShell =
    isAuthenticated && !!user && (user.role === 'psychologist' || user.role === 'admin' || user.role === 'practice_manager');
  const useRoleShell =
    isAuthenticated &&
    !!user &&
    (user.role === 'admin' || user.role === 'psychologist' || user.role === 'practice_manager');

  if (usePatientShell) {
    return (
      <div
        className={`${styles.layout} ${className}`}
        data-patient-shell=""
      >
        <PatientAppShell user={user}>{children}</PatientAppShell>
      </div>
    );
  }

  if (useRoleShell && user) {
    return (
      <div
        className={`${styles.layout} ${className} ${useClinicalShell ? 'clinicalShell' : ''}`}
        {...(useClinicalShell ? { 'data-clinical-shell': '' } : {})}
      >
        <RoleAppShell user={user}>{children}</RoleAppShell>
      </div>
    );
  }

  return (
    <div className={`${styles.layout} ${className}`}>
      <Header
        isAuthenticated={isAuthenticated}
        userRole={user?.role}
        userName={user?.full_name || user?.first_name}
        heroOverlay={overlayPublicHeader}
      />

      <main className={styles.main}>{children}</main>

      {showFooter && <Footer />}
    </div>
  );
};
