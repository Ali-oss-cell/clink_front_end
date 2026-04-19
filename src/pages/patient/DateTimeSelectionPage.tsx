import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '../../components/common/Layout/Layout';
import { authService } from '../../services/api/auth';
import { appointmentsService } from '../../services/api/appointments';
import { servicesService } from '../../services/api/services';
import type { AvailableSlotsResponse, TimeSlot } from '../../services/api/appointments';
import { WarningIcon, EditIcon, CalendarIcon, ClockIcon } from '../../utils/icons';
import { Button } from '../../components/ui/button';
import { formatLocalDateYYYYMMDD } from '../../utils/dateLocal';
import styles from './DateTimeSelection.module.scss';
import bookingFlow from './PatientPages.module.scss';
import { BookingFlowProgress } from '../../components/patient/BookingFlowProgress/BookingFlowProgress';
import { BookingFlowTrustPanel } from '../../components/patient/BookingFlowTrustPanel/BookingFlowTrustPanel';
import { trackWizardEvent } from '../../services/analytics/wizardTelemetry';

const BOOKING_BILLING_PATH_KEY = 'booking_billing_path';

type TimeOfDayBand = 'morning' | 'afternoon' | 'evening';

/** Aligns with GET available-slots time_window bands (local hour). */
function deriveTimeWindowFromHour(h: number): TimeOfDayBand {
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

const BAND_LABELS: Record<TimeOfDayBand, string> = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
};

/** Title-case each word for headings and summaries (e.g. API display names). */
function formatPersonDisplayName(name: string): string {
  const t = name.trim();
  if (!t) return name;
  return t
    .split(/\s+/)
    .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : word))
    .join(' ');
}

export const DateTimeSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedService = searchParams.get('service');
  const selectedPsychologist = searchParams.get('psychologist');
  const slotIdFromUrl = searchParams.get('slot_id');
  const bookingSessionParam = searchParams.get('booking_session_type');
  const bookingBillingPath: 'medicare' | 'private' = (() => {
    const fromQuery = searchParams.get('billing_path');
    if (fromQuery === 'private' || fromQuery === 'medicare') return fromQuery;
    try {
      const fromStorage = sessionStorage.getItem(BOOKING_BILLING_PATH_KEY);
      if (fromStorage === 'private' || fromStorage === 'medicare') return fromStorage;
    } catch {
      /* ignore */
    }
    return 'medicare';
  })();

  const billingPathTelemetry =
    searchParams.get('billing_path') === 'medicare' || searchParams.get('billing_path') === 'private'
      ? (searchParams.get('billing_path') as 'medicare' | 'private')
      : 'unknown';

  /** Wave 3: omit until user picks a band (unless deep-linked with slot_id — full fetch first). */
  const [timeWindow, setTimeWindow] = useState<TimeOfDayBand | null>(null);

  const [availabilityData, setAvailabilityData] = useState<AvailableSlotsResponse | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [sessionType, setSessionType] = useState<'telehealth' | 'in_person'>(() => {
    const s = searchParams.get('booking_session_type');
    if (s === 'telehealth' || s === 'in_person') {
      return s;
    }
    return 'telehealth';
  });
  const [loading, setLoading] = useState(() => !!searchParams.get('slot_id'));
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState(false);
  const [serviceId, setServiceId] = useState<number | null>(null);
  
  // Get user from auth service
  const user = authService.getStoredUser();

  // ✅ Convert service slug to ID on page load - dynamically fetch from API
  useEffect(() => {
    let isMounted = true; // Prevent state updates after unmount
    
    const loadServiceId = async () => {
      if (!selectedService || selectedService.trim() === '') {
        if (isMounted) {
          setError('No service selected. Please go back and select a service.');
        }
        return;
      }
      
      try {
        // Check if it's already a numeric ID
        const numericId = parseInt(selectedService);
        if (!isNaN(numericId)) {
          if (isMounted) {
            setServiceId(numericId);
          }
          return;
        }
        
        const services = await servicesService.getAllServices();

        // Try to find service by matching slug to service name
        const matchedService = services.find(s => {
          const serviceSlug = s.name.toLowerCase().replace(/\s+/g, '-');
          const selectedSlug = selectedService.toLowerCase();
          
          if (serviceSlug === selectedSlug) {
            return true;
          }

          if (serviceSlug.includes(selectedSlug) || selectedSlug.includes(serviceSlug)) {
            return true;
          }

          const serviceBase = serviceSlug.replace(/-session$/i, '');
          const selectedBase = selectedSlug.replace(/-session$/i, '');
          if (serviceBase === selectedBase) {
            return true;
          }
          
          return false;
        });
        
        if (matchedService && isMounted) {
          setServiceId(matchedService.id);
        } else if (!matchedService && isMounted) {
          console.error('[DateTimeSelectionPage] Service not found for slug:', selectedService);
          setError(`Service "${selectedService}" not found. Please select a service again.`);
        }
      } catch (err) {
        console.error('[DateTimeSelectionPage] Error loading service:', err);
        if (isMounted) {
          setError('Failed to load service information. Please try selecting a service again.');
        }
      }
    };
    
    loadServiceId();
    
    return () => {
      isMounted = false; // Cleanup to prevent state updates after unmount
    };
  }, [selectedService]); // Removed navigate from dependencies to prevent loop

  const fetchAvailableSlots = useCallback(
    async (opts?: { omitTimeWindow?: boolean }) => {
      try {
        setLoading(true);
        setError(null);

        const psychologistId = parseInt(selectedPsychologist || '0');
        if (!psychologistId || isNaN(psychologistId)) {
          throw new Error('Invalid psychologist ID. Please select a psychologist first.');
        }

        if (serviceId && (isNaN(serviceId) || serviceId <= 0)) {
          throw new Error('Invalid service ID. Please select a service again.');
        }

        const omitTimeWindow = opts?.omitTimeWindow === true;
        const apiTimeWindow = omitTimeWindow ? undefined : timeWindow ?? undefined;

        if (!omitTimeWindow && apiTimeWindow === undefined) {
          setLoading(false);
          return;
        }

        const today = new Date();
        const startDate = formatLocalDateYYYYMMDD(today);

        const endDate = new Date(today);
        endDate.setDate(today.getDate() + 30);
        const endDateStr = formatLocalDateYYYYMMDD(endDate);

        const data = await appointmentsService.getAvailableSlots({
          psychologistId,
          startDate,
          endDate: endDateStr,
          serviceId: serviceId || undefined,
          sessionType,
          timeWindow: apiTimeWindow,
        });

        if (data.schedule_configured === false) {
          setAvailabilityData(data);
          setSelectedDate(null);
          setSelectedSlot(null);
          setError(
            data.message ||
              'This clinician has not set their weekly availability yet. Please choose another psychologist or contact the practice.'
          );
          return;
        }

        const datesWithSlots = (data.available_dates || []).filter((d) => d.slots && d.slots.length > 0);
        const normalized: typeof data = { ...data, available_dates: datesWithSlots };
        setAvailabilityData(normalized);

        const deepLinkedSlot = slotIdFromUrl ? parseInt(slotIdFromUrl, 10) : NaN;

        if (!slotIdFromUrl && datesWithSlots.length > 0) {
          setSelectedDate(datesWithSlots[0].date);
        } else if (!slotIdFromUrl && datesWithSlots.length === 0) {
          if (!data.is_accepting_new_patients) {
            setError(data.message || 'This psychologist is not currently accepting new patients.');
          } else {
            setSelectedDate(null);
          }
        } else if (slotIdFromUrl && !Number.isNaN(deepLinkedSlot)) {
          let matchedDate: string | null = null;
          let matchedSlot: TimeSlot | null = null;
          for (const day of datesWithSlots) {
            const hit = day.slots?.find((s) => s.id === deepLinkedSlot);
            if (hit) {
              matchedDate = day.date;
              matchedSlot = hit;
              break;
            }
          }
          if (matchedDate && matchedSlot) {
            setSelectedDate(matchedDate);
            setSelectedSlot(matchedSlot);
            const h = new Date(matchedSlot.start_time).getHours();
            setTimeWindow(deriveTimeWindowFromHour(h));
          } else if (omitTimeWindow) {
            setTimeWindow('morning');
          }
        }
      } catch (err) {
        console.error('[DateTimeSelectionPage] Failed to load available slots:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load available time slots.';
        setError(errorMessage);
        setAvailabilityData(null);
      } finally {
        setLoading(false);
      }
    },
    [selectedPsychologist, sessionType, serviceId, timeWindow, slotIdFromUrl]
  );

  useEffect(() => {
    if (!selectedPsychologist || selectedPsychologist.trim() === '') {
      if (selectedService) {
        navigate(`/appointments/book-appointment?step=2&service=${selectedService}`, { replace: true });
      } else {
        navigate('/appointments/book-appointment?step=1', { replace: true });
      }
      return;
    }

    const psychologistIdNum = parseInt(selectedPsychologist);
    if (isNaN(psychologistIdNum) || psychologistIdNum <= 0) {
      console.error('[DateTimeSelectionPage] Invalid psychologist ID:', selectedPsychologist);
      setError(`Invalid psychologist ID: ${selectedPsychologist}. Please select a psychologist again.`);
      return;
    }

    if (!serviceId) {
      return;
    }

    if (!slotIdFromUrl && !timeWindow) {
      setLoading(false);
      return;
    }

    const omitFull = !!(slotIdFromUrl && timeWindow === null);
    void fetchAvailableSlots({ omitTimeWindow: omitFull });
  }, [
    selectedPsychologist,
    sessionType,
    serviceId,
    selectedService,
    navigate,
    fetchAvailableSlots,
    timeWindow,
    slotIdFromUrl,
  ]);

  const handleSelectTimeWindow = (band: TimeOfDayBand) => {
    trackWizardEvent({
      event_name: 'wizard_time_window_selected',
      step_id: 'step_3',
      billing_path: billingPathTelemetry,
      metadata: { band },
    });
    setSelectedSlot(null);
    setSelectedDate(null);
    setTimeWindow(band);
  };

  const refetchSlots = useCallback(() => {
    void fetchAvailableSlots({ omitTimeWindow: !!(slotIdFromUrl && timeWindow === null) });
  }, [fetchAvailableSlots, slotIdFromUrl, timeWindow]);

  // No session-type UI: align booking mode with what the clinician offers (refetch via sessionType dep).
  useEffect(() => {
    if (!availabilityData) return;
    if (bookingSessionParam === 'telehealth' || bookingSessionParam === 'in_person') return;
    const th = availabilityData.telehealth_available;
    const ip = availabilityData.in_person_available;
    if (!th && ip) setSessionType('in_person');
    else if (th && !ip) setSessionType('telehealth');
    else if (th && ip) setSessionType('telehealth');
  }, [availabilityData, bookingSessionParam]);

  const handleBookAppointment = async () => {
    // Validation
    if (!selectedSlot) {
      alert('Please select a time slot');
      return;
    }
    
    if (!selectedPsychologist) {
      alert('No psychologist selected. Please go back and select a psychologist.');
      return;
    }
    
    if (!serviceId) {
      alert('Service information is missing. Please go back and select a service.');
      return;
    }

    try {
      setBooking(true);
      
      const bookingData = {
        psychologist_id: parseInt(selectedPsychologist),
        service_id: serviceId,
        time_slot_id: selectedSlot.id,
        session_type: sessionType,
        billing_path: bookingBillingPath,
        notes: ''
      };

      const response = await appointmentsService.bookAppointment(bookingData);
      
      // Navigate directly to wizard step 4
      const svc = selectedService ? `&service=${selectedService}` : '';
      const psy = selectedPsychologist ? `&psychologist=${selectedPsychologist}` : '';
      navigate(`/appointments/book-appointment?step=4&appointment_id=${response.appointment.id}${svc}${psy}`);
    } catch (err) {
      console.error('Booking failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to book appointment.';
      alert(`Booking failed: ${errorMessage}`);
    } finally {
      setBooking(false);
    }
  };

  const handleBack = () => {
    const serviceParam = selectedService || '';
    const psychParam = selectedPsychologist || '';
    navigate(`/appointments/book-appointment?step=2&service=${serviceParam}&psychologist=${psychParam}`);
  };

  const getSelectedDateSlots = (): TimeSlot[] => {
    if (!selectedDate || !availabilityData) return [];
    
    const dateObj = availabilityData.available_dates.find(d => d.date === selectedDate);
    return dateObj?.slots || [];
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-AU', { 
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const resolvingService =
    !!(selectedService && selectedService.trim() !== '' && !serviceId && !error);

  const awaitingBandChoice =
    Boolean(selectedPsychologist && serviceId && !slotIdFromUrl && !timeWindow && !error);

  if (resolvingService) {
    return (
      <Layout user={user} isAuthenticated={true} patientShell className={bookingFlow.patientLayout}>
        <div className={styles.dateTimeSelectionContainer} data-patient-booking-viewport="">
          <div className="container">
            <BookingFlowProgress currentStep={3} />
            <header className={styles.pageHeader}>
              <div className={styles.pageHeaderRow}>
                <div className={styles.pageHeaderStart}>
                  <Button
                    type="button"
                    className={styles.backButton}
                    onClick={handleBack}
                    aria-label="Back to psychologist selection"
                  >
                    ← Back
                  </Button>
                </div>
                <h1 className={styles.pageTitle}>Schedule your visit</h1>
                <div className={styles.pageHeaderEnd} aria-hidden />
              </div>
            </header>
            <div className={`${bookingFlow.bookingFlowMain} ${styles.bookingMainLock}`}>
              <div className={styles.loadingState}>
                <p>Loading service…</p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (awaitingBandChoice) {
    return (
      <Layout user={user} isAuthenticated={true} patientShell className={bookingFlow.patientLayout}>
        <div className={styles.dateTimeSelectionContainer} data-patient-booking-viewport="">
          <div className="container">
            <BookingFlowProgress currentStep={3} />
            <header className={styles.pageHeader}>
              <div className={styles.pageHeaderRow}>
                <div className={styles.pageHeaderStart}>
                  <Button
                    type="button"
                    className={styles.backButton}
                    onClick={handleBack}
                    aria-label="Back to psychologist selection"
                  >
                    ← Back
                  </Button>
                </div>
                <h1 className={styles.pageTitle}>Schedule your visit</h1>
                <div className={styles.pageHeaderEnd} aria-hidden />
              </div>
            </header>
            <div className={`${bookingFlow.bookingFlowMain} ${styles.bookingMainLock}`}>
              <section className={styles.timeWindowGate} aria-labelledby="time-window-gate-heading">
                <h2 id="time-window-gate-heading" className={styles.timeWindowGateTitle}>
                  When suits you best?
                </h2>
                <p className={styles.timeWindowGateLead}>
                  Pick a general part of the day first—we&apos;ll show matching dates and times next.
                </p>
                <div className={styles.timeWindowBandRow} role="group" aria-label="Preferred time of day">
                  {(['morning', 'afternoon', 'evening'] as const).map((band) => (
                    <Button
                      key={band}
                      type="button"
                      className={styles.timeWindowBandChip}
                      onClick={() => handleSelectTimeWindow(band)}
                    >
                      {BAND_LABELS[band]}
                    </Button>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout user={user} isAuthenticated={true} patientShell className={bookingFlow.patientLayout}>
        <div className={styles.dateTimeSelectionContainer} data-patient-booking-viewport="">
          <div className="container">
            <BookingFlowProgress currentStep={3} />
            <header className={styles.pageHeader}>
              <div className={styles.pageHeaderRow}>
                <div className={styles.pageHeaderStart}>
                  <Button
                    type="button"
                    className={styles.backButton}
                    onClick={handleBack}
                    aria-label="Back to psychologist selection"
                  >
                    ← Back
                  </Button>
                </div>
                <h1 className={styles.pageTitle}>Select Date & Time</h1>
                <div className={styles.pageHeaderEnd} aria-hidden />
              </div>
            </header>
            <div className={`${bookingFlow.bookingFlowMain} ${styles.bookingMainLock}`}>
              <div className={styles.loadingState}>
                <p>Loading available time slots…</p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Only show error state if we have an error AND we're not loading
  // Don't show error if availabilityData is null but we're still loading
  if (error && !loading) {
    // Check if error is about psychologist not found
    const isPsychologistNotFound = error.toLowerCase().includes('psychologist') && 
                                   error.toLowerCase().includes('not found');
    const isNoSchedule = availabilityData?.schedule_configured === false;
    
    return (
      <Layout user={user} isAuthenticated={true} patientShell className={bookingFlow.patientLayout}>
        <div className={styles.dateTimeSelectionContainer} data-patient-booking-viewport="">
          <div className="container">
            <BookingFlowProgress currentStep={3} />
            <header className={styles.pageHeader}>
              <div className={styles.pageHeaderRow}>
                <div className={styles.pageHeaderStart}>
                  <Button
                    type="button"
                    className={styles.backButton}
                    onClick={handleBack}
                    aria-label="Back to psychologist selection"
                  >
                    ← Back
                  </Button>
                </div>
                <h1 className={styles.pageTitle}>Select Date & Time</h1>
                <div className={styles.pageHeaderEnd} aria-hidden />
              </div>
            </header>
            <div className={`${bookingFlow.bookingFlowMain} ${styles.bookingMainLock}`}>
            <div className={styles.errorState}>
              <h3 className={styles.errorStateHeading}>
                <span className={styles.errorStateIcon} aria-hidden>
                  <WarningIcon size="md" />
                </span>
                {isPsychologistNotFound
                  ? 'Psychologist not available'
                  : isNoSchedule
                    ? 'No booking hours yet'
                    : 'Unable to load available slots'}
              </h3>
              {isPsychologistNotFound ? (
                <>
                  <p className={styles.errorFriendly}>
                    This clinician may not be bookable anymore, or your link is out of date. Choose another psychologist to keep your booking.
                  </p>
                  <p className={styles.errorTechnical}>{error}</p>
                  <div className={styles.errorCtaRow}>
                    <Button type="button" className={styles.continueButton} onClick={handleBack}>
                      ← Choose another psychologist
                    </Button>
                  </div>
                </>
              ) : isNoSchedule ? (
                <>
                  <p className={styles.errorFriendly}>{error}</p>
                  <div className={styles.errorCtaRow}>
                    <Button type="button" className={styles.continueButton} onClick={handleBack}>
                      ← Choose another psychologist
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <p className={styles.errorMessage}>{error}</p>
                  <Button type="button" className={styles.retryButton} onClick={refetchSlots}>
                    <span className={styles.retryIcon} aria-hidden>
                      <EditIcon size="sm" />
                    </span>
                    Retry
                  </Button>
                </>
              )}
            </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Show error if we finished loading but have no data and no error (shouldn't happen, but handle gracefully)
  if (!loading && !availabilityData && !error) {
    return (
      <Layout user={user} isAuthenticated={true} patientShell className={bookingFlow.patientLayout}>
        <div className={styles.dateTimeSelectionContainer} data-patient-booking-viewport="">
          <div className="container">
            <BookingFlowProgress currentStep={3} />
            <header className={styles.pageHeader}>
              <div className={styles.pageHeaderRow}>
                <div className={styles.pageHeaderStart}>
                  <Button
                    type="button"
                    className={styles.backButton}
                    onClick={handleBack}
                    aria-label="Back to psychologist selection"
                  >
                    ← Back
                  </Button>
                </div>
                <h1 className={styles.pageTitle}>Select Date & Time</h1>
                <div className={styles.pageHeaderEnd} aria-hidden />
              </div>
            </header>
            <div className={`${bookingFlow.bookingFlowMain} ${styles.bookingMainLock}`}>
              <div className={styles.errorState}>
                <h3 className={styles.errorStateHeading}>
                  <span className={styles.errorStateIcon} aria-hidden>
                    <WarningIcon size="md" />
                  </span>
                  No data available
                </h3>
                <p className={styles.errorMessage}>Unable to load appointment availability. Please try again.</p>
                <Button type="button" className={styles.retryButton} onClick={refetchSlots}>
                  <span className={styles.retryIcon} aria-hidden>
                    <EditIcon size="sm" />
                  </span>
                  Retry
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Final guard: if we reach here without availabilityData, something went wrong
  if (!availabilityData) {
    return (
      <Layout user={user} isAuthenticated={true} patientShell className={bookingFlow.patientLayout}>
        <div className={styles.dateTimeSelectionContainer} data-patient-booking-viewport="">
          <div className="container">
            <BookingFlowProgress currentStep={3} />
            <header className={styles.pageHeader}>
              <div className={styles.pageHeaderRow}>
                <div className={styles.pageHeaderStart}>
                  <Button
                    type="button"
                    className={styles.backButton}
                    onClick={handleBack}
                    aria-label="Back to psychologist selection"
                  >
                    ← Back
                  </Button>
                </div>
                <h1 className={styles.pageTitle}>Select Date & Time</h1>
                <div className={styles.pageHeaderEnd} aria-hidden />
              </div>
            </header>
            <div className={`${bookingFlow.bookingFlowMain} ${styles.bookingMainLock}`}>
              <div className={styles.errorState}>
                <h3 className={styles.errorStateHeading}>
                  <span className={styles.errorStateIcon} aria-hidden>
                    <WarningIcon size="md" />
                  </span>
                  No data available
                </h3>
                <p className={styles.errorMessage}>Unable to load appointment availability. Please try again.</p>
                <Button type="button" className={styles.retryButton} onClick={refetchSlots}>
                  <span className={styles.retryIcon} aria-hidden>
                    <EditIcon size="sm" />
                  </span>
                  Retry
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const outOfPocket =
    typeof availabilityData.patient_cost_after_rebate === 'string'
      ? parseFloat(availabilityData.patient_cost_after_rebate).toFixed(2)
      : availabilityData.patient_cost_after_rebate.toFixed(2);

  return (
    <Layout user={user} isAuthenticated={true} patientShell className={bookingFlow.patientLayout}>
      <div className={styles.dateTimeSelectionContainer} data-patient-booking-viewport="">
        <div className="container">
          <BookingFlowProgress currentStep={3} />
          <header className={styles.pageHeader}>
            <div className={styles.pageHeaderRow}>
              <div className={styles.pageHeaderStart}>
                <Button
                  type="button"
                  className={styles.backButton}
                  onClick={handleBack}
                  aria-label="Back to psychologist selection"
                >
                  ← Back
                </Button>
              </div>
              <h1 className={styles.pageTitle}>Schedule your visit</h1>
              <div className={styles.pageHeaderEnd} aria-hidden />
            </div>
          </header>

          <div className={styles.bookingDatetimeSplit}>
            <aside className={styles.bookingSummaryAside} aria-label="Booking summary">
              <div className={styles.summaryAsideName}>
                {formatPersonDisplayName(availabilityData.psychologist_name)}
              </div>
              <div className={styles.summaryAsideRow}>
                <span className={styles.summaryAsideLabel}>Consultation fee</span>
                <span>${availabilityData.consultation_fee}</span>
              </div>
              <div className={styles.summaryAsideRow}>
                <span className={styles.summaryAsideLabel}>Medicare rebate</span>
                <span>−${availabilityData.medicare_rebate_amount}</span>
              </div>
              <div className={styles.summaryAsideRow}>
                <span className={styles.summaryAsideLabel}>Out-of-pocket</span>
                <span className={styles.summaryAsideEm}>${outOfPocket}</span>
              </div>
              <p className={styles.summaryAsideHint}>
                Choose a date and time in the part of day you selected, then continue to confirm your booking.
              </p>
              {availabilityData.booking_policy?.max_advance_booking_days != null && (
                <p className={styles.summaryAsideHint}>
                  Bookings are open up to {availabilityData.booking_policy.max_advance_booking_days} days ahead.
                </p>
              )}
              <BookingFlowTrustPanel variant="datetime" wide className={styles.datetimeTrustPanel} />
            </aside>

            <div className={styles.bookingDatetimeMain}>
          <div className={`${bookingFlow.bookingFlowMain} ${styles.bookingMainLock}`}>
            {timeWindow ? (
              <div className={styles.timeWindowInline} role="group" aria-label="Time of day">
                <span className={styles.timeWindowInlineLabel}>Time of day</span>
                <div className={styles.timeWindowBandRow}>
                  {(['morning', 'afternoon', 'evening'] as const).map((band) => (
                    <Button
                      key={band}
                      type="button"
                      className={`${styles.timeWindowBandChip} ${timeWindow === band ? styles.timeWindowBandChipActive : ''}`}
                      onClick={() => handleSelectTimeWindow(band)}
                    >
                      {BAND_LABELS[band]}
                    </Button>
                  ))}
                </div>
              </div>
            ) : null}
            {availabilityData.available_dates.length > 0 ? (
              <>
                <div className={styles.calendarSection}>
                  <h2 className={styles.calendarTitle} id="booking-date-label">
                    <CalendarIcon size="md" style={{ marginRight: '6px', verticalAlign: 'middle' }} aria-hidden />
                    Date
                  </h2>
                  <div
                    className={styles.dateScrollTrack}
                    aria-labelledby="booking-date-label"
                    aria-label="Available dates"
                  >
                    {availabilityData.available_dates.map((dateObj) => (
                      <div
                        key={dateObj.date}
                        className={`${styles.calendarDay} ${styles.available} ${selectedDate === dateObj.date ? styles.selected : ''}`}
                        onClick={() => {
                          setSelectedDate(dateObj.date);
                          setSelectedSlot(null);
                        }}
                      >
                        <div className={styles.dayName}>{dateObj.day_name}</div>
                        <div className={styles.dayNumber}>{new Date(dateObj.date).getDate()}</div>
                        <div className={styles.availabilityIndicator}>{dateObj.slots.length} slots</div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedDate && (
                  <div className={styles.timeSelectionSection}>
                    <h2 className={styles.timeSectionTitle} id="booking-time-label">
                      <ClockIcon size="md" style={{ marginRight: '6px', verticalAlign: 'middle' }} aria-hidden />
                      <span className={styles.timeSectionTitleText}>Time · {formatDate(selectedDate)}</span>
                    </h2>
                    {getSelectedDateSlots().length > 0 ? (
                      <div
                        className={styles.timeScrollTrack}
                        aria-labelledby="booking-time-label"
                        aria-label="Available times"
                      >
                        {getSelectedDateSlots().map((slot) => (
                          <Button
                            key={slot.id}
                            type="button"
                            className={`${styles.timeSlot} ${styles.available} ${selectedSlot?.id === slot.id ? styles.selected : ''}`}
                            onClick={() => setSelectedSlot(slot)}
                          >
                            {slot.start_time_formatted}
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <p className={styles.noSlotsMessage}>
                        No times this day — pick another date above.
                      </p>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className={styles.emptyState}>
                <h3>
                  {availabilityData.window_filter_message_code === 'NO_SLOTS_IN_TIME_WINDOW'
                    ? 'Nothing in this part of the day'
                    : 'No available appointments'}
                </h3>
                {availabilityData.window_filter_message_code === 'NO_SLOTS_IN_TIME_WINDOW' ? (
                  <p className={styles.windowFilterHint}>
                    Try another time period above (morning, afternoon, or evening), or pick another clinician.
                  </p>
                ) : (
                  <>
                    <p>
                      {formatPersonDisplayName(availabilityData.psychologist_name)} has no openings in the next 30
                      days for the selected visit type.
                    </p>
                    <p>Try another psychologist or check back later.</p>
                  </>
                )}
              </div>
            )}
          </div>
            </div>
          </div>

          <div className={`${bookingFlow.formActionsSticky} ${styles.footerBar}`}>
            <Button
              type="button"
              className={styles.continueButton}
              onClick={handleBookAppointment}
              disabled={!selectedSlot || booking}
            >
              {booking ? (
                <>
                  <ClockIcon size="sm" style={{ marginRight: '6px' }} aria-hidden />
                  Booking…
                </>
              ) : (
                'Continue to payment'
              )}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};
