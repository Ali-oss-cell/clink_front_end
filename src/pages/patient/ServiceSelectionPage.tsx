import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '../../components/common/Layout/Layout';
import { authService } from '../../services/api/auth';
import { TelehealthService, type TelehealthConsentResponse } from '../../services/api/telehealth';
import { servicesService, type Service as APIService } from '../../services/api/services';
import {
  InfoIcon,
  SearchIcon,
  OutlineIndividualCareIcon,
  VideoIcon,
  ChatIcon,
  ClipboardIcon,
  StethoscopeIcon,
  HeartbeatIcon,
  ForwardIcon,
  CheckCircleIcon,
} from '../../utils/icons';
import { Button } from '../../components/ui/button';
import { BookingFlowProgress } from '../../components/patient/BookingFlowProgress/BookingFlowProgress';
import styles from './PatientPages.module.scss';

const SERVICE_BOOKING_ICONS = [
  OutlineIndividualCareIcon,
  VideoIcon,
  ChatIcon,
  ClipboardIcon,
  StethoscopeIcon,
  HeartbeatIcon,
] as const;

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
  const [serviceSearch, setServiceSearch] = useState('');

  // Get user data from auth service
  const user = authService.getStoredUser();

  // ✅ Fetch services from backend API
  useEffect(() => {
    const loadServices = async () => {
      try {
        setServicesLoading(true);
        setServicesError(null);
        
        const services = await servicesService.getAllServices();

        // Only show active services
        const activeServices = services.filter(s => s.is_active);
        
        setApiServices(activeServices);
        
        // If URL has a service ID, validate it exists
        if (serviceFromUrl) {
          const serviceId = parseInt(serviceFromUrl);
          if (!isNaN(serviceId)) {
            const foundService = activeServices.find(s => s.id === serviceId);
            if (foundService) {
              setSelectedService(serviceId.toString());
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
        setSelectedService(serviceId.toString());
      }
    }
  }, [serviceFromUrl, apiServices]);

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

  const filteredServices = useMemo(() => {
    const q = serviceSearch.trim().toLowerCase();
    if (!q) return services;
    return services.filter(
      (s) =>
        s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
    );
  }, [services, serviceSearch]);

  const handleServiceSelect = (serviceId: number) => {
    setSelectedService(serviceId.toString());
  };

  const handleContinue = () => {
    if (!selectedService) {
      alert('Please select a service to continue.');
      return;
    }

    // ✅ Find service by ID (numeric)
    const serviceId = parseInt(selectedService);
    if (isNaN(serviceId)) {
      alert('Invalid service selection. Please select a service again.');
      return;
    }

    const selectedServiceMeta = apiServices.find((service) => service.id === serviceId);
    if (!selectedServiceMeta) {
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
    
    // ✅ Navigate directly to wizard step 2
    navigate(`/appointments/book-appointment?step=2&service=${serviceId}`);
  };

  const handleBack = () => {
    navigate('/patient/dashboard');
  };

  return (
    <Layout 
      user={user} 
      isAuthenticated={true}
      patientShell
      className={styles.patientLayout}
    >
      <div
        className={`${styles.serviceSelectionContainer} ${styles.bookingFlowLayout}`}
        data-patient-booking-viewport=""
      >
        <div className="container">
          <BookingFlowProgress currentStep={1} />
          <div className={styles.bookingFlowMain}>
            <div className={styles.bookingFlowNavRow}>
              <Button type="button" className={styles.backButton} onClick={handleBack}>
                ← Back to Dashboard
              </Button>
            </div>

            <div className={styles.bookingFlowCanvas}>
              <div className={styles.bookingFlowHeroCenter}>
                <span className={styles.bookingFlowKicker}>Step 1 of 5</span>
                <h1 className={styles.bookingFlowHeroTitle}>How can we help today?</h1>
                <p className={styles.bookingFlowHeroLead}>
                  Choose the service that best fits your needs. All sessions include Medicare rebates for eligible
                  patients.
                </p>
              </div>

              {!servicesLoading && !servicesError && services.length > 0 && (
                <div className={styles.serviceSearchWrap}>
                  <span className={styles.serviceSearchIcon} aria-hidden>
                    <SearchIcon size="sm" />
                  </span>
                  <input
                    type="search"
                    className={styles.serviceSearchInput}
                    placeholder="Search services by name or description…"
                    value={serviceSearch}
                    onChange={(e) => setServiceSearch(e.target.value)}
                    aria-label="Search services"
                  />
                </div>
              )}
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
              <Button className={styles.actionButton} onClick={() => navigate('/patient/account?tab=privacy')}>
                Update Consent
              </Button>
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
              <Button className={styles.actionButton} onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          ) : services.length === 0 ? (
            <div className={styles.errorState}>
              <h3>No Services Available</h3>
              <p>There are currently no services available for booking. Please check back later.</p>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className={styles.errorState}>
              <h3>No matching services</h3>
              <p>Try a different search term or clear the search to see all services.</p>
              <Button type="button" className={styles.actionButton} onClick={() => setServiceSearch('')}>
                Clear search
              </Button>
            </div>
          ) : (
            <div className={`${styles.servicesGrid} ${styles.bookingFlowCanvas}`}>
              {filteredServices.map((service, index) => {
                const serviceId = parseInt(service.id);
                const Icon = SERVICE_BOOKING_ICONS[index % SERVICE_BOOKING_ICONS.length];
                const isSelected = selectedService === service.id;
                return (
                  <div
                    key={service.id}
                    role="button"
                    tabIndex={0}
                    className={`${styles.serviceCard} ${isSelected ? styles.serviceCardSelected : ''}`}
                    onClick={() => handleServiceSelect(serviceId)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleServiceSelect(serviceId);
                      }
                    }}
                  >
                    <div className={styles.serviceCardIconWell} aria-hidden>
                      <Icon size="lg" />
                    </div>
                    <h3 className={styles.serviceCardTitle}>{service.name}</h3>
                    <p className={styles.serviceCardDescription}>{service.description}</p>
                    <p className={styles.serviceCardMeta}>
                      {service.duration} min session · Est. out-of-pocket ${service.yourCost.toFixed(2)}
                    </p>
                    <div className={styles.serviceCardCta} aria-hidden={false}>
                      {isSelected ? (
                        <>
                          <CheckCircleIcon size="sm" aria-hidden />
                          <span>Selected</span>
                        </>
                      ) : (
                        <>
                          <span>Choose this service</span>
                          <ForwardIcon size="sm" aria-hidden />
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className={`${styles.helpStrip} ${styles.bookingFlowCanvas}`}>
            <InfoIcon size="sm" aria-hidden />
            <span>
              Not sure which service is right for you? Medicare rebates apply with a valid Mental Health Care Plan.{' '}
              <strong>Call us on (03) 9xxx-xxxx</strong> for a free 10-minute consultation.
            </span>
          </div>
          </div>

          <div
            className={`${styles.formActions} ${styles.formActionsSticky} ${styles.bookingFlowActionsRow}`}
          >
            <Button type="button" className={styles.bookingBackButton} onClick={handleBack}>
              ← Go back
            </Button>
            <Button
              type="button"
              className={styles.bookingNextButton}
              onClick={handleContinue}
              disabled={!selectedService}
            >
              Next step →
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};
