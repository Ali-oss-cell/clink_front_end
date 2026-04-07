import { Navigate, useLocation } from 'react-router-dom';

type BookingStepRedirectProps = {
  step: number;
};

export function BookingStepRedirect({ step }: BookingStepRedirectProps) {
  const location = useLocation();
  const source = new URLSearchParams(location.search);
  source.set('step', String(step));
  return <Navigate to={`/appointments/book-appointment?${source.toString()}`} replace />;
}

