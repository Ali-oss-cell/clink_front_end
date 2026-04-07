import { Navigate } from 'react-router-dom';
import { ServiceSelectionPage } from './ServiceSelectionPage';
import { PsychologistSelectionPage } from './PsychologistSelectionPage';
import { DateTimeSelectionPage } from './DateTimeSelectionPage';
import { AppointmentDetailsPage } from './AppointmentDetailsPage';
import { PaymentPage } from './PaymentPage';
import { useBookingWizardState } from './useBookingWizardState';

export const BookingWizardPage: React.FC = () => {
  const { step, service, psychologist, appointmentId } = useBookingWizardState();

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

