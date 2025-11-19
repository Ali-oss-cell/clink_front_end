import { Link } from 'react-router-dom';
import { Layout } from '../../components/common/Layout/Layout';
import { 
  StethoscopeIcon, 
  UsersIcon, 
  VideoIcon, 
  HospitalIcon,
  CheckCircleIcon,
  ClockIcon,
  DollarIcon
} from '../../utils/icons';
import styles from './ServicesPage.module.scss';

interface Service {
  id: string;
  name: string;
  description: string;
  duration: string;
  price: string;
  medicareRebate?: string;
  features: string[];
  icon: React.ReactNode;
  available: 'in-person' | 'telehealth' | 'both';
}

const services: Service[] = [
  {
    id: 'individual-therapy',
    name: 'Individual Therapy',
    description: 'One-on-one therapy sessions with a registered psychologist. Personalized treatment plans tailored to your unique needs and goals.',
    duration: '50 minutes',
    price: '$180',
    medicareRebate: '$87.45 rebate available',
    features: [
      'Anxiety & Depression',
      'Stress Management',
      'Life Transitions',
      'Trauma & PTSD',
      'Grief & Loss'
    ],
    icon: <StethoscopeIcon size="xl" />,
    available: 'both'
  },
  {
    id: 'couples-therapy',
    name: 'Couples Therapy',
    description: 'Joint therapy sessions for couples working on relationship issues. Improve communication, resolve conflicts, and strengthen your bond.',
    duration: '60 minutes',
    price: '$220',
    features: [
      'Relationship Issues',
      'Communication Skills',
      'Conflict Resolution',
      'Intimacy & Connection',
      'Pre-marital Counseling'
    ],
    icon: <UsersIcon size="xl" />,
    available: 'both'
  },
  {
    id: 'telehealth-sessions',
    name: 'Telehealth Sessions',
    description: 'Secure video therapy sessions from the comfort of your home. Same quality care with added convenience and flexibility.',
    duration: '50 minutes',
    price: '$180',
    medicareRebate: '$87.45 rebate available',
    features: [
      'Secure Video Platform',
      'Flexible Scheduling',
      'No Travel Required',
      'Same Quality Care',
      'Privacy & Confidentiality'
    ],
    icon: <VideoIcon size="xl" />,
    available: 'telehealth'
  },
  {
    id: 'psychological-assessment',
    name: 'Psychological Assessment',
    description: 'Comprehensive psychological evaluations and assessments. Professional diagnosis and treatment recommendations.',
    duration: '90 minutes',
    price: '$280',
    medicareRebate: '$126.55 rebate available',
    features: [
      'ADHD Assessment',
      'Autism Spectrum Assessment',
      'Cognitive Assessment',
      'Personality Assessment',
      'Diagnostic Evaluation'
    ],
    icon: <HospitalIcon size="xl" />,
    available: 'in-person'
  },
  {
    id: 'group-therapy',
    name: 'Group Therapy',
    description: 'Therapeutic group sessions with peers facing similar challenges. Support, connection, and shared learning in a safe environment.',
    duration: '90 minutes',
    price: '$120',
    features: [
      'Peer Support',
      'Shared Experiences',
      'Cost-Effective',
      'Social Connection',
      'Skill Building'
    ],
    icon: <UsersIcon size="xl" />,
    available: 'in-person'
  },
  {
    id: 'workshops',
    name: 'Wellness Workshops',
    description: 'Educational workshops on mental health topics. Learn practical skills and strategies for better wellbeing.',
    duration: '2 hours',
    price: '$80',
    features: [
      'Stress Management',
      'Mindfulness & Meditation',
      'Coping Strategies',
      'Self-Care Techniques',
      'Mental Health Education'
    ],
    icon: <CheckCircleIcon size="xl" />,
    available: 'both'
  }
];

export const ServicesPage: React.FC = () => {
  return (
    <Layout className={styles.servicesPage}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>Our Services</h1>
            <p className={styles.heroSubtitle}>
              Comprehensive psychology services tailored to your needs. 
              Evidence-based treatments delivered by AHPRA-registered psychologists.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className={styles.servicesSection}>
        <div className="container">
          <div className={styles.servicesGrid}>
            {services.map((service) => (
              <div key={service.id} className={styles.serviceCard}>
                <div className={styles.serviceIcon}>
                  {service.icon}
                </div>
                <h3 className={styles.serviceName}>{service.name}</h3>
                <p className={styles.serviceDescription}>{service.description}</p>
                
                <div className={styles.serviceDetails}>
                  <div className={styles.detailItem}>
                    <ClockIcon size="sm" />
                    <span>{service.duration}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <DollarIcon size="sm" />
                    <span>{service.price}</span>
                  </div>
                  {service.medicareRebate && (
                    <div className={styles.medicareBadge}>
                      <CheckCircleIcon size="sm" />
                      <span>{service.medicareRebate}</span>
                    </div>
                  )}
                </div>

                <div className={styles.availability}>
                  {service.available === 'both' && (
                    <span className={styles.availabilityBadge}>
                      <VideoIcon size="xs" /> <HospitalIcon size="xs" /> Available In-Person & Telehealth
                    </span>
                  )}
                  {service.available === 'telehealth' && (
                    <span className={styles.availabilityBadge}>
                      <VideoIcon size="xs" /> Telehealth Only
                    </span>
                  )}
                  {service.available === 'in-person' && (
                    <span className={styles.availabilityBadge}>
                      <HospitalIcon size="xs" /> In-Person Only
                    </span>
                  )}
                </div>

                <div className={styles.serviceFeatures}>
                  <h4 className={styles.featuresTitle}>Specializations:</h4>
                  <ul className={styles.featuresList}>
                    {service.features.map((feature, index) => (
                      <li key={index}>
                        <CheckCircleIcon size="xs" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <Link to="/register" className={styles.bookButton}>
                  Book Appointment
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className="container">
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>Ready to Get Started?</h2>
            <p className={styles.ctaSubtitle}>
              Book your first appointment today and take the first step towards better mental health.
            </p>
            <div className={styles.ctaButtons}>
              <Link to="/register" className={styles.primaryCTA}>
                Book Your Appointment
              </Link>
              <Link to="/about" className={styles.secondaryCTA}>
                Learn More About Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

