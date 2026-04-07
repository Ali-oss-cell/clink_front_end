import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

export type BookingWizardState = {
  step: number;
  service: string | null;
  psychologist: string | null;
  appointmentId: string | null;
};

const MIN_STEP = 1;
const MAX_STEP = 5;

function clampStep(value: string | null): number {
  const n = Number(value ?? MIN_STEP);
  if (Number.isNaN(n)) return MIN_STEP;
  return Math.min(MAX_STEP, Math.max(MIN_STEP, Math.trunc(n)));
}

export function useBookingWizardState(): BookingWizardState {
  const [searchParams] = useSearchParams();

  return useMemo(
    () => ({
      step: clampStep(searchParams.get('step')),
      service: searchParams.get('service'),
      psychologist: searchParams.get('psychologist'),
      appointmentId: searchParams.get('appointment_id'),
    }),
    [searchParams]
  );
}

