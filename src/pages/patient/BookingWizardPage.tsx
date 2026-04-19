import { useEffect, useRef } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { ServiceSelectionPage } from './ServiceSelectionPage';
import { PsychologistSelectionPage } from './PsychologistSelectionPage';
import { DateTimeSelectionPage } from './DateTimeSelectionPage';
import { AppointmentDetailsPage } from './AppointmentDetailsPage';
import { PaymentPage } from './PaymentPage';
import { useBookingWizardState } from './useBookingWizardState';
import { trackWizardEvent } from '../../services/analytics/wizardTelemetry';

export const BookingWizardPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { step, service, psychologist, appointmentId } = useBookingWizardState();
  const didTrackViewed = useRef(false);
  const previousStep = useRef<number | null>(null);

  const billingPath =
    searchParams.get('billing_path') === 'medicare' || searchParams.get('billing_path') === 'private'
      ? (searchParams.get('billing_path') as 'medicare' | 'private')
      : 'unknown';

  useEffect(() => {
    if (!didTrackViewed.current) {
      trackWizardEvent({ event_name: 'wizard_viewed', step_id: `step_${step}`, billing_path: billingPath });
      didTrackViewed.current = true;
    }
    trackWizardEvent({ event_name: 'wizard_step_viewed', step_id: `step_${step}`, billing_path: billingPath });

    if (previousStep.current != null) {
      if (step > previousStep.current) {
        trackWizardEvent({ event_name: 'wizard_step_advanced', step_id: `step_${step}`, billing_path: billingPath });
      } else if (step < previousStep.current) {
        trackWizardEvent({ event_name: 'wizard_step_back', step_id: `step_${step}`, billing_path: billingPath });
      }
    }
    previousStep.current = step;
  }, [step, billingPath]);

  if (step >= 2 && !service) {
    return <Navigate to="/appointments/book-appointment?step=1" replace />;
  }

  if (step >= 3 && !psychologist) {
    return <Navigate to={`/appointments/book-appointment?step=2&service=${service ?? ''}`} replace />;
  }

  if (step >= 4 && !appointmentId) {
    const params = new URLSearchParams();
    params.set('step', '3');
    if (service) params.set('service', service);
    if (psychologist) params.set('psychologist', psychologist);
    return <Navigate to={`/appointments/book-appointment?${params.toString()}`} replace />;
  }

  switch (step) {
    case 1:
      return <ServiceSelectionPage />;
    case 2:
      return <PsychologistSelectionPage />;
    case 3:
      return <DateTimeSelectionPage />;
    case 4:
      return <AppointmentDetailsPage />;
    case 5:
      return <PaymentPage />;
    default:
      return <ServiceSelectionPage />;
  }
};

