import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '../../components/common/Layout/Layout';
import { authService } from '../../services/api/auth';
import { appointmentsService, type AppointmentConfirmationResponse } from '../../services/api/appointments';
import { paymentsService } from '../../services/api/payments';
import { extractApiErrorMessage } from '../../utils/apiError';
import { formatSessionDurationMinutes } from '../../utils/formatSessionDuration';
import {
  CalendarIcon,
  VideoIcon,
  BuildingIcon,
  CreditCardIcon,
  PhoneIcon,
  EmailIcon,
  MobileIcon,
  ClipboardIcon,
  HomeIcon,
  WarningIcon,
  LinkIcon
} from '../../utils/icons';
import { Button } from '../../components/ui/button';
import styles from './Confirmation.module.scss';
import bookingFlow from './PatientPages.module.scss';
import homeGuidedSupport from '../../assets/imges/optimized/home-guided-support.jpg';

const BOOKING_BILLING_PATH_KEY = 'booking_billing_path';

export const ConfirmationPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get('appointment_id');
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<AppointmentConfirmationResponse | null>(null);
  
  // Get user from auth service
  const user = authService.getStoredUser();

  useEffect(() => {
    if (!appointmentId) {
      setError('Missing appointment ID.');
      setIsLoading(false);
      return;
    }
    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const billingPath = (() => {
          const fromQuery = searchParams.get('billing_path');
          if (fromQuery === 'medicare' || fromQuery === 'private') return fromQuery;
          try {
            const fromStorage = sessionStorage.getItem(BOOKING_BILLING_PATH_KEY);
            if (fromStorage === 'medicare' || fromStorage === 'private') return fromStorage;
          } catch {
            /* ignore */
          }
          return undefined;
        })();
        const revalidation = await appointmentsService.revalidateBooking(parseInt(appointmentId, 10), billingPath);
        if (!revalidation.is_valid) {
          navigate(
            revalidation.actions.next ||
              revalidation.actions.wizard_medicare_referral ||
              '/appointments/book-appointment?billing_path=medicare&focus=referral'
          );
          return;
        }
        const data = await appointmentsService.getAppointmentConfirmation(parseInt(appointmentId));
        setConfirmation(data);
      } catch (err: unknown) {
        console.error('Failed to load confirmation:', err);
        setError(extractApiErrorMessage(err, 'Could not load your confirmation details.'));
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [appointmentId, navigate, searchParams]);

  const handleAddToCalendar = () => {
    alert('Calendar invite support will be available from backend notifications.');
  };

  const handleEmailReceipt = async () => {
    if (!appointmentId) return;
    try {
      const receipt = await paymentsService.getReceipt(parseInt(appointmentId));
      alert(`Receipt is available${receipt.receipt_id ? `: ${receipt.receipt_id}` : '.'}`);
    } catch (err: unknown) {
      console.error('Failed to load receipt:', err);
      alert(extractApiErrorMessage(err, 'Could not load receipt right now.'));
    }
  };

  const handleContactClinic = () => {
    navigate('/contact');
  };

  const handleBookAnother = () => {
    navigate('/appointments/book-appointment');
  };

  const handleReturnToDashboard = () => {
    navigate('/patient/dashboard');
  };

  if (isLoading) {
    return (
      <Layout user={user} isAuthenticated={true} patientShell className={styles.patientLayout}>
        <div className={styles.confirmationContainer}>
          <div className="container">
            <div className={styles.successMessage}>
              <p>Loading confirmation...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !confirmation) {
    return (
      <Layout user={user} isAuthenticated={true} patientShell className={styles.patientLayout}>
        <div className={styles.confirmationContainer}>
          <div className="container">
            <div className={styles.emergencyBox}>
              <h3>
                <WarningIcon size="md" style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                Unable to load confirmation
              </h3>
              <p>{error || 'Confirmation details are unavailable.'}</p>
              <Button className={styles.navButton} onClick={handleReturnToDashboard}>
                Return to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const isTelehealth = confirmation.session.type !== 'in_person';
  const amountPaid = confirmation.pricing.total_paid || confirmation.pricing.out_of_pocket_cost;

  return (
    <Layout 
      user={user} 
      isAuthenticated={true}
      patientShell
      className={styles.patientLayout}
    >
      <div
        className={`${styles.confirmationContainer} ${bookingFlow.bookingFlowLayout}`}
        data-patient-booking-viewport=""
      >
        <div className="container">
          <div className={bookingFlow.bookingFlowMain}>
          <div className={styles.successMessage}>
            <div className={styles.successIcon}>🎉</div>
            <h1 className={styles.successTitle}>Appointment Confirmed!</h1>
            <p className={styles.successSubtitle}>
              Your appointment has been successfully booked and paid for. You will receive confirmation via email and WhatsApp.
            </p>
          </div>

          <section className={styles.postPaymentWarmth} aria-label="What to expect before your first session">
            <div className={styles.postPaymentWarmthInner}>
              <div className={styles.postPaymentWarmthMedia}>
                <img
                  src={homeGuidedSupport}
                  alt=""
                  width={560}
                  height={420}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className={styles.postPaymentWarmthCopy}>
                <h2 className={styles.postPaymentWarmthTitle}>What the first session usually feels like</h2>
                <p className={styles.postPaymentWarmthBody}>
                  Most people are a little nervous—and that is normal. Your psychologist will explain how sessions work,
                  answer questions about privacy and goals, and move at a pace that feels safe. You do not need to have
                  everything figured out before you arrive.
                </p>
              </div>
            </div>
          </section>

          <div className={styles.bookingDetails}>
            <div className={styles.detailsCard}>
              <h3><CalendarIcon size="md" style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Your Appointment Details</h3>
              <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Booking Reference:</span>
                  <span className={styles.detailValue}>{confirmation.booking_reference}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Service:</span>
                  <span className={styles.detailValue}>{confirmation.service.name}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Psychologist:</span>
                  <span className={styles.detailValue}>{confirmation.psychologist.name}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Date & Time:</span>
                  <span className={styles.detailValue}>
                    {confirmation.session.formatted_date} at {confirmation.session.formatted_time}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Duration:</span>
                  <span className={styles.detailValue}>
                    {formatSessionDurationMinutes(confirmation.service.duration_minutes)}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Session Type:</span>
                  <span className={styles.detailValue}>
                    {isTelehealth ? (
                      <>
                        <VideoIcon size="sm" style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                        Telehealth (Video Call)
                      </>
                    ) : (
                      <>
                        <BuildingIcon size="sm" style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                        In-Person Session
                      </>
                    )}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Amount Paid:</span>
                  <span className={styles.detailValue}>${amountPaid}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Payment Method:</span>
                  <span className={styles.detailValue}>
                    <CreditCardIcon size="sm" style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                    Payment confirmed
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.nextSteps}>
            <h3><MobileIcon size="md" style={{ marginRight: '8px', verticalAlign: 'middle' }} /> What Happens Next</h3>
            <div className={styles.stepsGrid}>
              <div className={styles.stepCard}>
                <div className={styles.stepIcon}><EmailIcon size="xl" /></div>
                <div className={styles.stepContent}>
                  <h4>Email Confirmation</h4>
                  <p>✓ Sent to: {user?.email || 'your email'}</p>
                  <p>✓ Includes calendar invite and session preparation tips</p>
                </div>
              </div>

              <div className={styles.stepCard}>
                <div className={styles.stepIcon}><MobileIcon size="xl" /></div>
                <div className={styles.stepContent}>
                  <h4>WhatsApp Reminder</h4>
                  <p>✓ 24 hours before: Appointment reminder</p>
                  <p>✓ 1 hour before: Video call link and instructions</p>
                </div>
              </div>

              <div className={styles.stepCard}>
                <div className={styles.stepIcon}><VideoIcon size="xl" /></div>
                <div className={styles.stepContent}>
                  <h4>Video Session Access</h4>
                  <p>✓ Link will be sent 1 hour before your appointment</p>
                  <p>✓ Test your camera and microphone beforehand</p>
                  <p>✓ Ensure you're in a private, quiet space</p>
                </div>
              </div>

              <div className={styles.stepCard}>
                <div className={styles.stepIcon}><ClipboardIcon size="xl" /></div>
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
            <h3><LinkIcon size="md" style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Quick Actions</h3>
            <div className={styles.actionButtons}>
              <Button className={styles.actionButton} onClick={handleAddToCalendar}>
                <CalendarIcon size="sm" style={{ marginRight: '6px' }} />
                Add to Calendar
              </Button>
              <Button className={styles.actionButton} onClick={handleEmailReceipt}>
                <EmailIcon size="sm" style={{ marginRight: '6px' }} />
                Email Receipt
              </Button>
              <Button className={styles.actionButton} onClick={handleContactClinic}>
                <MobileIcon size="sm" style={{ marginRight: '6px' }} />
                Contact Clinic
              </Button>
            </div>
          </div>

          <div className={styles.emergencyInfo}>
            <div className={styles.emergencyBox}>
              <div className={styles.emergencyIcon}><WarningIcon size="xl" /></div>
              <div className={styles.emergencyContent}>
                <h4>Important Reminder</h4>
                <p>If you need to reschedule or cancel your appointment, please contact us at least 48 hours in advance.</p>
                <p><strong>Emergency Contact:</strong> (03) 9xxx-xxxx</p>
              </div>
            </div>
          </div>
          </div>

          <div className={`${styles.navigationActions} ${bookingFlow.formActionsSticky}`}>
            <Button className={styles.navButton} onClick={handleReturnToDashboard}>
              <HomeIcon size="sm" style={{ marginRight: '6px' }} />
              Return to Dashboard
            </Button>
            <Button className={styles.navButton} onClick={handleBookAnother}>
              <CalendarIcon size="sm" style={{ marginRight: '6px' }} />
              Book Another Appointment
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};
