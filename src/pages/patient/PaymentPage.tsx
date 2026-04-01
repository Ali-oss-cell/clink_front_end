import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { Layout } from '../../components/common/Layout/Layout';
import { authService } from '../../services/api/auth';
import { appointmentsService, type BookingSummaryResponse } from '../../services/api/appointments';
import { paymentsService } from '../../services/api/payments';
import { extractApiErrorMessage } from '../../utils/apiError';
import { getStripePromise, hasStripePublishableKey } from '../../lib/stripe';
import { VideoIcon, BuildingIcon, CreditCardIcon, PhoneIcon, LockIcon, WarningIcon } from '../../utils/icons';
import { Button } from '../../components/ui/button';
import { Checkbox } from '../../components/ui/checkbox';
import styles from './Payment.module.scss';
import bookingFlow from './PatientPages.module.scss';

type PaymentMethodUi = 'card' | 'phone' | 'in-person';

interface CardPaymentFormProps {
  appointmentId: number;
  paymentIntentId: string;
  totalAmount: number;
  onPaid: () => void;
  onError: (message: string) => void;
}

function CardPaymentForm({ appointmentId, paymentIntentId, totalAmount, onPaid, onError }: CardPaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);

  const handlePay = async () => {
    if (!stripe || !elements) return;
    setSubmitting(true);
    onError('');
    try {
      const returnUrl = `${window.location.origin}/appointments/payment?appointment_id=${appointmentId}`;
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: returnUrl },
        redirect: 'if_required',
      });
      if (error) {
        onError(error.message || 'Payment failed.');
        return;
      }
      const piId = paymentIntent?.id ?? paymentIntentId;
      if (paymentIntent?.status === 'succeeded') {
        await paymentsService.confirm({
          appointment_id: appointmentId,
          payment_intent_id: piId,
        });
        onPaid();
      }
    } catch (err: unknown) {
      onError(extractApiErrorMessage(err, 'Payment failed. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.stripeCheckout}>
      <div className={styles.stripeElementWrap}>
        <PaymentElement />
      </div>
      <Button
        type="button"
        className={styles.payButton}
        onClick={handlePay}
        disabled={!stripe || submitting}
      >
        {submitting ? 'Processing…' : `Pay $${totalAmount.toFixed(2)}`}
      </Button>
    </div>
  );
}

export const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get('appointment_id');

  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodUi>('card');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [bookingData, setBookingData] = useState<BookingSummaryResponse | null>(null);

  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [isPreparingIntent, setIsPreparingIntent] = useState(false);

  const idempotencyKeyRef = useRef<string>(
    typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `pay-${Date.now()}`
  );

  const user = authService.getStoredUser();
  const stripePromise = getStripePromise();

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
        const summary = await appointmentsService.getBookingSummary(parseInt(appointmentId, 10));
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

  // After redirect-based confirmation (3DS, etc.), Stripe returns to return_url with query params.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const redirectStatus = params.get('redirect_status');
    const paymentIntentFromUrl = params.get('payment_intent');
    if (!appointmentId || !paymentIntentFromUrl) return;

    if (redirectStatus === 'failed' || redirectStatus === 'canceled') {
      setPaymentError(
        redirectStatus === 'canceled' ? 'Payment was cancelled.' : 'Payment could not be completed.'
      );
      window.history.replaceState({}, '', `/appointments/payment?appointment_id=${appointmentId}`);
      return;
    }

    if (redirectStatus !== 'succeeded') return;

    let cancelled = false;
    (async () => {
      try {
        setIsProcessing(true);
        setPaymentError(null);
        await paymentsService.confirm({
          appointment_id: parseInt(appointmentId, 10),
          payment_intent_id: paymentIntentFromUrl,
        });
        if (!cancelled) {
          navigate(`/appointments/confirmation?appointment_id=${appointmentId}`);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setPaymentError(extractApiErrorMessage(err, 'Could not confirm payment with the server.'));
        }
      } finally {
        if (!cancelled) setIsProcessing(false);
        window.history.replaceState({}, '', `/appointments/payment?appointment_id=${appointmentId}`);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [appointmentId, navigate]);

  useEffect(() => {
    if (paymentMethod !== 'card') {
      setStripeClientSecret(null);
      setPaymentIntentId(null);
    }
  }, [paymentMethod]);

  const handleBack = () => {
    if (!appointmentId) {
      navigate('/appointments/book-appointment');
      return;
    }
    navigate(`/appointments/details?appointment_id=${appointmentId}`);
  };

  const prepareCardCheckout = async () => {
    if (!appointmentId) return;
    if (!agreedToTerms) {
      setPaymentError('Please agree to the terms and conditions to continue.');
      return;
    }
    if (!hasStripePublishableKey() || !stripePromise) {
      setPaymentError(
        'Online card payments are not configured. Please choose another payment method or contact the clinic.'
      );
      return;
    }

    setIsPreparingIntent(true);
    setPaymentError(null);
    try {
      const intent = await paymentsService.createIntent(
        {
          appointment_id: parseInt(appointmentId, 10),
          payment_method: 'card',
        },
        { idempotencyKey: idempotencyKeyRef.current }
      );
      if (!intent.client_secret) {
        setPaymentError('The server did not return card payment details. Please try again or contact support.');
        return;
      }
      setStripeClientSecret(intent.client_secret);
      setPaymentIntentId(intent.payment_intent_id);
    } catch (err: unknown) {
      console.error('createIntent failed:', err);
      setPaymentError(extractApiErrorMessage(err, 'Could not start card payment. Please try again.'));
    } finally {
      setIsPreparingIntent(false);
    }
  };

  const handleNonCardPayment = async () => {
    if (!appointmentId) return;
    if (!agreedToTerms) {
      setPaymentError('Please agree to the terms and conditions to continue.');
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);
    try {
      const methodForApi = paymentMethod === 'in-person' ? 'in_person' : paymentMethod;
      const intent = await paymentsService.createIntent(
        {
          appointment_id: parseInt(appointmentId, 10),
          payment_method: methodForApi,
        },
        { idempotencyKey: idempotencyKeyRef.current }
      );

      await paymentsService.confirm({
        appointment_id: parseInt(appointmentId, 10),
        payment_intent_id: intent.payment_intent_id,
      });

      navigate(`/appointments/confirmation?appointment_id=${appointmentId}`);
    } catch (err: unknown) {
      console.error('Error processing payment:', err);
      setPaymentError(extractApiErrorMessage(err, 'Payment failed. Please try again.'));
    } finally {
      setIsProcessing(false);
    }
  };

  const navigateToConfirmation = () => {
    if (!appointmentId) return;
    navigate(`/appointments/confirmation?appointment_id=${appointmentId}`);
  };

  if (loading) {
    return (
      <Layout user={user} isAuthenticated={true} patientShell className={styles.patientLayout}>
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
      <Layout user={user} isAuthenticated={true} patientShell className={styles.patientLayout}>
        <div className={styles.paymentContainer}>
          <div className="container">
            <div className={styles.summaryCard}>
              <h3>
                <WarningIcon size="md" style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                Unable to Load Payment
              </h3>
              <p>{error || 'Payment data unavailable.'}</p>
              <Button variant="outline" className={styles.cancelButton} onClick={handleBack}>
                Back
              </Button>
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

  if (!appointmentId) {
    return null;
  }

  const showCardStripe = paymentMethod === 'card' && stripeClientSecret && paymentIntentId && stripePromise;

  return (
    <Layout user={user} isAuthenticated={true} patientShell className={styles.patientLayout}>
      <div className={`${styles.paymentContainer} ${bookingFlow.bookingFlowLayout}`}>
        <div className="container">
          <div className={bookingFlow.bookingFlowMain}>
          <div className={styles.pageHeader}>
            <Button className={styles.backButton} onClick={handleBack}>
              ← Back to Appointment Details
            </Button>
            <h1 className={styles.pageTitle}>Payment</h1>
            <p className={styles.pageSubtitle}>Complete your payment to confirm your appointment</p>
          </div>

          {paymentError && (
            <div className={styles.inlineError} role="alert">
              {paymentError}
            </div>
          )}

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
                    <div className={styles.paymentMethodIcon}>
                      <CreditCardIcon size="xl" />
                    </div>
                    <div className={styles.paymentMethodContent}>
                      <h4>Credit/Debit Card</h4>
                      <p>Pay securely online with your card (Stripe)</p>
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
                    <div className={styles.paymentMethodIcon}>
                      <PhoneIcon size="xl" />
                    </div>
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
                    onClick={() => !isTelehealth && setPaymentMethod('in-person')}
                  >
                    <div className={styles.paymentMethodIcon}>
                      <BuildingIcon size="xl" />
                    </div>
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

              <div className={styles.termsSection}>
                <h3>Terms & Conditions</h3>
                <div className={styles.termsCheckboxes}>
                  <label className="tp-ui-checkboxRow">
                    <Checkbox checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} />
                    I agree to the Terms of Service and Privacy Policy
                  </label>

                  <label className="tp-ui-checkboxRow">
                    <Checkbox checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} />
                    I understand the cancellation policy (48-hour notice required)
                  </label>

                  <label className="tp-ui-checkboxRow">
                    <Checkbox checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} />
                    I consent to receive appointment reminders via my selected method
                  </label>

                  <label className="tp-ui-checkboxRow">
                    <Checkbox checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} />
                    I confirm that I have a valid Medicare card (if claiming rebate)
                  </label>
                </div>
              </div>

              {paymentMethod === 'card' && (
                <div className={styles.cardPaymentSection}>
                  <h3>Card payment</h3>
                  <p className={styles.cardPaymentLead}>
                    Card details are collected securely by Stripe — they are not sent to our servers.
                  </p>
                  {!showCardStripe && (
                    <div className={styles.securityNote}>
                      <LockIcon size="sm" style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                      Accept the terms above, then use &quot;Continue to secure payment&quot; to load the form.
                    </div>
                  )}
                  {showCardStripe && stripePromise && stripeClientSecret && paymentIntentId && (
                    <Elements
                      stripe={stripePromise}
                      options={{
                        clientSecret: stripeClientSecret,
                        appearance: { theme: 'stripe' },
                      }}
                    >
                      <CardPaymentForm
                        appointmentId={parseInt(appointmentId, 10)}
                        paymentIntentId={paymentIntentId}
                        totalAmount={totalAmount}
                        onPaid={navigateToConfirmation}
                        onError={setPaymentError}
                      />
                    </Elements>
                  )}
                </div>
              )}
            </div>
          </div>
          </div>

          <div className={`${styles.paymentActions} ${bookingFlow.formActionsSticky}`}>
            <Button
              type="button"
              variant="outline"
              className={styles.cancelButton}
              onClick={handleBack}
              disabled={isProcessing || isPreparingIntent}
            >
              Back to Details
            </Button>

            {paymentMethod === 'card' && !stripeClientSecret && (
              <Button
                type="button"
                className={styles.payButton}
                onClick={prepareCardCheckout}
                disabled={!agreedToTerms || isPreparingIntent || isProcessing}
              >
                {isPreparingIntent ? 'Preparing secure checkout…' : 'Continue to secure payment'}
              </Button>
            )}

            {paymentMethod !== 'card' && (
              <Button
                type="button"
                className={styles.payButton}
                onClick={handleNonCardPayment}
                disabled={!agreedToTerms || isProcessing}
              >
                {isProcessing ? 'Processing…' : `Confirm & Pay $${totalAmount.toFixed(2)}`}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};
