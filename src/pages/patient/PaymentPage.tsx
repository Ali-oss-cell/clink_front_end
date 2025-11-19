import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '../../components/common/Layout/Layout';
import { authService } from '../../services/api/auth';
import { VideoIcon, BuildingIcon, CreditCardIcon, PhoneIcon, LockIcon } from '../../utils/icons';
import styles from './Payment.module.scss';

export const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedService = searchParams.get('service');
  const selectedPsychologist = searchParams.get('psychologist');
  const selectedDate = searchParams.get('date');
  const selectedTime = searchParams.get('time');
  const selectedSessionType = searchParams.get('sessionType');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'phone' | 'in-person'>('card');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  // Get user from auth service
  const user = authService.getStoredUser();

  // TODO: Fetch payment methods from Django backend
  // TODO: Implement Stripe payment processing
  // TODO: Add payment validation and security checks
  // TODO: Implement payment retry logic
  // TODO: Add payment receipt generation
  // TODO: Store payment information securely

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

  const servicePrice = getServicePrice(selectedService || '');
  const gstAmount = servicePrice.final * 0.1; // 10% GST
  const totalAmount = servicePrice.final + gstAmount;

  const handlePayment = async () => {
    if (!agreedToTerms) {
      alert('Please agree to the terms and conditions to continue.');
      return;
    }

    setIsProcessing(true);
    try {
      // TODO: Submit payment to Django backend
      // TODO: Process payment through Stripe API
      // TODO: Validate payment amount and currency
      // TODO: Check payment method availability
      // TODO: Implement payment security checks
      // TODO: Store payment transaction in database
      // TODO: Send payment confirmation email
      // TODO: Update appointment status to confirmed
      // TODO: Generate payment receipt
      // TODO: Log payment for accounting/analytics
      
      const paymentData = {
        service: selectedService,
        psychologist: selectedPsychologist,
        date: selectedDate,
        time: selectedTime,
        sessionType: selectedSessionType,
        amount: totalAmount,
        paymentMethod: paymentMethod,
        // Add other form data from previous steps
      };

      console.log('Payment data to send to Django backend:', paymentData);
      
      // Simulate API call to Django backend
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Navigate to confirmation page
      const params = new URLSearchParams({
        service: selectedService || '',
        psychologist: selectedPsychologist || '',
        date: selectedDate || '',
        time: selectedTime || '',
        sessionType: selectedSessionType || '',
        amount: totalAmount.toString(),
        paymentMethod: paymentMethod
      });
      
      navigate(`/appointments/confirmation?${params.toString()}`);
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBack = () => {
    const params = new URLSearchParams({
      service: selectedService || '',
      psychologist: selectedPsychologist || '',
      date: selectedDate || '',
      time: selectedTime || '',
      sessionType: selectedSessionType || ''
    });
    navigate(`/appointments/details?${params.toString()}`);
  };

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
                    <span className={styles.summaryValue}>{getServiceName(selectedService || '')}</span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span className={styles.summaryLabel}>Psychologist:</span>
                    <span className={styles.summaryValue}>{getPsychologistName(selectedPsychologist || '')}</span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span className={styles.summaryLabel}>Date & Time:</span>
                    <span className={styles.summaryValue}>
                      {formatDate(selectedDate || '')} at {selectedTime}
                    </span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span className={styles.summaryLabel}>Session Type:</span>
                    <span className={styles.summaryValue}>
                      {selectedSessionType === 'in-person' ? (
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
                
                <div className={styles.pricingBreakdown}>
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
                  <div className={styles.pricingRow}>
                    <span>Subtotal:</span>
                    <span>${servicePrice.final.toFixed(2)}</span>
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
                        disabled={selectedSessionType === 'telehealth'}
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
