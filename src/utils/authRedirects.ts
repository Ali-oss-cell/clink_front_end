import type { User } from '../types/simple-auth';

const ROLE_PATHS: Record<User['role'], string> = {
  patient: '/patient/dashboard',
  psychologist: '/psychologist/dashboard',
  practice_manager: '/manager/dashboard',
  admin: '/admin/dashboard',
};

/**
 * Map API/user.role strings to a known role (handles minor formatting drift).
 */
export function normalizeAuthRole(role: string | undefined): User['role'] | null {
  if (!role || typeof role !== 'string') return null;
  const r = role.trim().toLowerCase().replace(/[\s-]+/g, '_');
  if (r === 'practice_manager' || r === 'practicemanager' || r === 'manager') {
    return 'practice_manager';
  }
  if (r === 'patient') return 'patient';
  if (r === 'psychologist') return 'psychologist';
  if (r === 'admin') return 'admin';
  return null;
}

/** Default home route after login/register for this role. */
export function getDashboardPathForRole(role: string | undefined): string {
  const n = normalizeAuthRole(role);
  return n ? ROLE_PATHS[n] : '/';
}
