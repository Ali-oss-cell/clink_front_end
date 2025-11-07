import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '../../components/common/Layout/Layout';
import { authService } from '../../services/api/auth';
import { appointmentsService } from '../../services/api/appointments';
import { servicesService } from '../../services/api/services';
import type { AvailableSlotsResponse, TimeSlot } from '../../services/api/appointments';
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

  // Convert service slug to ID on page load
  useEffect(() => {
    const loadServiceId = async () => {
      if (!selectedService || selectedService.trim() === '') {
        // Automatically redirect back to service selection
        navigate('/appointments/book-appointment');
        return;
      }
      
      try {
        // Check if it's already a number
        const numericId = parseInt(selectedService);
        if (!isNaN(numericId)) {
          setServiceId(numericId);
        } else {
          // It's a slug, convert it to ID
          const id = await servicesService.getServiceIdFromSlug(selectedService);
          
          if (id) {
            setServiceId(id);
          } else {
            // Service not found, redirect back
            navigate('/appointments/book-appointment');
          }
        }
      } catch (err) {
        // Error loading service, redirect back
        navigate('/appointments/book-appointment');
      }
    };
    
    loadServiceId();
  }, [selectedService, navigate]);

  // Fetch available slots on page load
  useEffect(() => {
    if (!selectedPsychologist) {
      // Automatically redirect back to psychologist selection
      if (selectedService) {
        navigate(`/appointments/psychologist-selection?service=${selectedService}`);
      }
      return;
    }

    if (!serviceId) {
      return;
    }

    fetchAvailableSlots();
  }, [selectedPsychologist, sessionType, serviceId, selectedService, navigate]);

  const fetchAvailableSlots = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const psychologistId = parseInt(selectedPsychologist || '0');
      if (!psychologistId) {
        throw new Error('Invalid psychologist ID');
      }

      const today = new Date();
      const startDate = today.toISOString().split('T')[0];
      
      const endDate = new Date();
      endDate.setDate(today.getDate() + 30); // Next 30 days
      const endDateStr = endDate.toISOString().split('T')[0];
      
      const data = await appointmentsService.getAvailableSlots({
        psychologistId,
        startDate,
        endDate: endDateStr,
        serviceId: serviceId || undefined,
        sessionType
      });
      setAvailabilityData(data);
      
      // Auto-select first available date
      if (data.available_dates.length > 0) {
        setSelectedDate(data.available_dates[0].date);
      }
    } catch (err) {
      console.error('Failed to load available slots:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load available time slots.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

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

  if (error || !availabilityData) {
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
              <h3>⚠️ Unable to Load Available Slots</h3>
              <p>{error}</p>
              <button className={styles.retryButton} onClick={fetchAvailableSlots}>
                🔄 Retry
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
              <h3>📋 Booking Summary</h3>
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
                  <strong>${availabilityData.patient_cost_after_rebate.toFixed(2)}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Session Type Selection */}
          <div className={styles.sessionTypeSection}>
            <h2 className={styles.sessionTypeTitle}>📹 Session Type</h2>
            <div className={styles.sessionTypeOptions}>
              <div 
                className={`${styles.sessionTypeCard} ${sessionType === 'telehealth' ? styles.selected : ''} ${!availabilityData.telehealth_available ? styles.disabled : ''}`}
                onClick={() => availabilityData.telehealth_available && setSessionType('telehealth')}
              >
                <div className={styles.sessionTypeIcon}>🎥</div>
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
                <div className={styles.sessionTypeIcon}>🏥</div>
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
                <h2 className={styles.calendarTitle}>📅 Select a Date</h2>
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
                    ⏰ Available Times - {formatDate(selectedDate)}
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
              <h3>😔 No Available Appointments</h3>
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
              {booking ? '⏳ Booking...' : 'Continue to Payment →'}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};
