import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '../../components/common/Layout/Layout';
import { psychologistService } from '../../services/api/psychologist';
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
  parseMatchPreferences,
} from '../../constants/matchPreferences';
import styles from './PsychologistSelection.module.scss';
import bookingFlow from './PatientPages.module.scss';
import { BookingFlowProgress } from '../../components/patient/BookingFlowProgress/BookingFlowProgress';
import { BookingFlowTrustPanel } from '../../components/patient/BookingFlowTrustPanel/BookingFlowTrustPanel';

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
  const appliedMatchPrefs = useRef(false);

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
      setFilters((prev) => ({
        ...prev,
        specialization: prefs.specialization,
        sessionType: prefs.sessionType,
        gender: prefs.gender,
        availability: prefs.availability,
      }));
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
              </div>
            </aside>

            <main className={styles.bookingMainCanvas}>
              <header className={styles.editorialHeader}>
                <p className={styles.stepKicker}>Step 2 of 5</p>
                <h1 className={styles.editorialTitle}>Choose your psychologist</h1>
                <p className={styles.editorialLead}>
                  Read a short bio, check specialties, and choose someone who feels like a fit—every profile is an
                  AHPRA-registered clinician.
                </p>
              </header>

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
            <div className={styles.psychologistsGrid}>
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
