/**
 * Maps patient-area routes to a short title for the shell top bar.
 */
export function getPatientShellPageTitle(pathname: string): string {
  const p = pathname.replace(/\/$/, '') || '/';

  if (p === '/patient' || p === '/patient/dashboard') return 'Dashboard';
  if (p.startsWith('/patient/appointments')) return 'Appointments';
  if (p.startsWith('/patient/setup')) return 'Setup';
  if (p.startsWith('/patient/invoices')) return 'Invoices';
  if (p.startsWith('/patient/resources')) return 'Resources';
  if (p.startsWith('/patient/account')) return 'Account';
  if (p.startsWith('/patient/appointment')) return 'Booking';
  if (p.startsWith('/patient/intake-form')) return 'Setup';
  if (p.startsWith('/appointments/book')) return 'Book appointment';
  if (p.startsWith('/recordings')) return 'Recordings';

  return 'Patient portal';
}
