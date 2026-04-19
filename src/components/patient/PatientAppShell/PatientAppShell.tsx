import { useCallback, useEffect, useRef, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import type { User } from '../../../types/simple-auth';
import { authService, type PatientNotificationItem } from '../../../services/api/auth';
import { getPatientShellPageTitle } from './patientShellPageTitle';
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
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [patientNotices, setPatientNotices] = useState<PatientNotificationItem[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifWrapRef = useRef<HTMLDivElement>(null);

  const pageTitle = getPatientShellPageTitle(location.pathname);

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

  const refreshPatientNotifications = useCallback(async () => {
    try {
      const data = await authService.listPatientNotifications({ unread: true, limit: 12 });
      setPatientNotices(data.results);
    } catch {
      /* non-blocking */
    }
  }, []);

  useEffect(() => {
    void refreshPatientNotifications();
    const id = window.setInterval(() => void refreshPatientNotifications(), NOTIF_POLL_MS);
    const onVis = () => {
      if (document.visibilityState === 'visible') void refreshPatientNotifications();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [refreshPatientNotifications]);

  const primaryNotice = patientNotices[0];
  const unreadCount = patientNotices.length;

  const openNotice = async (notice: PatientNotificationItem) => {
    try {
      await authService.markPatientNotificationRead(notice.id);
    } catch {
      /* still navigate */
    }
    setPatientNotices((prev) => prev.filter((n) => n.id !== notice.id));
    setNotifOpen(false);
    if (notice.cta_path) {
      navigate(notice.cta_path);
    } else {
      navigate('/patient/dashboard');
    }
  };

  const handleNoticeView = async () => {
    if (!primaryNotice) return;
    await openNotice(primaryNotice);
  };

  useEffect(() => {
    if (!notifOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (notifWrapRef.current && !notifWrapRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setNotifOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [notifOpen]);

  const handleNoticeDismissAll = async () => {
    try {
      await authService.markAllPatientNotificationsRead();
    } catch {
      /* ignore */
    }
    setPatientNotices([]);
    setNotifOpen(false);
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

        <nav className={styles.nav} aria-label="Patient">
          <NavLink to="/patient/dashboard" className={navClass} onClick={closeMenu}>
            <DashboardIcon size="sm" className={styles.navIcon} />
            <span className={styles.navText}>Dashboard</span>
          </NavLink>
          <NavLink to="/patient/appointments" className={navClass} onClick={closeMenu}>
            <CalendarIcon size="sm" className={styles.navIcon} />
            <span className={styles.navText}>Appointments</span>
          </NavLink>
          <NavLink to="/patient/setup" className={navClass} onClick={closeMenu}>
            <ClipboardIcon size="sm" className={styles.navIcon} />
            <span className={styles.navText}>Setup</span>
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
        <header className={styles.topBar} aria-label="Workspace">
          <div className={styles.topBarPill}>
            <div className={styles.topBarLead}>
              <p className={styles.topBarEyebrow}>Patient portal</p>
              <p className={styles.topBarTitle}>{pageTitle}</p>
            </div>
            <div className={styles.topBarTrailing}>
              <div className={styles.topBarUser}>
                <NavLink
                  to="/patient/account"
                  className={styles.topBarAvatarLink}
                  aria-label={profileLabel}
                >
                  <span className={styles.topBarAvatar}>{initials}</span>
                </NavLink>
                <NavLink
                  to="/patient/account"
                  className={styles.topBarProfileLink}
                  aria-label={profileLabel}
                >
                  {displayName}
                </NavLink>
              </div>
              <div className={styles.notifWrap} ref={notifWrapRef}>
                <button
                  type="button"
                  className={styles.notifBtn}
                  aria-label={
                    unreadCount > 0
                      ? `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`
                      : 'Notifications — no new updates'
                  }
                  aria-expanded={notifOpen}
                  aria-haspopup="true"
                  onClick={() => setNotifOpen((o) => !o)}
                >
                  <BellIcon size="md" aria-hidden />
                  {unreadCount > 0 ? (
                    <span className={styles.notifBadge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
                  ) : null}
                </button>
                {notifOpen && (
                  <div className={styles.notifDropdown} role="dialog" aria-label="Notifications">
                    {patientNotices.length === 0 ? (
                      <p className={styles.notifEmpty}>You&apos;re all caught up.</p>
                    ) : (
                      <ul className={styles.notifList}>
                        {patientNotices.map((n) => (
                          <li key={n.id} className={styles.notifItem}>
                            <div className={styles.notifItemText}>
                              <p className={styles.notifItemTitle}>{n.title}</p>
                              <p className={styles.notifItemBody}>
                                {n.body.split('\n').find((line) => line.trim()) ?? n.body}
                              </p>
                            </div>
                            <button
                              type="button"
                              className={styles.notifItemCta}
                              onClick={() => void openNotice(n)}
                            >
                              Open
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                    {patientNotices.length > 1 ? (
                      <button
                        type="button"
                        className={styles.notifDismissAll}
                        onClick={() => void handleNoticeDismissAll()}
                      >
                        Mark all read
                      </button>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

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
        <div className={styles.mainContent} key={location.pathname}>
          {children}
        </div>
      </div>
    </div>
  );
};
