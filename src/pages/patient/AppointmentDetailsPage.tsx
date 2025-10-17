import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Layout } from '../../components/common/Layout/Layout';
import { appointmentsService } from '../../services/api/appointments';
import type { BookingSummaryResponse } from '../../services/api/appointments';
import styles from './AppointmentDetails.module.scss';

interface AppointmentDetailsFormData {
  therapyFocus: string;
  specialRequests: string;
  additionalNotes: string;
}

export const AppointmentDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get('appointment_id');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState<BookingSummaryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // TODO: Get user data from Redux store
  const mockUser = {
    id: 1,
    first_name: 'John',
    full_name: 'John Smith',
    role: 'patient' as const,
    email: 'john@example.com',
    last_name: 'Smith',
    is_verified: true,
    created_at: '2024-01-01'
  };

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
      } catch (err) {
        console.error('Failed to load booking data:', err);
        setError('Failed to load appointment details');
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
      // TODO: Update appointment with additional notes via API
      // For now, just navigate to payment with the appointment ID
      navigate(`/appointments/payment?appointment_id=${appointmentId}`);
    } catch (error) {
      console.error('Error submitting appointment details:', error);
      alert('Failed to save details. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  if (loading) {
    return (
      <Layout user={mockUser} isAuthenticated={true} className={styles.patientLayout}>
        <div className={styles.appointmentDetailsContainer}>
          <div className="container">
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
      <Layout user={mockUser} isAuthenticated={true} className={styles.patientLayout}>
        <div className={styles.appointmentDetailsContainer}>
          <div className="container">
            <div className={styles.errorState}>
              <h3>⚠️ Unable to Load Appointment</h3>
              <p>{error || 'Appointment not found'}</p>
              <button className={styles.retryButton} onClick={() => navigate('/appointments/date-time')}>
                Go Back
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout 
      user={mockUser} 
      isAuthenticated={true}
      className={styles.patientLayout}
    >
      <div className={styles.appointmentDetailsContainer}>
        <div className="container">
          <div className={styles.pageHeader}>
            <button 
              className={styles.backButton}
              onClick={handleBack}
            >
              ← Back
            </button>
            <h1 className={styles.pageTitle}>Review Your Appointment</h1>
            <p className={styles.pageSubtitle}>
              Please review your appointment details before proceeding to payment
            </p>
          </div>

          <div className={styles.appointmentSummary}>
            <div className={styles.summaryCard}>
              <h3>📅 Appointment Summary</h3>
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
                  <span className={styles.summaryValue}>{bookingData.service.duration_minutes} minutes</span>
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
                    {bookingData.session.type === 'in_person' ? '🏢 In-Person Session' : '🎥 Telehealth (Video Call)'}
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
              <h3 className={styles.sectionTitle}>Session Notes (Optional)</h3>
              <p className={styles.sectionDescription}>
                You can provide additional information to help your psychologist prepare for this session. 
                This is optional and can also be discussed during your appointment.
              </p>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>What would you like to focus on in this session?</label>
                  <textarea
                    {...register('therapyFocus')}
                    className={styles.textarea}
                    placeholder="Example: I've been experiencing anxiety about work and would like to learn some coping strategies..."
                    rows={4}
                  />
                  <div className={styles.fieldHelp}>
                    This helps your psychologist prepare but is completely optional
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Special Requests or Accommodations</label>
                  <textarea
                    {...register('specialRequests')}
                    className={styles.textarea}
                    placeholder="Any accessibility needs, preferred communication style, or other accommodations..."
                    rows={3}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Additional Notes</label>
                  <textarea
                    {...register('additionalNotes')}
                    className={styles.textarea}
                    placeholder="Any other information that might be helpful..."
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <div className={styles.emergencyReminder}>
              <div className={styles.emergencyBox}>
                <div className={styles.emergencyIcon}>⚠️</div>
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

            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={handleBack}
                disabled={isSubmitting}
              >
                ← Back
              </button>
              <button
                type="submit"
                className={styles.submitButton}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : 'Continue to Payment →'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};
