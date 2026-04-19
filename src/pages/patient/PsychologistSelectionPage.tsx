import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '../../components/common/Layout/Layout';
import { psychologistService } from '../../services/api/psychologist';
import { appointmentsService } from '../../services/api/appointments';
import type { PsychologistProfile } from '../../services/api/psychologist';
import { authService } from '../../services/api/auth';
import {
  ChartIcon,
  UsersIcon,
  CalendarIcon,
  VideoIcon,
  WarningIcon,
  CheckCircleIcon,
  ErrorCircleIcon,
} from '../../utils/icons';
import { Button } from '../../components/ui/button';
import { Select } from '../../components/ui/select';
import {
  MATCH_PREFERENCES_STORAGE_KEY,
  MATCH_STEP_STORAGE_KEY,
  parseMatchPreferences,
} from '../../constants/matchPreferences';
import styles from './PsychologistSelection.module.scss';
import bookingFlow from './PatientPages.module.scss';
import { BookingFlowProgress } from '../../components/patient/BookingFlowProgress/BookingFlowProgress';
import { BookingFlowTrustPanel } from '../../components/patient/BookingFlowTrustPanel/BookingFlowTrustPanel';
import { trackWizardEvent } from '../../services/analytics/wizardTelemetry';

interface Psychologist {
  id: number;
  name: string;
  title: string;
  ahpraNumber: string;
  qualifications: string;
  experience: number;
  specializations: Array<{ id: number; name: string; description: string }>;
  bio: string;
  acceptingNewPatients: boolean;
  nextAvailable: string;
  gender: string;
  sessionTypes: string[];
  profilePicture?: string;
  telehealthAvailable: boolean;
  inPersonAvailable: boolean;
  consultationFee: string;
  patientCostAfterRebate: string;
  averageRating: string;
  totalReviews: number;
}

export const PsychologistSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedService = searchParams.get('service');
  const billingPath =
    searchParams.get('billing_path') === 'medicare' || searchParams.get('billing_path') === 'private'
      ? (searchParams.get('billing_path') as 'medicare' | 'private')
      : 'unknown';
  const psychologistFromUrl = searchParams.get('psychologist');
  const [selectedPsychologist, setSelectedPsychologist] = useState<number | null>(
    psychologistFromUrl ? parseInt(psychologistFromUrl) : null
  );
  const [psychologists, setPsychologists] = useState<Psychologist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    specialization: 'all',
    gender: 'any',
    availability: 'any',
    sessionType: 'both'
  });
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const appliedMatchPrefs = useRef(false);
  const [recommendationLoading, setRecommendationLoading] = useState(false);
  const [recommendationError, setRecommendationError] = useState<string | null>(null);

  // Get user data from auth service
  const user = authService.getStoredUser();

  // Apply one-time filters from public "Get matched" wizard
  useEffect(() => {
    if (appliedMatchPrefs.current || typeof window === 'undefined') return;
    try {
      const raw = sessionStorage.getItem(MATCH_PREFERENCES_STORAGE_KEY);
      const prefs = parseMatchPreferences(raw);
      if (!prefs) return;
      appliedMatchPrefs.current = true;
      sessionStorage.removeItem(MATCH_PREFERENCES_STORAGE_KEY);
      sessionStorage.removeItem(MATCH_STEP_STORAGE_KEY);
      setFilters((prev) => ({
        ...prev,
        specialization: prefs.specialization,
        sessionType: prefs.sessionType,
        gender: prefs.gender,
        availability: prefs.availability,
      }));
      if (prefs.gender !== 'any' || prefs.availability !== 'any') {
        setFiltersExpanded(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Fetch psychologists from backend
  useEffect(() => {
    // Don't fetch if no service is selected (will redirect)
    if (!selectedService) {
      return;
    }

    const fetchPsychologists = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all psychologists - API service handles response format automatically
        const psychologistsData = await psychologistService.getAllPsychologists();

        const psychologistsWithProfiles = psychologistsData.filter((psych: PsychologistProfile) => {
          const hasProfile =
            psych.ahpra_registration_number &&
            psych.ahpra_registration_number.trim() !== '' &&
            psych.is_active_practitioner !== false;
          return hasProfile;
        });

        // Transform backend data to frontend format
        const transformedData: Psychologist[] = psychologistsWithProfiles.map((psych: PsychologistProfile) => ({
          id: psych.id,
          name: psych.display_name,
          title: psych.title,
          ahpraNumber: psych.ahpra_registration_number,
          qualifications: psych.qualifications,
          experience: psych.years_experience,
          specializations: Array.isArray(psych.specializations_list) 
            ? psych.specializations_list 
            : [],
          bio: psych.bio,
          acceptingNewPatients: psych.is_accepting_new_patients,
          nextAvailable: formatNextAvailable(psych.next_available_slot || null),
          gender: psych.user_gender || 'not-specified',
          sessionTypes: psych.session_types_list || [],
          profilePicture: psych.profile_image_url || undefined,
          telehealthAvailable: psych.telehealth_available,
          inPersonAvailable: psych.in_person_available,
          consultationFee: psych.consultation_fee,
          patientCostAfterRebate: psych.patient_cost_after_rebate,
          averageRating: psych.average_rating,
          totalReviews: psych.total_reviews
        }));
        
        setPsychologists(transformedData);
      } catch (err) {
        console.error('Failed to load psychologists:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load psychologists. Please try again.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchPsychologists();
  }, [selectedService]);

  // Format next available slot for display
  const formatNextAvailable = (isoDate: string | null): string => {
    if (!isoDate) return 'No availability shown';
    
    try {
      const date = new Date(isoDate);
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      if (date.toDateString() === today.toDateString()) {
        return `Today, ${date.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
      } else if (date.toDateString() === tomorrow.toDateString()) {
        return `Tomorrow, ${date.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
      } else {
        return date.toLocaleDateString('en-AU', { 
          weekday: 'long',
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
      }
    } catch (error) {
      return 'Check availability';
    }
  };


  const filteredPsychologists = psychologists.filter(psychologist => {
    // Specialization filter
    if (filters.specialization !== 'all') {
      const hasSpecialization = psychologist.specializations.some(spec => 
        spec.name.toLowerCase().includes(filters.specialization.toLowerCase())
      );
      if (!hasSpecialization) return false;
    }
    
    // Gender filter
    if (filters.gender !== 'any' && psychologist.gender !== filters.gender) return false;
    
    // Session type filter
    if (filters.sessionType === 'in-person' && !psychologist.inPersonAvailable) return false;
    if (filters.sessionType === 'telehealth' && !psychologist.telehealthAvailable) return false;
    
    // Availability filter
    if (filters.availability === 'this-week' && !psychologist.acceptingNewPatients) return false;
    
    return true;
  });

  const handlePsychologistSelect = (psychologistId: number) => {
    setSelectedPsychologist(psychologistId);
  };

  const handleContinue = () => {
    if (!selectedPsychologist) {
      alert('Please select a psychologist to continue.');
      return;
    }

    if (!selectedService) {
      navigate('/appointments/book-appointment', { replace: true });
      return;
    }

    navigate(
      `/appointments/book-appointment?step=3&service=${selectedService}&psychologist=${selectedPsychologist}`
    );
  };

  const sessionTypeForRecommendation = (): 'telehealth' | 'in_person' | 'both' | undefined => {
    if (filters.sessionType === 'telehealth') return 'telehealth';
    if (filters.sessionType === 'in-person') return 'in_person';
    return 'both';
  };

  const handleContinueWithRecommended = async () => {
    if (!selectedService) return;
    const serviceIdNum = parseInt(selectedService, 10);
    if (Number.isNaN(serviceIdNum) || serviceIdNum <= 0) {
      setRecommendationError('Could not determine the selected service. Go back to step 1 and pick a service.');
      return;
    }
    setRecommendationLoading(true);
    setRecommendationError(null);
    try {
      const st = sessionTypeForRecommendation();
      const data = await appointmentsService.getBookingRecommendation({
        serviceId: serviceIdNum,
        sessionType: st,
      });
      const rec = data.recommendation;
      if (!rec) {
        setRecommendationError(
          data.reason_code === 'no_offering_clinicians'
            ? 'No clinicians are available for that service right now. Try again later or browse the list below.'
            : 'No open appointments in the next booking window. Pick a psychologist below to see their calendar.'
        );
        trackWizardEvent({
          event_name: 'wizard_recommended_selected',
          step_id: 'step_2',
          billing_path: billingPath,
          metadata: { ok: false, reason: data.reason_code ?? 'unknown' },
        });
        return;
      }
      const params = new URLSearchParams({
        step: '3',
        service: selectedService,
        psychologist: String(rec.psychologist_id),
        slot_id: String(rec.time_slot_id),
        booking_session_type: rec.session_type,
      });
      const bp = searchParams.get('billing_path');
      if (bp === 'medicare' || bp === 'private') {
        params.set('billing_path', bp);
      }
      trackWizardEvent({
        event_name: 'wizard_recommended_selected',
        step_id: 'step_2',
        billing_path: billingPath,
        metadata: { ok: true, psychologist_id: rec.psychologist_id, time_slot_id: rec.time_slot_id },
      });
      navigate(`/appointments/book-appointment?${params.toString()}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Something went wrong. Try again or browse psychologists below.';
      setRecommendationError(msg);
      trackWizardEvent({
        event_name: 'wizard_recommended_selected',
        step_id: 'step_2',
        billing_path: billingPath,
        metadata: { ok: false, error: msg },
      });
    } finally {
      setRecommendationLoading(false);
    }
  };

  const handleBrowseAllPsychologists = () => {
    trackWizardEvent({
      event_name: 'wizard_manual_mode_enabled',
      step_id: 'step_2',
      billing_path: billingPath,
      metadata: { source: 'browse_all_button' },
    });
    document.getElementById('booking-psychologist-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleBack = () => {
    navigate('/appointments/book-appointment?step=1', { replace: true });
  };

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  if (!selectedService) {
    return (
      <Layout user={user} isAuthenticated={true} patientShell className={bookingFlow.patientLayout}>
        <div className={styles.psychologistSelectionContainer} data-patient-booking-viewport="">
          <div className="container">
            <BookingFlowProgress currentStep={2} />
            <div className={styles.pageHeader}>
              <span className={bookingFlow.bookingFlowKicker}>Book a session · Step 2 of 5</span>
              <h1 className={styles.pageTitle}>Service selection required</h1>
              <p className={styles.pageSubtitle}>Please select a service before choosing a psychologist.</p>
            </div>
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <Button
                type="button"
                className={styles.continueButton}
                onClick={() => navigate('/appointments/book-appointment?step=1', { replace: true })}
              >
                Go to service selection
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user} isAuthenticated={true} patientShell className={bookingFlow.patientLayout}>
      <div className={styles.psychologistSelectionContainer} data-patient-booking-viewport="">
        <div className="container">
          <BookingFlowProgress currentStep={2} />
          <div className={styles.bookingSplit}>
            <aside className={styles.bookingSidebar} aria-label="Filters">
              <Button type="button" className={styles.backButton} onClick={handleBack}>
                ← Back to service selection
              </Button>
              <div className={styles.filtersSection}>
                <h3 className={styles.filtersTitle}>Filter psychologists</h3>
                <div className={styles.filtersGrid}>
                  <div className={styles.filterGroup}>
                    <label className={styles.filterLabel}><ChartIcon size="sm" style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Specialization:</label>
                    <Select
                      className={styles.filterSelect}
                      value={filters.specialization}
                      onChange={(e) => handleFilterChange('specialization', e.target.value)}
                    >
                      <option value="all">All</option>
                      <option value="anxiety">Anxiety</option>
                      <option value="depression">Depression</option>
                      <option value="trauma">Trauma</option>
                      <option value="adhd">ADHD</option>
                      <option value="relationship">Relationship</option>
                    </Select>
                  </div>
                  <div className={styles.filterGroup}>
                    <label className={styles.filterLabel}><VideoIcon size="sm" style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Session Type:</label>
                    <Select
                      className={styles.filterSelect}
                      value={filters.sessionType}
                      onChange={(e) => handleFilterChange('sessionType', e.target.value)}
                    >
                      <option value="both">Both</option>
                      <option value="in-person">In-person</option>
                      <option value="telehealth">Telehealth</option>
                    </Select>
                  </div>
                </div>
                <Button
                  type="button"
                  className={styles.moreFiltersButton}
                  aria-expanded={filtersExpanded}
                  onClick={() => {
                    const nextExpanded = !filtersExpanded;
                    setFiltersExpanded(nextExpanded);
                    trackWizardEvent({
                      event_name: 'wizard_filter_expanded',
                      step_id: 'step_2',
                      billing_path: billingPath,
                      metadata: { expanded: nextExpanded },
                    });
                  }}
                >
                  {filtersExpanded ? 'Hide extra filters' : 'More filters'}
                </Button>
                {filtersExpanded && (
                  <div className={styles.filtersGrid} aria-label="Additional filters">
                    <div className={styles.filterGroup}>
                      <label className={styles.filterLabel}><UsersIcon size="sm" style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Gender:</label>
                      <Select
                        className={styles.filterSelect}
                        value={filters.gender}
                        onChange={(e) => handleFilterChange('gender', e.target.value)}
                      >
                        <option value="any">Any</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="non-binary">Non-binary</option>
                      </Select>
                    </div>

                    <div className={styles.filterGroup}>
                      <label className={styles.filterLabel}><CalendarIcon size="sm" style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Availability:</label>
                      <Select
                        className={styles.filterSelect}
                        value={filters.availability}
                        onChange={(e) => handleFilterChange('availability', e.target.value)}
                      >
                        <option value="any">Any time</option>
                        <option value="this-week">This week</option>
                        <option value="next-week">Next week</option>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            </aside>

            <main className={styles.bookingMainCanvas}>
              <header className={styles.editorialHeader}>
                <span className={bookingFlow.bookingFlowKicker}>Book a session · Step 2 of 5</span>
                <h1 className={styles.editorialTitle}>Choose your psychologist</h1>
                <p className={styles.editorialLead}>
                  Read a short bio, check specialties, and choose someone who feels like a fit—every profile is an
                  AHPRA-registered clinician.
                </p>
                <p className={styles.editorialHint}>You can change your clinician before you confirm payment.</p>
              </header>

              {selectedService ? (
                <section className={styles.recommendedPathCard} aria-labelledby="recommended-path-heading">
                  <h2 id="recommended-path-heading" className={styles.recommendedPathTitle}>
                    Prefer the fastest path?
                  </h2>
                  <p className={styles.recommendedPathLead}>
                    Skip browsing—we&apos;ll send you to the earliest bookable time with a clinician who offers this
                    service.
                  </p>
                  <div className={styles.recommendedPathActions}>
                    <Button
                      type="button"
                      className={styles.continueButton}
                      disabled={recommendationLoading || !!loading}
                      onClick={() => void handleContinueWithRecommended()}
                    >
                      {recommendationLoading ? 'Finding earliest…' : 'Continue with first available'}
                    </Button>
                    <Button
                      type="button"
                      className={styles.cancelButton}
                      onClick={handleBrowseAllPsychologists}
                    >
                      Browse all psychologists
                    </Button>
                  </div>
                  {recommendationError ? (
                    <p className={styles.recommendedPathError} role="alert">
                      {recommendationError}
                    </p>
                  ) : null}
                </section>
              ) : null}

              <BookingFlowTrustPanel variant="psychologist" wide className={styles.bookingTrustPanel} />

          {loading ? (
            <div className={styles.loadingState}>
              <p>Loading psychologists...</p>
            </div>
          ) : error ? (
            <div className={styles.errorState}>
              <h3><WarningIcon size="md" style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Unable to Load Psychologists</h3>
              <p>{error}</p>
              <Button
                className={styles.retryButton}
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          ) : filteredPsychologists.length === 0 ? (
            <div className={styles.emptyState}>
              <h3>No psychologists match your criteria</h3>
              <p>Try adjusting your filters to see more options.</p>
            </div>
          ) : null}

          {!loading && !error && filteredPsychologists.length > 0 && (
            <div id="booking-psychologist-grid" className={styles.psychologistsGrid}>
              {filteredPsychologists.map((psychologist) => {
                const isSelected = selectedPsychologist === psychologist.id;
                return (
                  <div
                    key={psychologist.id}
                    role="button"
                    tabIndex={psychologist.acceptingNewPatients ? 0 : -1}
                    className={`${styles.psychologistCard} ${isSelected ? styles.psychologistCardSelected : ''} ${!psychologist.acceptingNewPatients ? styles.psychologistCardUnavailable : ''}`}
                    onClick={() => psychologist.acceptingNewPatients && handlePsychologistSelect(psychologist.id)}
                    onKeyDown={(e) => {
                      if ((e.key === 'Enter' || e.key === ' ') && psychologist.acceptingNewPatients) {
                        e.preventDefault();
                        handlePsychologistSelect(psychologist.id);
                      }
                    }}
                    aria-pressed={isSelected}
                  >
                    {/* Avatar */}
                    <div className={styles.psychologistAvatarWrap} aria-hidden>
                      <img
                        src={psychologist.profilePicture || '/default-psychologist.jpg'}
                        alt=""
                        className={styles.profileImage}
                      />
                    </div>

                    {/* Name + title + tags */}
                    <div className={styles.psychologistMeta}>
                      <div className={styles.psychologistMetaTop}>
                        <span className={styles.psychologistName}>{psychologist.name}</span>
                        {!psychologist.acceptingNewPatients && (
                          <span className={styles.psychologistTag}>
                            <ErrorCircleIcon size="sm" aria-hidden /> Unavailable
                          </span>
                        )}
                      </div>
                      <span className={styles.psychologistTitle}>{psychologist.title}</span>
                      <span className={styles.psychologistMetaSub}>
                        {psychologist.experience} years experience · AHPRA {psychologist.ahpraNumber}
                      </span>
                      {psychologist.specializations.length > 0 && (
                        <div className={styles.psychologistMetaTags}>
                          {psychologist.specializations.slice(0, 3).map((spec) => (
                            <span key={spec.id} className={styles.psychologistTag}>{spec.name}</span>
                          ))}
                        </div>
                      )}
                      {psychologist.bio && (
                        <p className={styles.psychologistBioSnippet}>{psychologist.bio}</p>
                      )}
                      <span className={styles.psychologistAvailability}>
                        <CalendarIcon size="sm" aria-hidden />
                        {psychologist.nextAvailable}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className={styles.cardActions}>
                      {psychologist.acceptingNewPatients && (
                        <Button
                          type="button"
                          className={`${styles.selectButton} ${isSelected ? styles.selectButtonSelected : ''}`}
                          tabIndex={-1}
                          aria-hidden
                        >
                          {isSelected ? (
                            <><CheckCircleIcon size="sm" aria-hidden /> Selected</>
                          ) : (
                            'Select'
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
            </main>
          </div>

          <div
            className={`${bookingFlow.formActions} ${bookingFlow.formActionsSticky} ${bookingFlow.bookingFlowActionsRow}`}
          >
            <Button
              type="button"
              className={bookingFlow.bookingBackButton}
              onClick={handleBack}
            >
              ← Back to Services
            </Button>
            <Button
              type="button"
              className={bookingFlow.bookingNextButton}
              onClick={handleContinue}
              disabled={!selectedPsychologist}
            >
              Continue to Date & Time →
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};
