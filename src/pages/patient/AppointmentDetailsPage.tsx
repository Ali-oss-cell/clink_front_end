import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Layout } from '../../components/common/Layout/Layout';
import styles from './AppointmentDetails.module.scss';

interface AppointmentDetailsFormData {
  isFirstTime: string;
  therapyFocus: string;
  preferredContactMethod: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
  additionalNotes: string;
  specialRequests: string;
}

export const AppointmentDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedService = searchParams.get('service');
  const selectedPsychologist = searchParams.get('psychologist');
  const selectedDate = searchParams.get('date');
  const selectedTime = searchParams.get('time');
  const selectedSessionType = searchParams.get('sessionType');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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

  // TODO: Fetch user's existing appointment history from backend
  // TODO: Implement form validation with backend
  // TODO: Add emergency contact validation
  // TODO: Store appointment details in Redux store
  // TODO: Implement form auto-save functionality

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<AppointmentDetailsFormData>({
    defaultValues: {
      isFirstTime: '',
      therapyFocus: '',
      preferredContactMethod: 'whatsapp',
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactRelationship: '',
      additionalNotes: '',
      specialRequests: ''
    }
  });

  const watchedIsFirstTime = watch('isFirstTime');

  // Mock data for demonstration
  const getPsychologistName = (id: string) => {
    const names: { [key: string]: string } = {
      'dr-sarah-johnson': 'Dr. Sarah Johnson',
      'dr-michael-chen': 'Dr. Michael Chen',
      'dr-emma-wilson': 'Dr. Emma Wilson',
      'dr-james-martinez': 'Dr. James Martinez'
    };
    return names[id] || 'Selected Psychologist';
  };

  const getServiceName = (id: string) => {
    const services: { [key: string]: string } = {
      'individual-therapy': 'Individual Therapy Session (50 min)',
      'couples-therapy': 'Couples Therapy Session (60 min)',
      'psychological-assessment': 'Psychological Assessment (90 min)'
    };
    return services[id] || 'Selected Service';
  };

  const getServicePrice = (id: string) => {
    const prices: { [key: string]: { standard: number; rebate: number; final: number } } = {
      'individual-therapy': { standard: 180.00, rebate: 87.45, final: 92.55 },
      'couples-therapy': { standard: 220.00, rebate: 0, final: 220.00 },
      'psychological-assessment': { standard: 280.00, rebate: 126.55, final: 153.45 }
    };
    return prices[id] || { standard: 0, rebate: 0, final: 0 };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  const onSubmit = async (data: AppointmentDetailsFormData) => {
    setIsSubmitting(true);
    try {
      // TODO: Submit appointment details to Django backend API
      // TODO: Validate all form data with backend
      // TODO: Check for duplicate appointments
      // TODO: Store appointment details in database
      // TODO: Send confirmation email to user
      // TODO: Notify psychologist of new appointment
      // TODO: Log appointment creation for analytics
      
      console.log('Appointment details:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate to payment page
      const params = new URLSearchParams({
        service: selectedService || '',
        psychologist: selectedPsychologist || '',
        date: selectedDate || '',
        time: selectedTime || '',
        sessionType: selectedSessionType || '',
        ...data
      });
      
      navigate(`/appointments/payment?${params.toString()}`);
    } catch (error) {
      console.error('Error submitting appointment details:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    const params = new URLSearchParams({
      service: selectedService || '',
      psychologist: selectedPsychologist || ''
    });
    navigate(`/appointments/date-time?${params.toString()}`);
  };

  const servicePrice = getServicePrice(selectedService || '');

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
              ← Back to Date & Time
            </button>
            <h1 className={styles.pageTitle}>Appointment Details</h1>
            <p className={styles.pageSubtitle}>
              Please provide additional information to help us prepare for your appointment
            </p>
          </div>

          <div className={styles.appointmentSummary}>
            <div className={styles.summaryCard}>
              <h3>📅 Appointment Summary</h3>
              <div className={styles.summaryGrid}>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Service:</span>
                  <span className={styles.summaryValue}>{getServiceName(selectedService || '')}</span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Psychologist:</span>
                  <span className={styles.summaryValue}>{getPsychologistName(selectedPsychologist || '')}</span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Date & Time:</span>
                  <span className={styles.summaryValue}>
                    {formatDate(selectedDate || '')} at {formatTime(selectedTime || '')}
                  </span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Session Type:</span>
                  <span className={styles.summaryValue}>
                    {selectedSessionType === 'in-person' ? '🏢 In-Person Session' : '🎥 Telehealth (Video Call)'}
                  </span>
                </div>
              </div>
              
              <div className={styles.pricingSection}>
                <div className={styles.pricingRow}>
                  <span>Standard Fee:</span>
                  <span>${servicePrice.standard.toFixed(2)}</span>
                </div>
                {servicePrice.rebate > 0 && (
                  <div className={styles.pricingRow}>
                    <span>Medicare Rebate:</span>
                    <span className={styles.rebateAmount}>-${servicePrice.rebate.toFixed(2)}</span>
                  </div>
                )}
                <div className={`${styles.pricingRow} ${styles.totalCost}`}>
                  <span>Your Payment:</span>
                  <span>${servicePrice.final.toFixed(2)} (inc. GST)</span>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className={styles.appointmentDetailsForm}>
            <div className={styles.formSection}>
              <h3 className={styles.sectionTitle}>Additional Information</h3>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Is this your first time seeing a psychologist? *</label>
                  <div className={styles.radioGroup}>
                    <label className={styles.radioWrapper}>
                      <input
                        {...register('isFirstTime', { required: 'Please select an option' })}
                        type="radio"
                        value="first-session-ever"
                        className={styles.radioInput}
                      />
                      <div className={styles.radioCustom}>
                        <div className={styles.radioDot}></div>
                      </div>
                      Yes, this is my first session ever
                    </label>
                    <label className={styles.radioWrapper}>
                      <input
                        {...register('isFirstTime', { required: 'Please select an option' })}
                        type="radio"
                        value="had-therapy-before"
                        className={styles.radioInput}
                      />
                      <div className={styles.radioCustom}>
                        <div className={styles.radioDot}></div>
                      </div>
                      No, I've had therapy before
                    </label>
                    <label className={styles.radioWrapper}>
                      <input
                        {...register('isFirstTime', { required: 'Please select an option' })}
                        type="radio"
                        value="seen-other-psychologists"
                        className={styles.radioInput}
                      />
                      <div className={styles.radioCustom}>
                        <div className={styles.radioDot}></div>
                      </div>
                      Yes, but I've seen other psychologists
                    </label>
                  </div>
                  {errors.isFirstTime && <span className={styles.fieldError}>{errors.isFirstTime.message}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>What would you like to focus on in this session? *</label>
                  <textarea
                    {...register('therapyFocus', { required: 'Please describe what you\'d like to focus on' })}
                    className={styles.textarea}
                    placeholder="I've been experiencing anxiety about work and would like to learn some coping strategies. I also have trouble sleeping and would like to discuss this."
                    rows={4}
                  />
                  <div className={styles.fieldHelp}>
                    (Optional - helps your psychologist prepare)
                  </div>
                  {errors.therapyFocus && <span className={styles.fieldError}>{errors.therapyFocus.message}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Preferred Contact Method for Reminders:</label>
                  <div className={styles.radioGroup}>
                    <label className={styles.radioWrapper}>
                      <input
                        {...register('preferredContactMethod')}
                        type="radio"
                        value="whatsapp"
                        className={styles.radioInput}
                      />
                      <div className={styles.radioCustom}>
                        <div className={styles.radioDot}></div>
                      </div>
                      📱 WhatsApp messages
                    </label>
                    <label className={styles.radioWrapper}>
                      <input
                        {...register('preferredContactMethod')}
                        type="radio"
                        value="email"
                        className={styles.radioInput}
                      />
                      <div className={styles.radioCustom}>
                        <div className={styles.radioDot}></div>
                      </div>
                      📧 Email only
                    </label>
                    <label className={styles.radioWrapper}>
                      <input
                        {...register('preferredContactMethod')}
                        type="radio"
                        value="sms"
                        className={styles.radioInput}
                      />
                      <div className={styles.radioCustom}>
                        <div className={styles.radioDot}></div>
                      </div>
                      📱 SMS text
                    </label>
                    <label className={styles.radioWrapper}>
                      <input
                        {...register('preferredContactMethod')}
                        type="radio"
                        value="phone"
                        className={styles.radioInput}
                      />
                      <div className={styles.radioCustom}>
                        <div className={styles.radioDot}></div>
                      </div>
                      📞 Phone call
                    </label>
                    <label className={styles.radioWrapper}>
                      <input
                        {...register('preferredContactMethod')}
                        type="radio"
                        value="none"
                        className={styles.radioInput}
                      />
                      <div className={styles.radioCustom}>
                        <div className={styles.radioDot}></div>
                      </div>
                      🚫 No reminders
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.formSection}>
              <h3 className={styles.sectionTitle}>Emergency Contact Information</h3>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Emergency Contact Name</label>
                  <input
                    {...register('emergencyContactName')}
                    type="text"
                    className={styles.input}
                    placeholder="Full name of emergency contact"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Emergency Contact Phone</label>
                  <input
                    {...register('emergencyContactPhone')}
                    type="tel"
                    className={styles.input}
                    placeholder="Phone number"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Relationship to You</label>
                  <input
                    {...register('emergencyContactRelationship')}
                    type="text"
                    className={styles.input}
                    placeholder="e.g., Spouse, Parent, Sibling, Friend"
                  />
                </div>
              </div>
            </div>

            <div className={styles.formSection}>
              <h3 className={styles.sectionTitle}>Additional Notes</h3>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Special Requests or Accommodations</label>
                  <textarea
                    {...register('specialRequests')}
                    className={styles.textarea}
                    placeholder="Any special requests, accessibility needs, or accommodations you may require"
                    rows={3}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Additional Information</label>
                  <textarea
                    {...register('additionalNotes')}
                    className={styles.textarea}
                    placeholder="Any other information that might be helpful for your psychologist to know"
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
                Back to Date & Time
              </button>
              <button
                type="submit"
                className={styles.submitButton}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : 'Continue to Payment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};
