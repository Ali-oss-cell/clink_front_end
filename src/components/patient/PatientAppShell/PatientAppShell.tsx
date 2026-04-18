import { useCallback, useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import type { User } from '../../../types/simple-auth';
import { authService, type PatientNotificationItem } from '../../../services/api/auth';
import {
  CalendarIcon,
  DashboardIcon,
  ClipboardIcon,
  DollarIcon,
  BookIcon,
  VideoIcon,
  BellIcon,
} from '../../../utils/icons';
import { Button } from '../../ui/button';
import styles from './PatientAppShell.module.scss';
import { ShellBrandMark } from '../../shell/ShellBrandMark';

interface PatientAppShellProps {
  user: User;
  children: React.ReactNode;
}

const navClass = ({ isActive }: { isActive: boolean }) =>
  `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`;

const NOTIF_POLL_MS = 3 * 60 * 1000;

export const PatientAppShell: React.FC<PatientAppShellProps> = ({ user, children }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [referralNotices, setReferralNotices] = useState<PatientNotificationItem[]>([]);

  const initials = [user.first_name?.[0], user.last_name?.[0]]
    .filter(Boolean)
    .join('')
    .toUpperCase() || 'P';

  const displayName =
    user.full_name?.trim() ||
    [user.first_name, user.last_name].filter(Boolean).join(' ').trim() ||
    user.email ||
    'Your account';

  const profileLabel = `View profile for ${displayName}`;

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = async () => {
    await authService.logout();
    navigate('/');
  };

  const refreshReferralNotifications = useCallback(async () => {
    try {
      const data = await authService.listPatientNotifications({ unread: true, limit: 8 });
      const referralOnly = data.results.filter((n) => n.kind.startsWith('referral_'));
      setReferralNotices(referralOnly);
    } catch {
      /* non-blocking */
    }
  }, []);

  useEffect(() => {
    void refreshReferralNotifications();
    const id = window.setInterval(() => void refreshReferralNotifications(), NOTIF_POLL_MS);
    const onVis = () => {
      if (document.visibilityState === 'visible') void refreshReferralNotifications();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [refreshReferralNotifications]);

  const primaryNotice = referralNotices[0];

  const handleNoticeView = async () => {
    if (!primaryNotice) return;
    try {
      await authService.markPatientNotificationRead(primaryNotice.id);
    } catch {
      /* still navigate */
    }
    setReferralNotices((prev) => prev.filter((n) => n.id !== primaryNotice.id));
    if (primaryNotice.cta_path) {
      navigate(primaryNotice.cta_path);
    } else {
      navigate('/patient/dashboard');
    }
  };

  const handleNoticeDismissAll = async () => {
    try {
      await authService.markAllPatientNotificationsRead();
    } catch {
      /* ignore */
    }
    setReferralNotices([]);
  };

  return (
    <div className={`patientShell ${styles.root}`}>
      <button
        type="button"
        className={styles.menuToggle}
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((o) => !o)}
      >
        {menuOpen ? '×' : '☰'}
      </button>

      <div
        className={`${styles.backdrop} ${menuOpen ? styles.open : ''}`}
        aria-hidden
        onClick={closeMenu}
      />

      <aside className={`${styles.sidebar} ${menuOpen ? styles.open : ''}`}>
        <div className={styles.brand}>
          <ShellBrandMark to="/patient/dashboard" onClick={closeMenu} />
        </div>

        <div className={styles.userBlock}>
          <NavLink
            to="/patient/account"
            className={styles.avatarLink}
            aria-label={profileLabel}
            onClick={closeMenu}
          >
            <span className={styles.avatar}>{initials}</span>
          </NavLink>
          <div className={styles.userMeta}>
            <NavLink
              to="/patient/account"
              className={styles.profileNameLink}
              aria-label={profileLabel}
              onClick={closeMenu}
            >
              {displayName}
            </NavLink>
          </div>
        </div>

        <nav className={styles.nav} aria-label="Patient">
          <NavLink to="/patient/dashboard" className={navClass} onClick={closeMenu}>
            <DashboardIcon size="sm" className={styles.navIcon} />
            <span className={styles.navText}>Dashboard</span>
          </NavLink>
          <NavLink to="/patient/appointments" className={navClass} onClick={closeMenu}>
            <CalendarIcon size="sm" className={styles.navIcon} />
            <span className={styles.navText}>Appointments</span>
          </NavLink>
          <NavLink to="/patient/intake-form" className={navClass} onClick={closeMenu}>
            <ClipboardIcon size="sm" className={styles.navIcon} />
            <span className={styles.navText}>Intake form</span>
          </NavLink>
          <NavLink to="/patient/invoices" className={navClass} onClick={closeMenu}>
            <DollarIcon size="sm" className={styles.navIcon} />
            <span className={styles.navText}>Invoices</span>
          </NavLink>
          <NavLink to="/patient/resources" className={navClass} onClick={closeMenu}>
            <BookIcon size="sm" className={styles.navIcon} />
            <span className={styles.navText}>Resources</span>
          </NavLink>
          <NavLink to="/recordings" className={navClass} onClick={closeMenu}>
            <VideoIcon size="sm" className={styles.navIcon} />
            <span className={styles.navText}>Recordings</span>
          </NavLink>
        </nav>

        <div className={styles.sidebarFooter}>
          <button
            type="button"
            className={styles.ctaButton}
            onClick={() => {
              closeMenu();
              navigate('/appointments/book-appointment');
            }}
          >
            Book session
          </button>
          <div className={styles.footerLinks}>
            <NavLink to="/patient/account" className={styles.footerLink} onClick={closeMenu}>
              Account settings
            </NavLink>
            <NavLink to="/contact" className={styles.footerLink} onClick={closeMenu}>
              Help centre
            </NavLink>
            <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
              Log out
            </button>
          </div>
        </div>
      </aside>

      <div className={styles.main}>
        {primaryNotice && (
          <div className={styles.referralNotifBanner} role="status" aria-live="polite">
            <span className={styles.referralNotifIcon} aria-hidden>
              <BellIcon size="sm" />
            </span>
            <div className={styles.referralNotifText}>
              <p className={styles.referralNotifTitle}>{primaryNotice.title}</p>
              <p className={styles.referralNotifBody}>
                {primaryNotice.body.split('\n').find((line) => line.trim()) ?? primaryNotice.body}
              </p>
            </div>
            <div className={styles.referralNotifActions}>
              <Button
                type="button"
                size="sm"
                className={styles.referralNotifPrimary}
                onClick={() => void handleNoticeView()}
              >
                View next step
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className={styles.referralNotifDismiss}
                onClick={() => void handleNoticeDismissAll()}
              >
                Dismiss all
              </Button>
            </div>
          </div>
        )}
        {children}
      </div>
    </div>
  );
};
