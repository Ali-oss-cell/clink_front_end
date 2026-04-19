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

/**
 * Post-auth redirect resolver.
 *
 * Patients always land on `/patient/setup` after login/register. The setup
 * page calls `/api/auth/patient/setup/` and, if the wizard has already been
 * completed, redirects to `/patient/dashboard` itself. That keeps all
 * "have-we-finished-onboarding" logic on the server. Other roles go straight
 * to their role dashboard.
 */
export function getPostAuthRedirect(user: {
  role?: string;
} | null | undefined): string {
  if (!user) return '/';
  const role = normalizeAuthRole(user.role);
  if (role === 'patient') {
    return '/patient/setup';
  }
  return getDashboardPathForRole(user.role);
}
