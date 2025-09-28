import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '../../components/common/Layout/Layout';
import styles from './PsychologistSelection.module.scss';

interface Psychologist {
  id: string;
  name: string;
  title: string;
  ahpraNumber: string;
  qualifications: string;
  experience: number;
  specializations: string[];
  bio: string;
  acceptingNewPatients: boolean;
  nextAvailable: string;
  gender: 'male' | 'female' | 'non-binary';
  sessionTypes: ('in-person' | 'telehealth')[];
}

export const PsychologistSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedService = searchParams.get('service');
  const [selectedPsychologist, setSelectedPsychologist] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    specialization: 'all',
    gender: 'any',
    availability: 'any',
    sessionType: 'both'
  });
  
  // TODO: Get user data from Redux store
  const mockUser = {
    id: 1,
    first_name: 'John',
    full_name: 'John Smith',
    role: 'patient' as const,
    email: 'john@example.com',
    last_name: 'Smith',
    is_verified: true,
    created_at: '2024-01-01'
  };

  // TODO: Fetch psychologists from Django backend API
  // TODO: Filter psychologists by service type and availability
  // TODO: Implement psychologist search and filtering
  // TODO: Add psychologist availability checking
  // TODO: Implement psychologist rating and review system

  const psychologists: Psychologist[] = [
    {
      id: 'dr-sarah-johnson',
      name: 'Dr. Sarah Johnson',
      title: 'Clinical Psychologist',
      ahpraNumber: 'PSY0001234567',
      qualifications: 'M.Psych (Clinical), B.Psych (Hons)',
      experience: 8,
      specializations: ['Anxiety & Panic Disorders', 'Depression & Mood Disorders', 'Trauma & PTSD', 'Mindfulness-Based Therapy'],
      bio: 'I believe in creating a safe, non-judgmental space where clients can explore their thoughts and feelings while developing practical coping strategies.',
      acceptingNewPatients: true,
      nextAvailable: 'Tomorrow, 2:00 PM',
      gender: 'female',
      sessionTypes: ['in-person', 'telehealth']
    },
    {
      id: 'dr-michael-chen',
      name: 'Dr. Michael Chen',
      title: 'Clinical Psychologist',
      ahpraNumber: 'PSY0001234568',
      qualifications: 'M.Psych (Clinical), Ph.D Psychology',
      experience: 12,
      specializations: ['ADHD & Learning Difficulties', 'Autism Spectrum Disorders', 'Cognitive Behavioral Therapy', 'Family Therapy'],
      bio: 'I use evidence-based approaches tailored to each individual\'s unique needs and circumstances.',
      acceptingNewPatients: true,
      nextAvailable: 'Friday, 10:00 AM',
      gender: 'male',
      sessionTypes: ['in-person', 'telehealth']
    },
    {
      id: 'dr-emma-wilson',
      name: 'Dr. Emma Wilson',
      title: 'Clinical Psychologist',
      ahpraNumber: 'PSY0001234569',
      qualifications: 'M.Psych (Clinical), B.Psych (Hons)',
      experience: 6,
      specializations: ['Relationship Issues', 'Couples Therapy', 'Communication Skills', 'Conflict Resolution'],
      bio: 'I specialize in helping individuals and couples build stronger, more meaningful relationships through evidence-based therapeutic approaches.',
      acceptingNewPatients: true,
      nextAvailable: 'Monday, 3:00 PM',
      gender: 'female',
      sessionTypes: ['in-person', 'telehealth']
    },
    {
      id: 'dr-james-martinez',
      name: 'Dr. James Martinez',
      title: 'Clinical Psychologist',
      ahpraNumber: 'PSY0001234570',
      qualifications: 'M.Psych (Clinical), Ph.D Psychology',
      experience: 15,
      specializations: ['Trauma & PTSD', 'Grief & Loss', 'Substance Use Disorders', 'EMDR Therapy'],
      bio: 'With extensive experience in trauma recovery, I help clients process difficult experiences and build resilience for the future.',
      acceptingNewPatients: false,
      nextAvailable: 'Currently not accepting new patients',
      gender: 'male',
      sessionTypes: ['in-person', 'telehealth']
    }
  ];

  const filteredPsychologists = psychologists.filter(psychologist => {
    if (filters.specialization !== 'all' && !psychologist.specializations.some(spec => 
      spec.toLowerCase().includes(filters.specialization.toLowerCase())
    )) return false;
    
    if (filters.gender !== 'any' && psychologist.gender !== filters.gender) return false;
    
    if (filters.sessionType !== 'both' && !psychologist.sessionTypes.includes(filters.sessionType as 'in-person' | 'telehealth')) return false;
    
    if (filters.availability === 'this-week' && psychologist.nextAvailable.includes('Currently not')) return false;
    
    return true;
  });

  const handlePsychologistSelect = (psychologistId: string) => {
    setSelectedPsychologist(psychologistId);
  };

  const handleContinue = () => {
    if (!selectedPsychologist) {
      alert('Please select a psychologist to continue.');
      return;
    }
    
    // TODO: Validate psychologist selection with backend
    // TODO: Check psychologist availability for selected service
    // TODO: Store psychologist selection in Redux store
    // TODO: Log psychologist selection for analytics
    // TODO: Check if psychologist is available for the selected service type
    
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
      user={mockUser} 
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

          <div className={styles.psychologistsGrid}>
            {filteredPsychologists.map((psychologist) => (
              <div 
                key={psychologist.id}
                className={`${styles.psychologistCard} ${selectedPsychologist === psychologist.id ? styles.psychologistCardSelected : ''} ${!psychologist.acceptingNewPatients ? styles.psychologistCardUnavailable : ''}`}
                onClick={() => psychologist.acceptingNewPatients && handlePsychologistSelect(psychologist.id)}
              >
                <div className={styles.psychologistHeader}>
                  <div className={styles.psychologistInfo}>
                    <h3 className={styles.psychologistName}>{psychologist.name}</h3>
                    <p className={styles.psychologistTitle}>{psychologist.title}</p>
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
                    {psychologist.specializations.map((spec, index) => (
                      <div key={index} className={styles.specializationItem}>
                        • {spec}
                      </div>
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
