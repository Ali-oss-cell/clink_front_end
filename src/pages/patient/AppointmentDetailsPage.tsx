import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Layout } from '../../components/common/Layout/Layout';
import { authService } from '../../services/api/auth';
import { appointmentsService } from '../../services/api/appointments';
import type { BookingSummaryResponse } from '../../services/api/appointments';
import { extractApiErrorMessage } from '../../utils/apiError';
import { formatSessionDurationMinutes } from '../../utils/formatSessionDuration';
import { WarningIcon, CalendarIcon, BuildingIcon, VideoIcon } from '../../utils/icons';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { cn } from '../../lib/cn';
import styles from './AppointmentDetails.module.scss';
import patientPageStyles from './PatientPages.module.scss';
import { BookingFlowProgress } from '../../components/patient/BookingFlowProgress/BookingFlowProgress';
import { BookingFlowTrustPanel } from '../../components/patient/BookingFlowTrustPanel/BookingFlowTrustPanel';

interface AppointmentDetailsFormData {
  therapyFocus: string;
  specialRequests: string;
  additionalNotes: string;
}

export const AppointmentDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get('appointment_id');
  const selectedService = searchParams.get('service');
  const selectedPsychologist = searchParams.get('psychologist');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState<BookingSummaryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Get user from auth service
  const user = authService.getStoredUser();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<AppointmentDetailsFormData>({
    defaultValues: {
      therapyFocus: '',
      additionalNotes: '',
      specialRequests: ''
    }
  });

  // Fetch booking data from API
  useEffect(() => {
    if (!appointmentId) {
      setError('No appointment ID provided');
      setLoading(false);
      return;
    }

    const fetchBookingData = async () => {
      try {
        setLoading(true);
        const data = await appointmentsService.getBookingSummary(parseInt(appointmentId));
        setBookingData(data);
      } catch (err: unknown) {
        console.error('Failed to load booking data:', err);
        setError(extractApiErrorMessage(err, 'Failed to load appointment details'));
      } finally {
        setLoading(false);
      }
    };

    fetchBookingData();
  }, [appointmentId]);

  const onSubmit = async (data: AppointmentDetailsFormData) => {
    if (!appointmentId) return;
    
    setIsSubmitting(true);
    try {
      await appointmentsService.updateAppointmentDetails(parseInt(appointmentId), {
        therapy_focus: data.therapyFocus?.trim() || '',
        special_requests: data.specialRequests?.trim() || '',
        additional_notes: data.additionalNotes?.trim() || '',
      });
      const params = new URLSearchParams();
      params.set('step', '5');
      params.set('appointment_id', appointmentId);
      if (selectedService) params.set('service', selectedService);
      if (selectedPsychologist) params.set('psychologist', selectedPsychologist);
      navigate(`/appointments/book-appointment?${params.toString()}`);
    } catch (error: unknown) {
      console.error('Error submitting appointment details:', error);
      alert(extractApiErrorMessage(error, 'Failed to save details. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (bookingData) {
      navigate(
        `/appointments/book-appointment?step=3&service=${bookingData.service.id}&psychologist=${bookingData.psychologist.id}`
      );
      return;
    }
    navigate('/appointments/book-appointment?step=1');
  };

  if (loading) {
    return (
      <Layout user={user} isAuthenticated={true} patientShell className={patientPageStyles.patientLayout}>
        <div
          className={`${styles.appointmentDetailsContainer} ${patientPageStyles.bookingFlowLayout}`}
          data-patient-booking-viewport=""
        >
          <div className="container">
            <BookingFlowProgress currentStep={4} />
            <div className={styles.loadingState}>
              <p>Loading appointment details...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !bookingData) {
    return (
      <Layout user={user} isAuthenticated={true} patientShell className={patientPageStyles.patientLayout}>
        <div
          className={`${styles.appointmentDetailsContainer} ${patientPageStyles.bookingFlowLayout}`}
          data-patient-booking-viewport=""
        >
          <div className="container">
            <BookingFlowProgress currentStep={4} />
            <div className={styles.errorState}>
              <h3 className={styles.errorStateTitle}>
                <span className={styles.errorStateIconWrap} aria-hidden>
                  <WarningIcon size="md" />
                </span>
                Unable to Load Appointment
              </h3>
              <p>{error || 'Appointment not found'}</p>
              <Button className={styles.retryButton} onClick={() => navigate('/appointments/book-appointment?step=1')}>
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout 
      user={user} 
      isAuthenticated={true}
      patientShell
      className={patientPageStyles.patientLayout}
    >
      <div
        className={`${styles.appointmentDetailsContainer} ${patientPageStyles.bookingFlowLayout}`}
        data-patient-booking-viewport=""
      >
        <div className="container">
          <BookingFlowProgress currentStep={4} />
          <div className={`${styles.pageHeader} ${styles.pageHeaderWithInsetTrust}`}>
            <span className={patientPageStyles.bookingFlowKicker}>Book a session · Step 4 of 5</span>
            <Button className={styles.backButton} onClick={handleBack}>
              ← Back
            </Button>
            <h1 className={styles.pageTitle}>Review Your Appointment</h1>
            <p className={styles.pageSubtitle}>
              Please review your appointment details before proceeding to payment
            </p>
            <BookingFlowTrustPanel
              variant="details"
              wide
              className={patientPageStyles.bookingFlowHeaderTrustPanel}
            />
          </div>

          <div className={styles.appointmentSummary}>
            <div className={styles.summaryCard}>
              <h3 className={styles.summaryHeading}>
                <span className={styles.summaryHeadingIcon} aria-hidden>
                  <CalendarIcon size="md" />
                </span>
                Appointment Summary
              </h3>
              <div className={styles.summaryGrid}>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Psychologist:</span>
                  <span className={styles.summaryValue}>{bookingData.psychologist.name}</span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Qualifications:</span>
                  <span className={styles.summaryValue}>{bookingData.psychologist.qualifications}</span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>AHPRA Number:</span>
                  <span className={styles.summaryValue}>{bookingData.psychologist.ahpra_number}</span>
                </div>
              </div>

              <div className={styles.summaryGrid}>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Service:</span>
                  <span className={styles.summaryValue}>{bookingData.service.name}</span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Duration:</span>
                  <span className={styles.summaryValue}>
                    {formatSessionDurationMinutes(bookingData.service.duration_minutes)}
                  </span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Date:</span>
                  <span className={styles.summaryValue}>{bookingData.session.formatted_date}</span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Time:</span>
                  <span className={styles.summaryValue}>{bookingData.session.formatted_time}</span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Session Type:</span>
                  <span className={styles.summaryValue}>
                    {bookingData.session.type === 'in_person' ? (
                      <>
                        <BuildingIcon size="sm" style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                        In-Person Session
                      </>
                    ) : (
                      <>
                        <VideoIcon size="sm" style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                        Telehealth (Video Call)
                      </>
                    )}
                  </span>
                </div>
              </div>
              
              <div className={styles.pricingSection}>
                <div className={styles.pricingRow}>
                  <span>Standard Fee:</span>
                  <span>${bookingData.pricing.consultation_fee}</span>
                </div>
                {parseFloat(bookingData.pricing.medicare_rebate) > 0 && (
                  <div className={styles.pricingRow}>
                    <span>Medicare Rebate:</span>
                    <span className={styles.rebateAmount}>-${bookingData.pricing.medicare_rebate}</span>
                  </div>
                )}
                <div className={`${styles.pricingRow} ${styles.totalCost}`}>
                  <span>Your Payment:</span>
                  <span>${bookingData.pricing.out_of_pocket_cost} (inc. GST)</span>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className={styles.appointmentDetailsForm}>
            <div className={styles.formSection}>
              <h3 className={styles.sectionTitle}>Session notes <span className={styles.sectionTitleMeta}>(optional)</span></h3>
              <p className={styles.sectionDescription}>
                Share anything that helps your psychologist prepare. You can skip this entirely or talk it through in the session.
              </p>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <Label className={styles.label} htmlFor="therapy-focus">
                    Focus for this session
                  </Label>
                  <Textarea
                    id="therapy-focus"
                    {...register('therapyFocus')}
                    className={cn('tp-ui-textarea', styles.textarea)}
                    placeholder="e.g. Work stress, sleep, a recent life change — whatever feels most important today."
                    rows={4}
                  />
                  <p className={styles.fieldHelp}>Optional. A few words is enough.</p>
                </div>

                <div className={styles.formGroup}>
                  <Label className={styles.label} htmlFor="special-requests">
                    Access or communication preferences
                  </Label>
                  <Textarea
                    id="special-requests"
                    {...register('specialRequests')}
                    className={cn('tp-ui-textarea', styles.textarea)}
                    placeholder="e.g. captions, slower pace, written materials, or anything that makes the session easier for you."
                    rows={3}
                  />
                </div>

                <div className={styles.formGroup}>
                  <Label className={styles.label} htmlFor="additional-notes">
                    Anything else to know
                  </Label>
                  <Textarea
                    id="additional-notes"
                    {...register('additionalNotes')}
                    className={cn('tp-ui-textarea', styles.textarea)}
                    placeholder="Optional context — only if there is something else you want them to see beforehand."
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <div className={styles.emergencyReminder}>
              <div className={styles.emergencyBox}>
                <div className={styles.emergencyIcon}><WarningIcon size="xl" /></div>
                <div className={styles.emergencyContent}>
                  <h4>Important Reminder:</h4>
                  <p>If you're experiencing a mental health emergency, please:</p>
                  <ul>
                    <li>Call 000 (Emergency Services)</li>
                    <li>Call Lifeline: 13 11 14</li>
                    <li>Visit your nearest hospital emergency department</li>
                  </ul>
                  <p><strong>This booking system is not monitored 24/7.</strong></p>
                </div>
              </div>
            </div>

            <div className={`${styles.formActions} ${styles.formActionsSticky}`}>
              <Button
                type="button"
                variant="outline"
                className={styles.cancelButton}
                onClick={handleBack}
                disabled={isSubmitting}
              >
                ← Back
              </Button>
              <Button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                {isSubmitting ? 'Processing...' : 'Continue to Payment →'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};
