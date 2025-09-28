import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Layout } from '../../components/common/Layout/Layout';
import styles from './PatientPages.module.scss';

interface AppointmentFormData {
  appointmentType: string;
  preferredDate: string;
  preferredTime: string;
  urgency: string;
  reason: string;
  notes: string;
}

export const PatientAppointmentPage: React.FC = () => {
  const navigate = useNavigate();
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

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<AppointmentFormData>();

  const onSubmit = async (data: AppointmentFormData) => {
    setIsSubmitting(true);
    try {
      // TODO: Submit appointment request to API
      console.log('Appointment request:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate back to dashboard with success message
      navigate('/patient/dashboard?appointment=requested');
    } catch (error) {
      console.error('Error submitting appointment request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/patient/dashboard');
  };

  return (
    <Layout 
      user={mockUser} 
      isAuthenticated={true}
      className={styles.patientLayout}
    >
      <div className={styles.appointmentContainer}>
        <div className="container">
          <div className={styles.pageHeader}>
            <button 
              className={styles.backButton}
              onClick={handleCancel}
            >
              ← Back to Dashboard
            </button>
            <h1 className={styles.pageTitle}>Book New Appointment</h1>
            <p className={styles.pageSubtitle}>
              Request an appointment with your psychologist
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className={styles.appointmentForm}>
            <div className={styles.formSection}>
              <h3 className={styles.sectionTitle}>Appointment Details</h3>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Appointment Type *</label>
                  <select
                    {...register('appointmentType', { required: 'Please select an appointment type' })}
                    className={styles.select}
                  >
                    <option value="">Select appointment type</option>
                    <option value="initial">Initial Consultation</option>
                    <option value="follow-up">Follow-up Session</option>
                    <option value="urgent">Urgent Consultation</option>
                    <option value="assessment">Assessment Session</option>
                  </select>
                  {errors.appointmentType && <span className={styles.fieldError}>{errors.appointmentType.message}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Preferred Date *</label>
                  <input
                    {...register('preferredDate', { required: 'Please select a preferred date' })}
                    type="date"
                    className={styles.input}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  {errors.preferredDate && <span className={styles.fieldError}>{errors.preferredDate.message}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Preferred Time *</label>
                  <select
                    {...register('preferredTime', { required: 'Please select a preferred time' })}
                    className={styles.select}
                  >
                    <option value="">Select preferred time</option>
                    <option value="morning">Morning (9:00 AM - 12:00 PM)</option>
                    <option value="afternoon">Afternoon (12:00 PM - 5:00 PM)</option>
                    <option value="evening">Evening (5:00 PM - 8:00 PM)</option>
                    <option value="flexible">Flexible</option>
                  </select>
                  {errors.preferredTime && <span className={styles.fieldError}>{errors.preferredTime.message}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Urgency Level *</label>
                  <select
                    {...register('urgency', { required: 'Please select urgency level' })}
                    className={styles.select}
                  >
                    <option value="">Select urgency level</option>
                    <option value="low">Low - Can wait 1-2 weeks</option>
                    <option value="medium">Medium - Within 1 week</option>
                    <option value="high">High - Within 2-3 days</option>
                    <option value="urgent">Urgent - Same day or next day</option>
                  </select>
                  {errors.urgency && <span className={styles.fieldError}>{errors.urgency.message}</span>}
                </div>
              </div>
            </div>

            <div className={styles.formSection}>
              <h3 className={styles.sectionTitle}>Additional Information</h3>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Reason for Appointment *</label>
                  <textarea
                    {...register('reason', { required: 'Please provide a reason for the appointment' })}
                    className={styles.textarea}
                    placeholder="Please describe what you'd like to discuss or work on during this appointment"
                    rows={4}
                  />
                  {errors.reason && <span className={styles.fieldError}>{errors.reason.message}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Additional Notes</label>
                  <textarea
                    {...register('notes')}
                    className={styles.textarea}
                    placeholder="Any additional information that might be helpful for your psychologist"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={styles.submitButton}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting Request...' : 'Submit Appointment Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};
