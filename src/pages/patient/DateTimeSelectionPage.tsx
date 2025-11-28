import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '../../components/common/Layout/Layout';
import { authService } from '../../services/api/auth';
import { appointmentsService } from '../../services/api/appointments';
import { servicesService } from '../../services/api/services';
import type { AvailableSlotsResponse, TimeSlot } from '../../services/api/appointments';
import { WarningIcon, EditIcon, ClipboardIcon, VideoIcon, HospitalIcon, CalendarIcon, ClockIcon } from '../../utils/icons';
import styles from './DateTimeSelection.module.scss';

export const DateTimeSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedService = searchParams.get('service');
  const selectedPsychologist = searchParams.get('psychologist');
  
  const [availabilityData, setAvailabilityData] = useState<AvailableSlotsResponse | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [sessionType, setSessionType] = useState<'telehealth' | 'in_person'>('telehealth');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState(false);
  const [serviceId, setServiceId] = useState<number | null>(null);
  
  // Get user from auth service
  const user = authService.getStoredUser();

  // Debug logging
  useEffect(() => {
    console.log('[DateTimeSelectionPage] Component mounted/updated');
    console.log('[DateTimeSelectionPage] selectedService from URL:', selectedService);
    console.log('[DateTimeSelectionPage] selectedPsychologist from URL:', selectedPsychologist);
    console.log('[DateTimeSelectionPage] Current URL:', window.location.href);
    console.log('[DateTimeSelectionPage] All search params:', Object.fromEntries(searchParams.entries()));
  }, [selectedService, selectedPsychologist, searchParams]);

  // ✅ Convert service slug to ID on page load - dynamically fetch from API
  useEffect(() => {
    let isMounted = true; // Prevent state updates after unmount
    
    const loadServiceId = async () => {
      if (!selectedService || selectedService.trim() === '') {
        console.warn('[DateTimeSelectionPage] No service selected, showing error state');
        if (isMounted) {
          setError('No service selected. Please go back and select a service.');
        }
        return;
      }
      
      try {
        // Check if it's already a numeric ID
        const numericId = parseInt(selectedService);
        if (!isNaN(numericId)) {
          console.log('[DateTimeSelectionPage] Service is numeric ID:', numericId);
          if (isMounted) {
            setServiceId(numericId);
          }
          return;
        }
        
        // ✅ Fetch services dynamically from API (uses cache after first call)
        console.log('[DateTimeSelectionPage] Fetching services from API to resolve slug:', selectedService);
        const services = await servicesService.getAllServices();
        console.log('[DateTimeSelectionPage] Available services from API:', services.map(s => ({ id: s.id, name: s.name })));
        
        // Try to find service by matching slug to service name
        const matchedService = services.find(s => {
          const serviceSlug = s.name.toLowerCase().replace(/\s+/g, '-');
          const selectedSlug = selectedService.toLowerCase();
          
          // Exact match
          if (serviceSlug === selectedSlug) {
            console.log(`[DateTimeSelectionPage] Exact match found: "${s.name}" (ID: ${s.id})`);
            return true;
          }
          
          // Partial match (e.g., "individual-therapy" matches "individual-therapy-session")
          if (serviceSlug.includes(selectedSlug) || selectedSlug.includes(serviceSlug)) {
            console.log(`[DateTimeSelectionPage] Partial match found: "${s.name}" (ID: ${s.id})`);
            return true;
          }
          
          // Remove "-session" suffix and try again
          const serviceBase = serviceSlug.replace(/-session$/i, '');
          const selectedBase = selectedSlug.replace(/-session$/i, '');
          if (serviceBase === selectedBase) {
            console.log(`[DateTimeSelectionPage] Base match found (without -session): "${s.name}" (ID: ${s.id})`);
            return true;
          }
          
          return false;
        });
        
        if (matchedService && isMounted) {
          console.log('[DateTimeSelectionPage] ✅ Service resolved successfully:');
          console.log('  - Slug:', selectedService);
          console.log('  - Service ID:', matchedService.id);
          console.log('  - Service Name:', matchedService.name);
          setServiceId(matchedService.id);
        } else if (!matchedService && isMounted) {
          console.error('[DateTimeSelectionPage] ❌ Service not found for slug:', selectedService);
          console.error('[DateTimeSelectionPage] Available service names:', services.map(s => `"${s.name}"`).join(', '));
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

  // ✅ Use useCallback to prevent function recreation on every render
  const fetchAvailableSlots = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // ✅ Validate psychologist ID
      const psychologistId = parseInt(selectedPsychologist || '0');
      if (!psychologistId || isNaN(psychologistId)) {
        throw new Error('Invalid psychologist ID. Please select a psychologist first.');
      }

      // ✅ Validate service ID if provided
      if (serviceId && (isNaN(serviceId) || serviceId <= 0)) {
        throw new Error('Invalid service ID. Please select a service again.');
      }

      // ✅ Set start date to today
      const today = new Date();
      const startDate = today.toISOString().split('T')[0];
      
      // ✅ Set end date to 30 days from today
      const endDate = new Date();
      endDate.setDate(today.getDate() + 30);
      const endDateStr = endDate.toISOString().split('T')[0];
      
      console.log('[DateTimeSelectionPage] Fetching available slots with:', {
        psychologistId,
        startDate,
        endDate: endDateStr,
        serviceId: serviceId || undefined,
        sessionType
      });
      
      const data = await appointmentsService.getAvailableSlots({
        psychologistId,
        startDate,
        endDate: endDateStr,
        serviceId: serviceId || undefined,
        sessionType
      });
      
      console.log('[DateTimeSelectionPage] Available slots loaded:', data);
      
      setAvailabilityData(data);
      
      // Auto-select first available date
      if (data.available_dates.length > 0) {
        setSelectedDate(data.available_dates[0].date);
      } else if (!data.is_accepting_new_patients) {
        // Show message if psychologist is not accepting new patients
        setError(data.message || 'This psychologist is not currently accepting new patients.');
      }
    } catch (err) {
      console.error('[DateTimeSelectionPage] Failed to load available slots:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load available time slots.';
      setError(errorMessage);
      setAvailabilityData(null);
    } finally {
      setLoading(false);
    }
  }, [selectedPsychologist, sessionType, serviceId]); // ✅ Dependencies

  // Fetch available slots on page load
  useEffect(() => {
    // Check if psychologist is missing - only redirect if truly missing
    if (!selectedPsychologist || selectedPsychologist.trim() === '') {
      console.warn('[DateTimeSelectionPage] No psychologist selected in URL params, redirecting');
      // Redirect back to psychologist selection
      if (selectedService) {
        navigate(`/appointments/psychologist-selection?service=${selectedService}`, { replace: true });
      } else {
        navigate('/appointments/book-appointment', { replace: true });
      }
      return;
    }

    // Validate psychologist ID is a valid number
    const psychologistIdNum = parseInt(selectedPsychologist);
    if (isNaN(psychologistIdNum) || psychologistIdNum <= 0) {
      console.error('[DateTimeSelectionPage] Invalid psychologist ID:', selectedPsychologist);
      setError(`Invalid psychologist ID: ${selectedPsychologist}. Please select a psychologist again.`);
      return;
    }

    // Wait for serviceId to be loaded before fetching slots
    if (!serviceId) {
      console.log('[DateTimeSelectionPage] Waiting for serviceId to be loaded...');
      return;
    }

    console.log('[DateTimeSelectionPage] All conditions met, fetching available slots:', {
      psychologist: selectedPsychologist,
      psychologistIdNum,
      serviceId,
      sessionType
    });
    fetchAvailableSlots();
  }, [selectedPsychologist, sessionType, serviceId, selectedService, navigate, fetchAvailableSlots]); // ✅ Include fetchAvailableSlots in deps

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
        notes: ''
      };
      
      const response = await appointmentsService.bookAppointment(bookingData);
      
      // Navigate to appointment details page
      navigate(`/appointments/details?appointment_id=${response.appointment.id}`);
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
    navigate(`/appointments/psychologist-selection?service=${serviceParam}&psychologist=${psychParam}`);
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

  if (loading) {
    return (
      <Layout user={user} isAuthenticated={true} className={styles.patientLayout}>
        <div className={styles.dateTimeSelectionContainer}>
          <div className="container">
            <div className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>Select Date & Time</h1>
              <p className={styles.pageSubtitle}>Loading available appointments...</p>
            </div>
            <div className={styles.loadingState}>
              <p>Loading available time slots...</p>
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
    
    return (
      <Layout user={user} isAuthenticated={true} className={styles.patientLayout}>
        <div className={styles.dateTimeSelectionContainer}>
          <div className="container">
            <div className={styles.pageHeader}>
              <button className={styles.backButton} onClick={handleBack}>
                ← Back to Psychologist Selection
              </button>
              <h1 className={styles.pageTitle}>Select Date & Time</h1>
            </div>
            <div className={styles.errorState}>
              <h3>
                <WarningIcon size="md" style={{ marginRight: '8px', verticalAlign: 'middle' }} /> 
                {isPsychologistNotFound ? 'Psychologist Not Found' : 'Unable to Load Available Slots'}
              </h3>
              <p>{error}</p>
              {isPsychologistNotFound ? (
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
                  <button 
                    className={styles.retryButton} 
                    onClick={handleBack}
                    style={{ backgroundColor: '#4A90E2', color: 'white' }}
                  >
                    ← Select Different Psychologist
                  </button>
                </div>
              ) : (
                <button className={styles.retryButton} onClick={fetchAvailableSlots}>
                  <EditIcon size="sm" style={{ marginRight: '6px' }} />
                  Retry
                </button>
              )}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Show error if we finished loading but have no data and no error (shouldn't happen, but handle gracefully)
  if (!loading && !availabilityData && !error) {
    return (
      <Layout user={user} isAuthenticated={true} className={styles.patientLayout}>
        <div className={styles.dateTimeSelectionContainer}>
          <div className="container">
            <div className={styles.pageHeader}>
              <button className={styles.backButton} onClick={handleBack}>
                ← Back to Psychologist Selection
              </button>
              <h1 className={styles.pageTitle}>Select Date & Time</h1>
            </div>
            <div className={styles.errorState}>
              <h3><WarningIcon size="md" style={{ marginRight: '8px', verticalAlign: 'middle' }} /> No Data Available</h3>
              <p>Unable to load appointment availability. Please try again.</p>
              <button className={styles.retryButton} onClick={fetchAvailableSlots}>
                <EditIcon size="sm" style={{ marginRight: '6px' }} />
                Retry
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Final guard: if we reach here without availabilityData, something went wrong
  if (!availabilityData) {
    return (
      <Layout user={user} isAuthenticated={true} className={styles.patientLayout}>
        <div className={styles.dateTimeSelectionContainer}>
          <div className="container">
            <div className={styles.pageHeader}>
              <button className={styles.backButton} onClick={handleBack}>
                ← Back to Psychologist Selection
              </button>
              <h1 className={styles.pageTitle}>Select Date & Time</h1>
            </div>
            <div className={styles.errorState}>
              <h3><WarningIcon size="md" style={{ marginRight: '8px', verticalAlign: 'middle' }} /> No Data Available</h3>
              <p>Unable to load appointment availability. Please try again.</p>
              <button className={styles.retryButton} onClick={fetchAvailableSlots}>
                <EditIcon size="sm" style={{ marginRight: '6px' }} />
                Retry
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user} isAuthenticated={true} className={styles.patientLayout}>
      <div className={styles.dateTimeSelectionContainer}>
        <div className="container">
          {/* Page Header */}
          <div className={styles.pageHeader}>
            <button className={styles.backButton} onClick={handleBack}>
              ← Back to Psychologist Selection
            </button>
            <h1 className={styles.pageTitle}>Select Date & Time</h1>
            <p className={styles.pageSubtitle}>
              Choose your preferred appointment time with {availabilityData.psychologist_name}
            </p>
          </div>

          {/* Booking Summary */}
          <div className={styles.selectionSummary}>
            <div className={styles.summaryCard}>
              <h3><ClipboardIcon size="md" style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Booking Summary</h3>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Psychologist:</span>
                <span className={styles.summaryValue}>{availabilityData.psychologist_name}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Consultation Fee:</span>
                <span className={styles.summaryValue}>${availabilityData.consultation_fee}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Medicare Rebate:</span>
                <span className={styles.summaryValue}>-${availabilityData.medicare_rebate_amount}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Your Cost:</span>
                <span className={styles.summaryValue}>
                  <strong>$
                    {typeof availabilityData.patient_cost_after_rebate === 'string'
                      ? parseFloat(availabilityData.patient_cost_after_rebate).toFixed(2)
                      : availabilityData.patient_cost_after_rebate.toFixed(2)}
                  </strong>
                </span>
              </div>
            </div>
          </div>

          {/* Session Type Selection */}
          <div className={styles.sessionTypeSection}>
            <h2 className={styles.sessionTypeTitle}><VideoIcon size="lg" style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Session Type</h2>
            <div className={styles.sessionTypeOptions}>
              <div 
                className={`${styles.sessionTypeCard} ${sessionType === 'telehealth' ? styles.selected : ''} ${!availabilityData.telehealth_available ? styles.disabled : ''}`}
                onClick={() => availabilityData.telehealth_available && setSessionType('telehealth')}
              >
                <div className={styles.sessionTypeIcon}><VideoIcon size="xl" /></div>
                <div className={styles.sessionTypeContent}>
                  <h4>Telehealth</h4>
                  <p>Video consultation from home</p>
                  <p>Convenient and private</p>
                </div>
                {!availabilityData.telehealth_available && (
                  <div className={styles.unavailableBadge}>Not Available</div>
                )}
              </div>

              <div 
                className={`${styles.sessionTypeCard} ${sessionType === 'in_person' ? styles.selected : ''} ${!availabilityData.in_person_available ? styles.disabled : ''}`}
                onClick={() => availabilityData.in_person_available && setSessionType('in_person')}
              >
                <div className={styles.sessionTypeIcon}><HospitalIcon size="xl" /></div>
                <div className={styles.sessionTypeContent}>
                  <h4>In-Person</h4>
                  <p>Face-to-face at clinic</p>
                  <p>Traditional consultation</p>
                </div>
                {!availabilityData.in_person_available && (
                  <div className={styles.unavailableBadge}>Not Available</div>
                )}
              </div>
            </div>
          </div>

          {/* Calendar Section */}
          {availabilityData.available_dates.length > 0 ? (
            <>
              <div className={styles.calendarSection}>
                <h2 className={styles.calendarTitle}><CalendarIcon size="lg" style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Select a Date</h2>
                <div className={styles.calendarGrid}>
                  {availabilityData.available_dates.map((dateObj) => (
                    <div
                      key={dateObj.date}
                      className={`${styles.calendarDay} ${styles.available} ${selectedDate === dateObj.date ? styles.selected : ''}`}
                      onClick={() => {
                        setSelectedDate(dateObj.date);
                        setSelectedSlot(null); // Reset selected slot
                      }}
                    >
                      <div className={styles.dayName}>{dateObj.day_name}</div>
                      <div className={styles.dayNumber}>
                        {new Date(dateObj.date).getDate()}
                      </div>
                      <div className={styles.availabilityIndicator}>
                        {dateObj.slots.length} slots
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Time Slots Section */}
              {selectedDate && (
                <div className={styles.timeSelectionSection}>
                  <h2 className={styles.timeSectionTitle}>
                    <ClockIcon size="md" style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                    Available Times - {formatDate(selectedDate)}
                  </h2>
                  <div className={styles.timeSlotsGrid}>
                    {getSelectedDateSlots().map((slot) => (
                      <button
                        key={slot.id}
                        className={`${styles.timeSlot} ${styles.available} ${selectedSlot?.id === slot.id ? styles.selected : ''}`}
                        onClick={() => setSelectedSlot(slot)}
                      >
                        {slot.start_time_formatted}
                      </button>
                    ))}
                  </div>
                  
                  {getSelectedDateSlots().length === 0 && (
                    <p className={styles.noSlotsMessage}>
                      No available time slots for this date. Please select another date.
                    </p>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className={styles.emptyState}>
              <h3>No Available Appointments</h3>
              <p>
                {availabilityData.psychologist_name} has no available appointments in the next 30 days for {sessionType} sessions.
              </p>
              <p>Try selecting a different session type or psychologist.</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={handleBack}
            >
              ← Back
            </button>
            <button
              type="button"
              className={styles.continueButton}
              onClick={handleBookAppointment}
              disabled={!selectedSlot || booking}
            >
              {booking ? (
                <>
                  <ClockIcon size="sm" style={{ marginRight: '6px' }} />
                  Booking...
                </>
              ) : (
                'Continue to Payment →'
              )}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};
