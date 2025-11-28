import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '../../components/common/Layout/Layout';
import { authService } from '../../services/api/auth';
import { TelehealthService, type TelehealthConsentResponse } from '../../services/api/telehealth';
import { servicesService, type Service as APIService } from '../../services/api/services';
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
  const [apiServices, setApiServices] = useState<APIService[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState<string | null>(null);
  
  // Get user data from auth service
  const user = authService.getStoredUser();

  // Debug logging
  useEffect(() => {
    console.log('[ServiceSelectionPage] Component mounted/updated');
    console.log('[ServiceSelectionPage] serviceFromUrl:', serviceFromUrl);
    console.log('[ServiceSelectionPage] selectedService state:', selectedService);
    console.log('[ServiceSelectionPage] Current URL:', window.location.href);
    console.log('[ServiceSelectionPage] All search params:', Object.fromEntries(searchParams.entries()));
  }, [serviceFromUrl, selectedService, searchParams]);

  // ✅ Fetch services from backend API
  useEffect(() => {
    const loadServices = async () => {
      try {
        setServicesLoading(true);
        setServicesError(null);
        
        console.log('[ServiceSelectionPage] Fetching services from API...');
        const services = await servicesService.getAllServices();
        console.log('[ServiceSelectionPage] Services from API:', services);
        console.log('[ServiceSelectionPage] Service IDs:', services.map(s => s.id));
        
        // Only show active services
        const activeServices = services.filter(s => s.is_active);
        console.log('[ServiceSelectionPage] Active services:', activeServices.length);
        
        setApiServices(activeServices);
        
        // If URL has a service ID, validate it exists
        if (serviceFromUrl) {
          const serviceId = parseInt(serviceFromUrl);
          if (!isNaN(serviceId)) {
            const foundService = activeServices.find(s => s.id === serviceId);
            if (foundService) {
              console.log('[ServiceSelectionPage] Valid service ID from URL:', serviceId);
              setSelectedService(serviceId.toString());
            } else {
              console.warn('[ServiceSelectionPage] Service ID from URL not found:', serviceId);
              console.warn('[ServiceSelectionPage] Available service IDs:', activeServices.map(s => s.id));
            }
          }
        }
      } catch (err: any) {
        console.error('[ServiceSelectionPage] Failed to load services:', err);
        setServicesError(err.message || 'Failed to load services. Please try again.');
      } finally {
        setServicesLoading(false);
      }
    };

    loadServices();
  }, []); // Only run once on mount

  // Restore service selection from URL params if present (but don't auto-navigate)
  useEffect(() => {
    if (serviceFromUrl && serviceFromUrl !== selectedService) {
      const serviceId = parseInt(serviceFromUrl);
      if (!isNaN(serviceId) && apiServices.find(s => s.id === serviceId)) {
        console.log('[ServiceSelectionPage] Restoring service ID from URL:', serviceId);
        setSelectedService(serviceId.toString());
      }
    }
  }, [serviceFromUrl, apiServices]); // Depend on apiServices to ensure they're loaded

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

  // Transform API services to display format
  const services: Service[] = apiServices.map(apiService => {
    const standardFee = parseFloat(apiService.standard_fee) || 0;
    // TODO: Get actual Medicare rebate from backend when available
    const medicareRebate = standardFee > 0 ? 87.45 : 0; // Default Medicare rebate
    const yourCost = Math.max(0, standardFee - medicareRebate);
    
    return {
      id: apiService.id.toString(), // Convert to string for comparison with selectedService
      name: apiService.name,
      duration: apiService.duration_minutes,
      standardFee: standardFee,
      medicareRebate: medicareRebate,
      yourCost: yourCost,
      medicareApplicable: medicareRebate > 0,
      specializations: [], // TODO: Get from backend when available
      description: apiService.description || 'Professional psychological service',
      requiresTelehealthConsent: apiService.name.toLowerCase().includes('telehealth') || 
                                apiService.name.toLowerCase().includes('video')
    };
  });

  const handleServiceSelect = (serviceId: number) => {
    console.log('[ServiceSelectionPage] handleServiceSelect called with service ID:', serviceId);
    console.log('[ServiceSelectionPage] Previous selectedService:', selectedService);
    setSelectedService(serviceId.toString());
    console.log('[ServiceSelectionPage] New selectedService will be:', serviceId.toString());
  };

  const handleContinue = () => {
    console.log('[ServiceSelectionPage] handleContinue called, selectedService:', selectedService);
    
    if (!selectedService) {
      alert('Please select a service to continue.');
      return;
    }

    // ✅ Find service by ID (numeric)
    const serviceId = parseInt(selectedService);
    if (isNaN(serviceId)) {
      console.error('[ServiceSelectionPage] Invalid service ID:', selectedService);
      alert('Invalid service selection. Please select a service again.');
      return;
    }

    const selectedServiceMeta = apiServices.find((service) => service.id === serviceId);
    if (!selectedServiceMeta) {
      console.error('[ServiceSelectionPage] Service not found for ID:', serviceId);
      console.error('[ServiceSelectionPage] Available service IDs:', apiServices.map(s => s.id));
      alert('Service not found. Please select a service again.');
      return;
    }

    // Check if telehealth consent is required
    const requiresTelehealth = selectedServiceMeta.name.toLowerCase().includes('telehealth') || 
                               selectedServiceMeta.name.toLowerCase().includes('video');
    
    if (
      requiresTelehealth &&
      (!telehealthConsent || !telehealthConsent.consent_to_telehealth)
    ) {
      alert('Telehealth consent is required before booking a video session. Please update your consent first.');
      return;
    }
    
    // ✅ Navigate with service ID (number) not slug
    const targetUrl = `/appointments/psychologist-selection?service=${serviceId}`;
    console.log('[ServiceSelectionPage] Navigating with service ID:', serviceId);
    console.log('[ServiceSelectionPage] Target URL:', targetUrl);
    navigate(targetUrl);
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

          {servicesLoading ? (
            <div className={styles.loadingState}>
              <p>Loading services...</p>
            </div>
          ) : servicesError ? (
            <div className={styles.errorState}>
              <h3>Unable to Load Services</h3>
              <p>{servicesError}</p>
              <button className={styles.actionButton} onClick={() => window.location.reload()}>
                Retry
              </button>
            </div>
          ) : services.length === 0 ? (
            <div className={styles.errorState}>
              <h3>No Services Available</h3>
              <p>There are currently no services available for booking. Please check back later.</p>
            </div>
          ) : (
            <div className={styles.servicesGrid}>
              {services.map((service) => {
                const serviceId = parseInt(service.id);
                return (
                  <div 
                    key={service.id}
                    className={`${styles.serviceCard} ${selectedService === service.id ? styles.serviceCardSelected : ''}`}
                    onClick={() => {
                      console.log('[ServiceSelectionPage] Service card clicked, ID:', serviceId);
                      handleServiceSelect(serviceId);
                    }}
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
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card click from firing
                        console.log('[ServiceSelectionPage] Select button clicked, ID:', serviceId);
                        handleServiceSelect(serviceId);
                      }}
                    >
                      {selectedService === service.id ? 'SELECTED' : 'SELECT'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

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
