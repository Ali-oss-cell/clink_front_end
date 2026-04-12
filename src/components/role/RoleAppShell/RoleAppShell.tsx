import { useMemo, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import type { User } from '../../../types/simple-auth';
import { authService } from '../../../services/api/auth';
import {
  DashboardIcon,
  UserIcon,
  UsersIcon,
  CalendarIcon,
  DollarIcon,
  SettingsIcon,
  ChartIcon,
  BookIcon,
  NotesIcon,
  BriefcaseIcon,
  ClipboardIcon,
  VideoIcon,
} from '../../../utils/icons';
import styles from './RoleAppShell.module.scss';
import { ShellBrandMark } from '../../shell/ShellBrandMark';

interface RoleAppShellProps {
  user: User;
  children: React.ReactNode;
}

type RoleNavItem = {
  to: string;
  label: string;
  icon: React.ReactNode;
};

const navClass = ({ isActive }: { isActive: boolean }) =>
  `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`;

const roleTitle = (role: User['role']) => {
  if (role === 'admin') return 'Admin';
  if (role === 'psychologist') return 'Psychologist';
  if (role === 'practice_manager') return 'Practice manager';
  return 'Portal';
};

export const RoleAppShell: React.FC<RoleAppShellProps> = ({ user, children }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = useMemo<RoleNavItem[]>(() => {
    if (user.role === 'admin') {
      return [
        { to: '/admin/dashboard', label: 'Dashboard', icon: <DashboardIcon size="sm" className={styles.navIcon} /> },
        { to: '/admin/users', label: 'Users', icon: <UsersIcon size="sm" className={styles.navIcon} /> },
        { to: '/admin/appointments', label: 'Appointments', icon: <CalendarIcon size="sm" className={styles.navIcon} /> },
        { to: '/admin/patients', label: 'Patients', icon: <UserIcon size="sm" className={styles.navIcon} /> },
        { to: '/admin/staff', label: 'Staff', icon: <BriefcaseIcon size="sm" className={styles.navIcon} /> },
        { to: '/admin/billing', label: 'Billing', icon: <DollarIcon size="sm" className={styles.navIcon} /> },
        { to: '/admin/analytics', label: 'Analytics', icon: <ChartIcon size="sm" className={styles.navIcon} /> },
        { to: '/admin/resources', label: 'Resources', icon: <BookIcon size="sm" className={styles.navIcon} /> },
        { to: '/admin/audit-logs', label: 'Audit logs', icon: <ClipboardIcon size="sm" className={styles.navIcon} /> },
        { to: '/admin/settings', label: 'Settings', icon: <SettingsIcon size="sm" className={styles.navIcon} /> },
      ];
    }

    if (user.role === 'psychologist') {
      return [
        { to: '/psychologist/dashboard', label: 'Dashboard', icon: <DashboardIcon size="sm" className={styles.navIcon} /> },
        { to: '/psychologist/schedule', label: 'Schedule', icon: <CalendarIcon size="sm" className={styles.navIcon} /> },
        { to: '/psychologist/patients', label: 'Patients', icon: <UsersIcon size="sm" className={styles.navIcon} /> },
        { to: '/psychologist/notes', label: 'Notes', icon: <NotesIcon size="sm" className={styles.navIcon} /> },
        {
          to: '/psychologist/recordings',
          label: 'Recordings',
          icon: <VideoIcon size="sm" className={styles.navIcon} />,
        },
        { to: '/psychologist/profile', label: 'Profile', icon: <UserIcon size="sm" className={styles.navIcon} /> },
      ];
    }

    return [
      { to: '/manager/dashboard', label: 'Dashboard', icon: <DashboardIcon size="sm" className={styles.navIcon} /> },
      { to: '/manager/staff', label: 'Staff', icon: <BriefcaseIcon size="sm" className={styles.navIcon} /> },
      { to: '/manager/patients', label: 'Patients', icon: <UsersIcon size="sm" className={styles.navIcon} /> },
      { to: '/manager/appointments', label: 'Appointments', icon: <CalendarIcon size="sm" className={styles.navIcon} /> },
      { to: '/manager/billing', label: 'Billing', icon: <DollarIcon size="sm" className={styles.navIcon} /> },
      { to: '/manager/resources', label: 'Resources', icon: <BookIcon size="sm" className={styles.navIcon} /> },
    ];
  }, [user.role]);

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = async () => {
    await authService.logout();
    navigate('/');
  };

  const initials = `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase() || 'U';
  const displayName = user.full_name || `${user.first_name} ${user.last_name}`.trim() || user.email;

  return (
    <div className={`${styles.root} ${styles[`role_${user.role}`] ?? ''}`}>
      <button
        type="button"
        className={styles.menuToggle}
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((v) => !v)}
      >
        {menuOpen ? '×' : '☰'}
      </button>

      <div className={`${styles.backdrop} ${menuOpen ? styles.open : ''}`} aria-hidden onClick={closeMenu} />

      <aside className={`${styles.sidebar} ${menuOpen ? styles.open : ''}`}>
        <div className={styles.brand}>
          <ShellBrandMark to={navItems[0]?.to ?? '/'} onClick={closeMenu} />
        </div>

        <div className={styles.userBlock}>
          <span className={styles.avatar}>{initials}</span>
          <div className={styles.userMeta}>
            <p className={styles.welcomeLabel}>{roleTitle(user.role)}</p>
            <p className={styles.profileName}>{displayName}</p>
          </div>
        </div>

        <nav className={styles.nav} aria-label={`${roleTitle(user.role)} navigation`}>
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={navClass} onClick={closeMenu}>
              {item.icon}
              <span className={styles.navText}>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
            Log out
          </button>
        </div>
      </aside>

      <div className={styles.main}>{children}</div>
    </div>
  );
};
