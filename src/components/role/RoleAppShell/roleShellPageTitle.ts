import type { User } from '../../../types/simple-auth';

/**
 * Maps role-area routes to a concise title for the shared role shell top bar.
 */
export function getRoleShellPageTitle(pathname: string, role: User['role']): string {
  const p = pathname.replace(/\/$/, '') || '/';

  if (role === 'admin') {
    if (p === '/admin' || p === '/admin/dashboard') return 'Dashboard';
    if (p.startsWith('/admin/users')) return 'Users';
    if (p.startsWith('/admin/appointments')) return 'Appointments';
    if (p.startsWith('/admin/patients')) return 'Patients';
    if (p.startsWith('/admin/staff')) return 'Staff';
    if (p.startsWith('/admin/billing')) return 'Billing';
    if (p.startsWith('/admin/referrals')) return 'Referrals';
    if (p.startsWith('/admin/analytics')) return 'Analytics';
    if (p.startsWith('/admin/resources')) return 'Resources';
    if (p.startsWith('/admin/audit-logs')) return 'Audit logs';
    if (p.startsWith('/admin/settings')) return 'Settings';
    if (p.startsWith('/admin/data-deletion')) return 'Data deletion';
    return 'Admin portal';
  }

  if (role === 'psychologist') {
    if (p === '/psychologist' || p === '/psychologist/dashboard') return 'Dashboard';
    if (p.startsWith('/psychologist/schedule')) return 'Schedule';
    if (p.startsWith('/psychologist/patients')) return 'Patients';
    if (p.startsWith('/psychologist/notes')) return 'Notes';
    if (p.startsWith('/psychologist/recordings')) return 'Recordings';
    if (p.startsWith('/psychologist/profile')) return 'Profile';
    return 'Psychologist portal';
  }

  if (p === '/manager' || p === '/manager/dashboard') return 'Dashboard';
  if (p.startsWith('/manager/staff')) return 'Staff';
  if (p.startsWith('/manager/patients')) return 'Patients';
  if (p.startsWith('/manager/appointments')) return 'Appointments';
  if (p.startsWith('/manager/billing')) return 'Billing';
  if (p.startsWith('/manager/resources')) return 'Resources';
  return 'Practice manager portal';
}
