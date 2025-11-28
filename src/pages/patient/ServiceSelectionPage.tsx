import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '../../components/common/Layout/Layout';
import { authService } from '../../services/api/auth';
import { TelehealthService, type TelehealthConsentResponse } from '../../services/api/telehealth';
import { InfoIcon, VideoIcon, PhoneIcon } from '../../utils/icons';
import styles from './PatientPages.module.scss';

interface Service {
  id: string;
  name: string;
  duration: number;
  standardFee: number;
  medicareRebate: number;
  yourCost: number;
  medicareApplicable: boolean;
  specializations: string[];
  description: string;
  requiresTelehealthConsent?: boolean;
}

export const ServiceSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const serviceFromUrl = searchParams.get('service');
  const [selectedService, setSelectedService] = useState<string | null>(serviceFromUrl);
  const [telehealthConsent, setTelehealthConsent] = useState<TelehealthConsentResponse | null>(null);
  const [consentLoading, setConsentLoading] = useState(true);
  const [consentError, setConsentError] = useState<string | null>(null);
  
  // Get user data from auth service
  const user = authService.getStoredUser();

  // Restore service selection from URL params if present (but don't auto-navigate)
  useEffect(() => {
    if (serviceFromUrl && serviceFromUrl !== selectedService) {
      setSelectedService(serviceFromUrl);
    }
  }, [serviceFromUrl, selectedService]);

  useEffect(() => {
    const loadConsent = async () => {
      try {
        setConsentLoading(true);
        const response = await TelehealthService.getConsent();
        setTelehealthConsent(response);
        setConsentError(null);
      } catch (err: any) {
        setTelehealthConsent(null);
        setConsentError(err.message || 'Unable to verify telehealth consent.');
      } finally {
        setConsentLoading(false);
      }
    };

    loadConsent();
  }, []);

  // TODO: Fetch services from Django backend API
  // TODO: Implement service filtering by user preferences
  // TODO: Add service availability checking
  // TODO: Implement dynamic pricing based on user location/insurance

  const services: Service[] = [
    {
      id: 'individual-therapy',
      name: 'Individual Therapy Session',
      duration: 50,
      standardFee: 180.00,
      medicareRebate: 87.45,
      yourCost: 92.55,
      medicareApplicable: true,
      specializations: ['Anxiety & Depression', 'Stress Management', 'Life Transitions'],
      description: 'One-on-one therapy session with a registered psychologist'
    },
    {
      id: 'couples-therapy',
      name: 'Couples Therapy Session',
      duration: 60,
      standardFee: 220.00,
      medicareRebate: 0,
      yourCost: 220.00,
      medicareApplicable: false,
      specializations: ['Relationship Issues', 'Communication Skills', 'Conflict Resolution'],
      description: 'Joint therapy session for couples working on relationship issues'
    },
    {
      id: 'psychological-assessment',
      name: 'Psychological Assessment',
      duration: 90,
      standardFee: 280.00,
      medicareRebate: 126.55,
      yourCost: 153.45,
      medicareApplicable: true,
      specializations: ['ADHD Assessment', 'Autism Spectrum Assessment', 'Cognitive Assessment'],
      description: 'Comprehensive psychological evaluation and assessment'
    },
    {
      id: 'telehealth-video-session',
      name: 'Telehealth Video Session',
      duration: 50,
      standardFee: 180.0,
      medicareRebate: 87.45,
      yourCost: 92.55,
      medicareApplicable: true,
      specializations: ['Remote Therapy', 'Follow-up Care', 'Medication Reviews'],
      description: 'Secure video consultation with your clinician from home.',
      requiresTelehealthConsent: true
    }
  ];

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
  };

  const handleContinue = () => {
    if (!selectedService) {
      alert('Please select a service to continue.');
      return;
    }

    const selectedServiceMeta = services.find((service) => service.id === selectedService);
    if (
      selectedServiceMeta?.requiresTelehealthConsent &&
      (!telehealthConsent || !telehealthConsent.consent_to_telehealth)
    ) {
      alert('Telehealth consent is required before booking a video session. Please update your consent first.');
      return;
    }
    
    // TODO: Validate service selection with backend
    // TODO: Check service availability for selected date range
    // TODO: Store service selection in Redux store
    // TODO: Log service selection for analytics
    
    navigate(`/appointments/psychologist-selection?service=${selectedService}`);
  };

  const handleBack = () => {
    navigate('/patient/dashboard');
  };

  return (
    <Layout 
      user={user} 
      isAuthenticated={true}
      className={styles.patientLayout}
    >
      <div className={styles.serviceSelectionContainer}>
        <div className="container">
          <div className={styles.pageHeader}>
            <button 
              className={styles.backButton}
              onClick={handleBack}
            >
              ← Back to Dashboard
            </button>
            <h1 className={styles.pageTitle}>Book Your Appointment</h1>
            <p className={styles.pageSubtitle}>
              Choose the service that best fits your needs. All sessions include Medicare rebates for eligible patients.
            </p>
          </div>

          {!consentLoading && (!telehealthConsent || !telehealthConsent.consent_to_telehealth) && (
            <div className={styles.telehealthWarning}>
              <div>
                <h3>Telehealth consent pending</h3>
                <p>
                  Complete the telehealth consent form before booking a telehealth session. This ensures we have an
                  emergency contact and plan on file.
                </p>
                {consentError && <p className={styles.placeholderSubtext}>{consentError}</p>}
              </div>
              <button className={styles.actionButton} onClick={() => navigate('/patient/account?tab=privacy')}>
                Update Consent
              </button>
            </div>
          )}

          <div className={styles.servicesGrid}>
            {services.map((service) => (
              <div 
                key={service.id}
                className={`${styles.serviceCard} ${selectedService === service.id ? styles.serviceCardSelected : ''}`}
                onClick={() => handleServiceSelect(service.id)}
              >
                <div className={styles.serviceHeader}>
                  <h3 className={styles.serviceName}>{service.name}</h3>
                  <div className={styles.serviceDuration}>{service.duration} minutes</div>
                </div>
                
                <div className={styles.servicePricing}>
                  <div className={styles.pricingRow}>
                    <span>Standard Fee:</span>
                    <span>${service.standardFee.toFixed(2)}</span>
                  </div>
                  {service.medicareApplicable ? (
                    <div className={styles.pricingRow}>
                      <span>Medicare Rebate:</span>
                      <span className={styles.rebateAmount}>-${service.medicareRebate.toFixed(2)}</span>
                    </div>
                  ) : (
                    <div className={styles.pricingRow}>
                      <span>Medicare Rebate:</span>
                      <span>Not applicable</span>
                    </div>
                  )}
                  <div className={`${styles.pricingRow} ${styles.totalCost}`}>
                    <span>Your Cost:</span>
                    <span>${service.yourCost.toFixed(2)}</span>
                  </div>
                </div>

                <div className={styles.serviceSpecializations}>
                  {service.specializations.map((spec, index) => (
                    <div key={index} className={styles.specializationItem}>
                      ✓ {spec}
                    </div>
                  ))}
                </div>

                <div className={styles.serviceDescription}>
                  {service.description}
                </div>

                <button 
                  className={`${styles.selectButton} ${selectedService === service.id ? styles.selectButtonSelected : ''}`}
                >
                  {selectedService === service.id ? 'SELECTED' : 'SELECT'}
                </button>
              </div>
            ))}
          </div>

          <div className={styles.infoBoxes}>
            <div className={styles.infoBox}>
              <div className={styles.infoIcon}><InfoIcon size="lg" /></div>
              <div className={styles.infoContent}>
                <h4>Medicare Information</h4>
                <p>With a valid Mental Health Care Plan from your GP, you can claim Medicare rebates. We can process this for you at the time of payment.</p>
              </div>
            </div>

            <div className={styles.infoBox}>
              <div className={styles.infoIcon}><VideoIcon size="lg" /></div>
              <div className={styles.infoContent}>
                <h4>Telehealth Available</h4>
                <p>All services are available via secure video call from the comfort of your home. Perfect for busy schedules or remote locations.</p>
              </div>
            </div>

            <div className={styles.infoBox}>
              <div className={styles.infoIcon}><PhoneIcon size="lg" /></div>
              <div className={styles.infoContent}>
                <h4>Need Help Choosing?</h4>
                <p>Not sure which service is right for you? Call us on (03) 9xxx-xxxx for a free 10-minute consultation.</p>
              </div>
            </div>
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={handleBack}
            >
              Cancel
            </button>
            <button
              type="button"
              className={styles.continueButton}
              onClick={handleContinue}
              disabled={!selectedService}
            >
              Continue to Psychologist Selection
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};
