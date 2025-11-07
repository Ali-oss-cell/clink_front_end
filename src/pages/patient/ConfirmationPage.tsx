import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '../../components/common/Layout/Layout';
import { authService } from '../../services/api/auth';
import styles from './Confirmation.module.scss';

export const ConfirmationPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedService = searchParams.get('service');
  const selectedPsychologist = searchParams.get('psychologist');
  const selectedDate = searchParams.get('date');
  const selectedTime = searchParams.get('time');
  const selectedSessionType = searchParams.get('sessionType');
  const amount = searchParams.get('amount');
  const paymentMethod = searchParams.get('paymentMethod');
  
  const [isLoading, setIsLoading] = useState(false);
  
  // Get user from auth service
  const user = authService.getStoredUser();

  // TODO: Fetch appointment details from Django backend
  // TODO: Generate unique booking reference from backend
  // TODO: Send confirmation email to user
  // TODO: Send WhatsApp notification to user
  // TODO: Notify psychologist of confirmed appointment
  // TODO: Add appointment to user's calendar
  // TODO: Store appointment in user's appointment history

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const generateBookingReference = () => {
    const timestamp = Date.now().toString().slice(-6);
    return `APT-2025-${timestamp}`;
  };

  const bookingReference = generateBookingReference();

  const handleAddToCalendar = () => {
    // TODO: Implement calendar integration with Google Calendar, Outlook, etc.
    // TODO: Generate .ics file for calendar import
    // TODO: Add appointment to user's calendar via API
    // TODO: Send calendar invite to user's email
    console.log('Add to calendar functionality');
    alert('Calendar integration will be implemented with your backend');
  };

  const handleEmailReceipt = () => {
    // TODO: Implement email receipt functionality
    // TODO: Generate PDF receipt from backend
    // TODO: Send receipt via email to user
    // TODO: Store receipt in user's account
    console.log('Email receipt functionality');
    alert('Email receipt will be sent via your backend');
  };

  const handleContactClinic = () => {
    // TODO: Implement contact clinic functionality
    // TODO: Open contact form or phone dialer
    // TODO: Send message to clinic via backend
    // TODO: Log contact request for follow-up
    console.log('Contact clinic functionality');
    alert('Contact clinic functionality will be implemented');
  };

  const handleBookAnother = () => {
    navigate('/appointments/book-appointment');
  };

  const handleReturnToDashboard = () => {
    navigate('/patient/dashboard');
  };

  return (
    <Layout 
      user={user} 
      isAuthenticated={true}
      className={styles.patientLayout}
    >
      <div className={styles.confirmationContainer}>
        <div className="container">
          <div className={styles.successMessage}>
            <div className={styles.successIcon}>🎉</div>
            <h1 className={styles.successTitle}>Appointment Confirmed!</h1>
            <p className={styles.successSubtitle}>
              Your appointment has been successfully booked and paid for. You will receive confirmation via email and WhatsApp.
            </p>
          </div>

          <div className={styles.bookingDetails}>
            <div className={styles.detailsCard}>
              <h3>📅 Your Appointment Details</h3>
              <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Booking Reference:</span>
                  <span className={styles.detailValue}>{bookingReference}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Service:</span>
                  <span className={styles.detailValue}>{getServiceName(selectedService || '')}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Psychologist:</span>
                  <span className={styles.detailValue}>{getPsychologistName(selectedPsychologist || '')}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Date & Time:</span>
                  <span className={styles.detailValue}>
                    {formatDate(selectedDate || '')} at {selectedTime}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Duration:</span>
                  <span className={styles.detailValue}>
                    {selectedService === 'individual-therapy' ? '50 minutes' : 
                     selectedService === 'couples-therapy' ? '60 minutes' : 
                     selectedService === 'psychological-assessment' ? '90 minutes' : '50 minutes'}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Session Type:</span>
                  <span className={styles.detailValue}>
                    {selectedSessionType === 'in-person' ? '🏢 In-Person Session' : '🎥 Telehealth (Video Call)'}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Amount Paid:</span>
                  <span className={styles.detailValue}>${amount}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Payment Method:</span>
                  <span className={styles.detailValue}>
                    {paymentMethod === 'card' ? '💳 Credit/Debit Card' :
                     paymentMethod === 'phone' ? '📞 Phone Payment' :
                     paymentMethod === 'in-person' ? '🏢 In-Person Payment' : 'Card'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.nextSteps}>
            <h3>📱 What Happens Next</h3>
            <div className={styles.stepsGrid}>
              <div className={styles.stepCard}>
                <div className={styles.stepIcon}>📧</div>
                <div className={styles.stepContent}>
                  <h4>Email Confirmation</h4>
                  <p>✓ Sent to: {user?.email || 'your email'}</p>
                  <p>✓ Includes calendar invite and session preparation tips</p>
                </div>
              </div>

              <div className={styles.stepCard}>
                <div className={styles.stepIcon}>📱</div>
                <div className={styles.stepContent}>
                  <h4>WhatsApp Reminder</h4>
                  <p>✓ 24 hours before: Appointment reminder</p>
                  <p>✓ 1 hour before: Video call link and instructions</p>
                </div>
              </div>

              <div className={styles.stepCard}>
                <div className={styles.stepIcon}>🎥</div>
                <div className={styles.stepContent}>
                  <h4>Video Session Access</h4>
                  <p>✓ Link will be sent 1 hour before your appointment</p>
                  <p>✓ Test your camera and microphone beforehand</p>
                  <p>✓ Ensure you're in a private, quiet space</p>
                </div>
              </div>

              <div className={styles.stepCard}>
                <div className={styles.stepIcon}>📋</div>
                <div className={styles.stepContent}>
                  <h4>Session Preparation</h4>
                  <p>✓ Review your intake form responses</p>
                  <p>✓ Prepare any questions or topics you'd like to discuss</p>
                  <p>✓ Have a glass of water nearby</p>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.quickActions}>
            <h3>🔗 Quick Actions</h3>
            <div className={styles.actionButtons}>
              <button 
                className={styles.actionButton}
                onClick={handleAddToCalendar}
              >
                📅 Add to Calendar
              </button>
              <button 
                className={styles.actionButton}
                onClick={handleEmailReceipt}
              >
                📧 Email Receipt
              </button>
              <button 
                className={styles.actionButton}
                onClick={handleContactClinic}
              >
                📱 Contact Clinic
              </button>
            </div>
          </div>

          <div className={styles.navigationActions}>
            <button 
              className={styles.navButton}
              onClick={handleReturnToDashboard}
            >
              🏠 Return to Dashboard
            </button>
            <button 
              className={styles.navButton}
              onClick={handleBookAnother}
            >
              📅 Book Another Appointment
            </button>
          </div>

          <div className={styles.emergencyInfo}>
            <div className={styles.emergencyBox}>
              <div className={styles.emergencyIcon}>⚠️</div>
              <div className={styles.emergencyContent}>
                <h4>Important Reminder</h4>
                <p>If you need to reschedule or cancel your appointment, please contact us at least 48 hours in advance.</p>
                <p><strong>Emergency Contact:</strong> (03) 9xxx-xxxx</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
