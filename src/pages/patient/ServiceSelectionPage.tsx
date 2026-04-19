import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '../../components/common/Layout/Layout';
import { authService, type BookingReadinessResponse, type PatientReferralStatusResponse } from '../../services/api/auth';
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
import { BookingFlowTrustPanel } from '../../components/patient/BookingFlowTrustPanel/BookingFlowTrustPanel';
import { BookingBillingPathToggle } from '../../components/patient/BookingBillingPathToggle/BookingBillingPathToggle';
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

const BOOKING_BILLING_PATH_KEY = 'booking_billing_path';
const INITIAL_VISIBLE_SERVICES = 6;

export const ServiceSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const serviceFromUrl = searchParams.get('service');
  const [selectedService, setSelectedService] = useState<string | null>(serviceFromUrl);
  const [apiServices, setApiServices] = useState<APIService[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState<string | null>(null);
  const [serviceSearch, setServiceSearch] = useState('');
  const [bookingReadiness, setBookingReadiness] = useState<BookingReadinessResponse | null>(null);
  const [readinessLoading, setReadinessLoading] = useState(true);
  const [readinessError, setReadinessError] = useState<string | null>(null);
  const [referralStatus, setReferralStatus] = useState<PatientReferralStatusResponse | null>(null);
  const [referralLoading, setReferralLoading] = useState(false);
  const [referralFile, setReferralFile] = useState<File | null>(null);
  const [referralUploading, setReferralUploading] = useState(false);
  const [referralError, setReferralError] = useState<string | null>(null);
  const [referralSuccess, setReferralSuccess] = useState<string | null>(null);
  const [showAllServices, setShowAllServices] = useState(false);
  const [referralPrepExpanded, setReferralPrepExpanded] = useState(true);
  const referralPanelRef = useRef<HTMLDetailsElement | null>(null);
  const billingPathPanelRef = useRef<HTMLDivElement | null>(null);
  const [billingPath, setBillingPath] = useState<'medicare' | 'private'>(() => {
    const fromQuery = searchParams.get('billing_path');
    if (fromQuery === 'private' || fromQuery === 'medicare') return fromQuery;
    try {
      const fromStorage = sessionStorage.getItem(BOOKING_BILLING_PATH_KEY);
      if (fromStorage === 'private' || fromStorage === 'medicare') return fromStorage;
    } catch {
      /* ignore */
    }
    return 'medicare';
  });

  // Get user data from auth service
  const user = authService.getStoredUser();

  useEffect(() => {
    const bp = searchParams.get('billing_path');
    if (bp === 'medicare' || bp === 'private') {
      setBillingPath(bp);
    }
  }, [searchParams]);

  useEffect(() => {
    const focus = searchParams.get('focus');
    if (focus === 'referral') {
      const t = window.setTimeout(() => {
        referralPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
      return () => window.clearTimeout(t);
    }
    if (focus === 'billing') {
      setBillingPath('private');
      const t = window.setTimeout(() => {
        billingPathPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
      return () => window.clearTimeout(t);
    }
    return undefined;
  }, [searchParams]);

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
    const loadReferralStatus = async () => {
      try {
        setReferralLoading(true);
        setReadinessLoading(true);
        setReadinessError(null);
        const readiness = await authService.getBookingReadiness({ billing_path: billingPath });
        setBookingReadiness(readiness);
        if (billingPath !== 'medicare') {
          setReferralStatus(null);
          return;
        }
        const status = await authService.getReferralStatus();
        setReferralStatus(status);
      } catch (err: any) {
        const message = err.message || 'Could not load booking readiness';
        setReadinessError(message);
        setReferralError(message);
      } finally {
        setReferralLoading(false);
        setReadinessLoading(false);
      }
    };
    loadReferralStatus();
  }, [billingPath]);

  // Transform API services to display format (fees/rebates from `GET /api/services/` — admin-maintained)
  const services: Service[] = apiServices.map(apiService => {
    const standardFee = parseFloat(apiService.standard_fee) || 0;
    const medicareRebate = parseFloat(apiService.medicare_rebate ?? '0') || 0;
    const oopRaw = apiService.out_of_pocket_cost;
    const yourCost =
      oopRaw !== undefined && oopRaw !== null && oopRaw !== ''
        ? Math.max(0, parseFloat(String(oopRaw)) || 0)
        : Math.max(0, standardFee - medicareRebate);

    return {
      id: apiService.id.toString(), // Convert to string for comparison with selectedService
      name: apiService.name,
      duration: apiService.duration_minutes,
      standardFee: standardFee,
      medicareRebate: medicareRebate,
      yourCost: yourCost,
      medicareApplicable: medicareRebate > 0,
      specializations: [], // TODO: expose from backend when ServiceSerializer includes specializations
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
  const referralNeedsAttention =
    billingPath === 'medicare' &&
    (referralLoading ||
      !referralStatus ||
      (referralStatus.status !== 'verified' && !referralStatus.has_uploaded_referral));
  const visibleServices = showAllServices
    ? filteredServices
    : filteredServices.slice(0, INITIAL_VISIBLE_SERVICES);
  const canToggleServices = filteredServices.length > INITIAL_VISIBLE_SERVICES;

  useEffect(() => {
    if (serviceSearch.trim()) {
      setShowAllServices(true);
      return;
    }
    setShowAllServices(false);
  }, [serviceSearch]);

  useEffect(() => {
    setReferralPrepExpanded(referralNeedsAttention);
  }, [referralNeedsAttention]);

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

    if (billingPath === 'medicare') {
      if (bookingReadiness && !bookingReadiness.is_ready_to_continue) {
        const recovery = bookingReadiness.actions.next;
        if (recovery) {
          navigate(recovery);
          return;
        }
        alert('Please complete required Medicare readiness steps before continuing.');
        return;
      }
    }

    // Check if telehealth consent is required
    const requiresTelehealth = selectedServiceMeta.name.toLowerCase().includes('telehealth') || 
                               selectedServiceMeta.name.toLowerCase().includes('video');
    
    if (
      requiresTelehealth &&
      (!bookingReadiness || !bookingReadiness.telehealth_consent_complete)
    ) {
      navigate(
        bookingReadiness?.actions.telehealth_consent ?? '/patient/account?tab=privacy'
      );
      return;
    }
    
    // ✅ Navigate directly to wizard step 2
    try {
      sessionStorage.setItem(BOOKING_BILLING_PATH_KEY, billingPath);
    } catch {
      /* ignore */
    }
    navigate(`/appointments/book-appointment?step=2&service=${serviceId}&billing_path=${billingPath}`);
  };

  const handleUploadReferral = async () => {
    if (!referralFile) {
      setReferralError('Please choose a referral file first.');
      return;
    }
    try {
      setReferralUploading(true);
      setReferralError(null);
      setReferralSuccess(null);
      await authService.uploadReferralDocument({
        file: referralFile,
        has_gp_referral: true,
      });
      setReferralSuccess('Referral uploaded. You can continue booking while admin review is pending.');
      setReferralFile(null);
      const [status, readiness] = await Promise.all([
        authService.getReferralStatus(),
        authService.getBookingReadiness({ billing_path: billingPath }),
      ]);
      setReferralStatus(status);
      setBookingReadiness(readiness);
    } catch (err: any) {
      setReferralError(err.message || 'Failed to upload referral.');
    } finally {
      setReferralUploading(false);
    }
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
                <span className={styles.bookingFlowKicker}>Book a session · Step 1 of 5</span>
                <h1 className={styles.bookingFlowHeroTitle}>How can we help today?</h1>
                <p className={styles.bookingFlowHeroLead}>
                  Pick the kind of session that matches what you need right now. You will see duration and an estimated
                  gap payment based on our listed fees and rebates; final amounts and Medicare eligibility depend on your
                  situation and current Medicare rules.
                </p>
              </div>

              <div className={styles.bookingFlowDecisionStack}>
                <BookingFlowTrustPanel variant="service" />
                <BookingBillingPathToggle
                  ref={billingPathPanelRef}
                  value={billingPath}
                  onChange={setBillingPath}
                />
              </div>

              {billingPath === 'medicare' && (
                <details
                  ref={referralPanelRef}
                  className={styles.bookingReferralPanel}
                  open={referralPrepExpanded}
                  onToggle={(event) => setReferralPrepExpanded((event.currentTarget as HTMLDetailsElement).open)}
                >
                  <summary className={styles.bookingReferralSummary}>
                    <span>Referral / MHTP upload</span>
                    <span className={`${styles.bookingReferralBadge} ${
                      referralStatus?.status === 'verified'
                        ? styles.bookingReferralVerified
                        : referralStatus?.has_uploaded_referral
                          ? styles.bookingReferralPending
                          : styles.bookingReferralMissing
                    }`}>
                      {referralLoading ? 'Checking...' : referralStatus?.status || 'missing'}
                    </span>
                  </summary>
                  <div className={styles.bookingReferralBody}>
                    <p className={styles.bookingReferralHint}>
                      Upload your GP referral or mental health treatment plan now, or add it during intake.
                    </p>
                    <div className={styles.bookingReferralActions}>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/*"
                        className={styles.bookingReferralFileInput}
                        onChange={(e) => setReferralFile(e.target.files?.[0] || null)}
                      />
                      <Button
                        type="button"
                        className={styles.bookingReferralButton}
                        onClick={handleUploadReferral}
                        disabled={referralUploading}
                      >
                        {referralUploading ? 'Uploading…' : 'Upload referral'}
                      </Button>
                      <Button
                        type="button"
                        className={styles.bookingReferralButton}
                        onClick={() => navigate('/patient/setup?step=referral')}
                      >
                        Open setup referral step
                      </Button>
                    </div>
                    {referralError && <p className={styles.bookingReferralError}>{referralError}</p>}
                    {referralSuccess && <p className={styles.bookingReferralSuccess}>{referralSuccess}</p>}
                  </div>
                </details>
              )}
            </div>

          {!readinessLoading && bookingReadiness && !bookingReadiness.telehealth_consent_complete && (
            <div className={styles.telehealthWarning}>
              <div>
                <h3>Telehealth consent pending</h3>
                <p>
                  Complete the telehealth consent form before booking a telehealth session. This ensures we have an
                  emergency contact and plan on file.
                </p>
                {readinessError && <p className={styles.placeholderSubtext}>{readinessError}</p>}
              </div>
              <Button className={styles.bookingReferralButton} onClick={() => navigate('/patient/account?tab=privacy')}>
                Update Consent
              </Button>
            </div>
          )}

          <div className={styles.bookingFlowServicesSection}>
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
          ) : (
            <>
              <div className={styles.bookingFlowServicesHeadingRow}>
                <div className={styles.bookingFlowServicesHeadingMain}>
                  <h2 className={styles.bookingFlowServicesSectionTitle}>Choose a session type</h2>
                  <p className={styles.bookingFlowServicesCount}>
                    {serviceSearch.trim()
                      ? `Showing ${filteredServices.length} of ${services.length}`
                      : `${filteredServices.length} available`}
                  </p>
                </div>
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
              </div>

              {filteredServices.length === 0 ? (
                <div className={styles.errorState}>
                  <h3>No matching services</h3>
                  <p>Try a different search term or clear the search to see all services.</p>
                  <Button type="button" className={styles.actionButton} onClick={() => setServiceSearch('')}>
                    Clear search
                  </Button>
                </div>
              ) : (
                <>
                  <div className={`${styles.servicesGrid} ${styles.bookingFlowCanvas}`} id="services-grid">
                    {visibleServices.map((service, index) => {
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
                            {service.duration} min · Est. gap ${service.yourCost.toFixed(2)}
                            {service.medicareApplicable ? ' · indicative Medicare rebate on file' : ''}
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
                  {!servicesLoading && !servicesError && filteredServices.length > 0 && canToggleServices && (
                    <div className={styles.servicesDisclosureRow}>
                      <Button
                        type="button"
                        className={styles.bookingBackButton}
                        onClick={() => setShowAllServices((prev) => !prev)}
                        aria-expanded={showAllServices}
                        aria-controls="services-grid"
                      >
                        {showAllServices
                          ? 'Show fewer services'
                          : `Show all ${filteredServices.length} services`}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
          </div>

          <div className={`${styles.helpStrip} ${styles.bookingFlowCanvas}`}>
            <InfoIcon size="sm" aria-hidden />
            <span>
              Not sure which service is right for you? You may be eligible for Medicare rebates with a valid Mental
              Health Treatment Plan from your GP—your clinician can confirm.{' '}
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
