import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '../../components/common/Layout/Layout';
import { authService } from '../../services/api/auth';
import { appointmentsService, type BookingSummaryResponse } from '../../services/api/appointments';
import { paymentsService } from '../../services/api/payments';
import { extractApiErrorMessage } from '../../utils/apiError';
import { VideoIcon, BuildingIcon, CreditCardIcon, PhoneIcon, LockIcon, WarningIcon } from '../../utils/icons';
import styles from './Payment.module.scss';

export const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get('appointment_id');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'phone' | 'in-person'>('card');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [bookingData, setBookingData] = useState<BookingSummaryResponse | null>(null);
  
  // Get user from auth service
  const user = authService.getStoredUser();

  useEffect(() => {
    if (!appointmentId) {
      setError('No appointment ID provided.');
      setLoading(false);
      return;
    }
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const summary = await appointmentsService.getBookingSummary(parseInt(appointmentId));
        setBookingData(summary);
      } catch (err: unknown) {
        console.error('Failed to load booking summary for payment:', err);
        setError(extractApiErrorMessage(err, 'Unable to load payment summary.'));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [appointmentId]);

  const handlePayment = async () => {
    if (!appointmentId) return;
    if (!agreedToTerms) {
      alert('Please agree to the terms and conditions to continue.');
      return;
    }

    setIsProcessing(true);
    try {
      const methodForApi = paymentMethod === 'in-person' ? 'in_person' : paymentMethod;
      const intent = await paymentsService.createIntent({
        appointment_id: parseInt(appointmentId),
        payment_method: methodForApi,
      });

      await paymentsService.confirm({
        appointment_id: parseInt(appointmentId),
        payment_intent_id: intent.payment_intent_id,
      });

      navigate(`/appointments/confirmation?appointment_id=${appointmentId}`);
    } catch (err: unknown) {
      console.error('Error processing payment:', err);
      alert(extractApiErrorMessage(err, 'Payment failed. Please try again.'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBack = () => {
    if (!appointmentId) {
      navigate('/appointments/book-appointment');
      return;
    }
    navigate(`/appointments/details?appointment_id=${appointmentId}`);
  };

  if (loading) {
    return (
      <Layout user={user} isAuthenticated={true} className={styles.patientLayout}>
        <div className={styles.paymentContainer}>
          <div className="container">
            <div className={styles.summaryCard}>
              <p>Loading payment details...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !bookingData) {
    return (
      <Layout user={user} isAuthenticated={true} className={styles.patientLayout}>
        <div className={styles.paymentContainer}>
          <div className="container">
            <div className={styles.summaryCard}>
              <h3>
                <WarningIcon size="md" style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                Unable to Load Payment
              </h3>
              <p>{error || 'Payment data unavailable.'}</p>
              <button className={styles.cancelButton} onClick={handleBack}>
                Back
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const consultationFee = parseFloat(bookingData.pricing.consultation_fee || '0') || 0;
  const rebate = parseFloat(bookingData.pricing.medicare_rebate || '0') || 0;
  const outOfPocket = parseFloat(bookingData.pricing.out_of_pocket_cost || '0') || 0;
  const gstAmount = outOfPocket * 0.1;
  const totalAmount = outOfPocket + gstAmount;
  const isTelehealth = bookingData.session.type !== 'in_person';

  return (
    <Layout 
      user={user} 
      isAuthenticated={true}
      className={styles.patientLayout}
    >
      <div className={styles.paymentContainer}>
        <div className="container">
          <div className={styles.pageHeader}>
            <button 
              className={styles.backButton}
              onClick={handleBack}
            >
              ← Back to Appointment Details
            </button>
            <h1 className={styles.pageTitle}>Payment</h1>
            <p className={styles.pageSubtitle}>
              Complete your payment to confirm your appointment
            </p>
          </div>

          <div className={styles.paymentContent}>
            <div className={styles.paymentSummary}>
              <div className={styles.summaryCard}>
                <h3>🧾 Payment Summary</h3>
                <div className={styles.summaryDetails}>
                  <div className={styles.summaryItem}>
                    <span className={styles.summaryLabel}>Service:</span>
                    <span className={styles.summaryValue}>{bookingData.service.name}</span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span className={styles.summaryLabel}>Psychologist:</span>
                    <span className={styles.summaryValue}>{bookingData.psychologist.name}</span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span className={styles.summaryLabel}>Date & Time:</span>
                    <span className={styles.summaryValue}>
                      {bookingData.session.formatted_date} at {bookingData.session.formatted_time}
                    </span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span className={styles.summaryLabel}>Session Type:</span>
                    <span className={styles.summaryValue}>
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
                </div>
                
                <div className={styles.pricingBreakdown}>
                  <div className={styles.pricingRow}>
                    <span>Standard Fee:</span>
                    <span>${consultationFee.toFixed(2)}</span>
                  </div>
                  {rebate > 0 && (
                    <div className={styles.pricingRow}>
                      <span>Medicare Rebate:</span>
                      <span className={styles.rebateAmount}>-${rebate.toFixed(2)}</span>
                    </div>
                  )}
                  <div className={styles.pricingRow}>
                    <span>Subtotal:</span>
                    <span>${outOfPocket.toFixed(2)}</span>
                  </div>
                  <div className={styles.pricingRow}>
                    <span>GST (10%):</span>
                    <span>${gstAmount.toFixed(2)}</span>
                  </div>
                  <div className={`${styles.pricingRow} ${styles.totalAmount}`}>
                    <span>Total Amount:</span>
                    <span>${totalAmount.toFixed(2)}</span>
                  </div>
                  <div className={styles.paymentNote}>
                    <CreditCardIcon size="sm" style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                    Payment due now to confirm appointment
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.paymentForm}>
              <div className={styles.paymentMethods}>
                <h3>Choose Payment Method:</h3>
                
                <div className={styles.paymentMethodOptions}>
                  <div 
                    className={`${styles.paymentMethodCard} ${paymentMethod === 'card' ? styles.selected : ''}`}
                    onClick={() => setPaymentMethod('card')}
                  >
                    <div className={styles.paymentMethodIcon}><CreditCardIcon size="xl" /></div>
                    <div className={styles.paymentMethodContent}>
                      <h4>Credit/Debit Card</h4>
                      <p>Pay securely online with your card</p>
                    </div>
                    <div className={styles.paymentMethodRadio}>
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={() => setPaymentMethod('card')}
                      />
                    </div>
                  </div>

                  <div 
                    className={`${styles.paymentMethodCard} ${paymentMethod === 'phone' ? styles.selected : ''}`}
                    onClick={() => setPaymentMethod('phone')}
                  >
                    <div className={styles.paymentMethodIcon}><PhoneIcon size="xl" /></div>
                    <div className={styles.paymentMethodContent}>
                      <h4>Pay by Phone</h4>
                      <p>Call (03) 9xxx-xxxx to pay over the phone</p>
                    </div>
                    <div className={styles.paymentMethodRadio}>
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="phone"
                        checked={paymentMethod === 'phone'}
                        onChange={() => setPaymentMethod('phone')}
                      />
                    </div>
                  </div>

                  <div 
                    className={`${styles.paymentMethodCard} ${paymentMethod === 'in-person' ? styles.selected : ''}`}
                    onClick={() => setPaymentMethod('in-person')}
                  >
                    <div className={styles.paymentMethodIcon}><BuildingIcon size="xl" /></div>
                    <div className={styles.paymentMethodContent}>
                      <h4>Pay in Person</h4>
                      <p>Pay cash or EFTPOS at your appointment</p>
                      <small>(Telehealth appointments must be paid online)</small>
                    </div>
                    <div className={styles.paymentMethodRadio}>
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="in-person"
                        checked={paymentMethod === 'in-person'}
                        onChange={() => setPaymentMethod('in-person')}
                        disabled={isTelehealth}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {paymentMethod === 'card' && (
                <div className={styles.cardPaymentSection}>
                  <h3>Card Details</h3>
                  <div className={styles.cardForm}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Card Number</label>
                      <input
                        type="text"
                        className={styles.cardInput}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                      />
                    </div>
                    
                    <div className={styles.cardRow}>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Expiry Date</label>
                        <input
                          type="text"
                          className={styles.cardInput}
                          placeholder="MM/YY"
                          maxLength={5}
                        />
                      </div>
                      
                      <div className={styles.formGroup}>
                        <label className={styles.label}>CVC</label>
                        <input
                          type="text"
                          className={styles.cardInput}
                          placeholder="123"
                          maxLength={4}
                        />
                      </div>
                    </div>
                    
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Name on Card</label>
                      <input
                        type="text"
                        className={styles.cardInput}
                        placeholder="John Smith"
                      />
                    </div>
                    
                    <div className={styles.securityNote}>
                      <LockIcon size="sm" style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                      Secured by Stripe - Your payment info is encrypted
                    </div>
                  </div>
                </div>
              )}

              <div className={styles.termsSection}>
                <h3>Terms & Conditions</h3>
                <div className={styles.termsCheckboxes}>
                  <label className={styles.checkboxWrapper}>
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                    />
                    <span className={styles.checkboxCustom}></span>
                    I agree to the Terms of Service and Privacy Policy
                  </label>
                  
                  <label className={styles.checkboxWrapper}>
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                    />
                    <span className={styles.checkboxCustom}></span>
                    I understand the cancellation policy (48-hour notice required)
                  </label>
                  
                  <label className={styles.checkboxWrapper}>
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                    />
                    <span className={styles.checkboxCustom}></span>
                    I consent to receive appointment reminders via my selected method
                  </label>
                  
                  <label className={styles.checkboxWrapper}>
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                    />
                    <span className={styles.checkboxCustom}></span>
                    I confirm that I have a valid Medicare card (if claiming rebate)
                  </label>
                </div>
              </div>

              <div className={styles.paymentActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={handleBack}
                  disabled={isProcessing}
                >
                  Back to Details
                </button>
                <button
                  type="button"
                  className={styles.payButton}
                  onClick={handlePayment}
                  disabled={!agreedToTerms || isProcessing}
                >
                  {isProcessing ? 'Processing Payment...' : `Confirm & Pay $${totalAmount.toFixed(2)}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
