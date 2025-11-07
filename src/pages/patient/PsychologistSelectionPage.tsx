import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '../../components/common/Layout/Layout';
import { psychologistService } from '../../services/api/psychologist';
import type { PsychologistProfile } from '../../services/api/psychologist';
import { authService } from '../../services/api/auth';
import styles from './PsychologistSelection.module.scss';

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
  
  // Get user data from auth service
  const user = authService.getStoredUser();

  // Fetch psychologists from backend
  useEffect(() => {
    const fetchPsychologists = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all psychologists - API service handles response format automatically
        const psychologistsData = await psychologistService.getAllPsychologists();
        
        // Transform backend data to frontend format
        const transformedData: Psychologist[] = psychologistsData.map((psych: PsychologistProfile) => ({
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
        console.log('Transformed psychologists:', transformedData);
      } catch (err) {
        console.error('Failed to load psychologists:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load psychologists. Please try again.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchPsychologists();
  }, []);

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
    
    // Store psychologist selection and navigate
    navigate(`/appointments/date-time?service=${selectedService}&psychologist=${selectedPsychologist}`);
  };

  const handleBack = () => {
    navigate('/appointments/book-appointment');
  };

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  return (
    <Layout 
      user={user}
      isAuthenticated={true}
      className={styles.patientLayout}
    >
      <div className={styles.psychologistSelectionContainer}>
        <div className="container">
          <div className={styles.pageHeader}>
            <button 
              className={styles.backButton}
              onClick={handleBack}
            >
              ← Back to Service Selection
            </button>
            <h1 className={styles.pageTitle}>Choose Your Psychologist</h1>
            <p className={styles.pageSubtitle}>
              All our psychologists are AHPRA registered and specialize in various areas.
            </p>
          </div>

          <div className={styles.filtersSection}>
            <h3 className={styles.filtersTitle}>Filter Psychologists:</h3>
            <div className={styles.filtersGrid}>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>🎯 Specialization:</label>
                <select 
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
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>👥 Gender:</label>
                <select 
                  className={styles.filterSelect}
                  value={filters.gender}
                  onChange={(e) => handleFilterChange('gender', e.target.value)}
                >
                  <option value="any">Any</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-binary</option>
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>📅 Availability:</label>
                <select 
                  className={styles.filterSelect}
                  value={filters.availability}
                  onChange={(e) => handleFilterChange('availability', e.target.value)}
                >
                  <option value="any">Any time</option>
                  <option value="this-week">This week</option>
                  <option value="next-week">Next week</option>
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>🎥 Session Type:</label>
                <select 
                  className={styles.filterSelect}
                  value={filters.sessionType}
                  onChange={(e) => handleFilterChange('sessionType', e.target.value)}
                >
                  <option value="both">Both</option>
                  <option value="in-person">In-person</option>
                  <option value="telehealth">Telehealth</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className={styles.loadingState}>
              <p>Loading psychologists...</p>
            </div>
          ) : error ? (
            <div className={styles.errorState}>
              <h3>⚠️ Unable to Load Psychologists</h3>
              <p>{error}</p>
              <button 
                className={styles.retryButton}
                onClick={() => window.location.reload()}
              >
                🔄 Retry
              </button>
            </div>
          ) : filteredPsychologists.length === 0 ? (
            <div className={styles.emptyState}>
              <h3>No psychologists match your criteria</h3>
              <p>Try adjusting your filters to see more options.</p>
            </div>
          ) : null}

          {!loading && !error && filteredPsychologists.length > 0 && (
            <div className={styles.psychologistsGrid}>
              {filteredPsychologists.map((psychologist) => (
              <div 
                key={psychologist.id}
                className={`${styles.psychologistCard} ${selectedPsychologist === psychologist.id ? styles.psychologistCardSelected : ''} ${!psychologist.acceptingNewPatients ? styles.psychologistCardUnavailable : ''}`}
                onClick={() => psychologist.acceptingNewPatients && handlePsychologistSelect(psychologist.id)}
              >
                <div className={styles.psychologistHeader}>
                  <div className={styles.psychologistProfile}>
                    <div className={styles.profilePicture}>
                      <img 
                        src={psychologist.profilePicture || '/default-psychologist.jpg'} 
                        alt={`${psychologist.name} profile`}
                        className={styles.profileImage}
                      />
                    </div>
                    <div className={styles.psychologistInfo}>
                      <h3 className={styles.psychologistName}>{psychologist.name}</h3>
                      <p className={styles.psychologistTitle}>{psychologist.title}</p>
                    </div>
                  </div>
                  <div className={styles.psychologistStatus}>
                    {psychologist.acceptingNewPatients ? (
                      <span className={styles.statusAvailable}>✅ Accepting new patients</span>
                    ) : (
                      <span className={styles.statusUnavailable}>❌ Not accepting new patients</span>
                    )}
                  </div>
                </div>

                <div className={styles.psychologistDetails}>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>📋 AHPRA:</span>
                    <span className={styles.detailValue}>{psychologist.ahpraNumber}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>🎓 Qualifications:</span>
                    <span className={styles.detailValue}>{psychologist.qualifications}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>⭐ Experience:</span>
                    <span className={styles.detailValue}>{psychologist.experience} years</span>
                  </div>
                </div>

                <div className={styles.specializationsSection}>
                  <h4 className={styles.specializationsTitle}>🎯 Specializations:</h4>
                  <div className={styles.specializationsList}>
                    {psychologist.specializations.map((spec) => (
                      <span key={spec.id} className={styles.specializationItem}>
                        {spec.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className={styles.psychologistBio}>
                  <h4 className={styles.bioTitle}>💬 About {psychologist.name.split(' ')[1]}:</h4>
                  <p className={styles.bioText}>"{psychologist.bio}"</p>
                </div>

                <div className={styles.availabilitySection}>
                  <div className={styles.availabilityRow}>
                    <span className={styles.availabilityLabel}>📅 Next available:</span>
                    <span className={styles.availabilityValue}>{psychologist.nextAvailable}</span>
                  </div>
                </div>

                {psychologist.acceptingNewPatients && (
                  <button 
                    className={`${styles.selectButton} ${selectedPsychologist === psychologist.id ? styles.selectButtonSelected : ''}`}
                  >
                    {selectedPsychologist === psychologist.id ? 'SELECTED' : 'SELECT'}
                  </button>
                )}
              </div>
              ))}
            </div>
          )}

          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={handleBack}
            >
              Back to Services
            </button>
            <button
              type="button"
              className={styles.continueButton}
              onClick={handleContinue}
              disabled={!selectedPsychologist}
            >
              Continue to Date & Time
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};
