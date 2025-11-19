import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../../components/common/Layout/Layout';
import { VideoIcon, HospitalIcon, UsersIcon, CheckCircleIcon, CalendarIcon, ClipboardIcon, ChartIcon } from '../../utils/icons';
import heroImage from '../../assets/imges/petr-magera-HuWm7malJ18-unsplash.jpg';
import heroImage2 from '../../assets/imges/pexels-shvets-production-7176319.jpg';
import heroImage3 from '../../assets/imges/pexels-shkrabaanthony-5217852.jpg';
import heroImage4 from '../../assets/imges/sigmund-YUuSAJkS3U4-unsplash.jpg';
import styles from './Homepage.module.scss';

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  primaryAction: string;
  primaryLink: string;
  secondaryAction?: string;
  secondaryLink?: string;
  gradient?: string; // Optional - use if no backgroundImage
  backgroundImage?: string; // Optional - path to image file
  backgroundImageMobile?: string; // Optional - smaller image for mobile
  icon?: React.ReactNode;
}

const slides: Slide[] = [
  {
    id: 1,
    title: 'Professional Psychology Services in Australia',
    subtitle: 'Compassionate care and evidence-based treatments for mental health and wellbeing. Our AHPRA-registered psychologists are here to support your journey.',
    primaryAction: 'Book Your Appointment',
    primaryLink: '/register',
    secondaryAction: 'Learn More About Us',
    secondaryLink: '/about',
    backgroundImage: heroImage,
    icon: <UsersIcon size="xl" />
  },
  {
    id: 2,
    title: 'Telehealth Sessions Available',
    subtitle: 'Access professional psychology services from the comfort of your home via secure video sessions. Same quality care, more convenience.',
    primaryAction: 'Book Telehealth Session',
    primaryLink: '/register',
    secondaryAction: 'View Services',
    secondaryLink: '/services',
    backgroundImage: heroImage2,
    icon: <VideoIcon size="xl" />
  },
  {
    id: 3,
    title: 'In-Person & Telehealth Options',
    subtitle: 'Choose the format that works best for you. We offer both in-person consultations at our clinic and secure telehealth video sessions.',
    primaryAction: 'Book Appointment',
    primaryLink: '/register',
    secondaryAction: 'Find Our Location',
    secondaryLink: '/contact',
    backgroundImage: heroImage3,
    icon: <HospitalIcon size="xl" />
  },
  {
    id: 4,
    title: 'Medicare Rebates Available',
    subtitle: 'We\'re approved Medicare providers, making psychology services more affordable. Get the support you need with Medicare rebates.',
    primaryAction: 'Check Eligibility',
    primaryLink: '/register',
    secondaryAction: 'Learn About Medicare',
    secondaryLink: '/about',
    backgroundImage: heroImage4,
    icon: <CheckCircleIcon size="xl" />
  }
];

export const Homepage: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [visibleSteps, setVisibleSteps] = useState<number[]>([]);

  // Auto-play slider
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000); // Change slide every 6 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  // Scroll-triggered animation for steps
  useEffect(() => {
    let observer: IntersectionObserver | null = null;
    let stepCards: NodeListOf<Element> | null = null;

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const stepIndex = parseInt(entry.target.getAttribute('data-step-index') || '0');
              setTimeout(() => {
                setVisibleSteps((prev) => {
                  if (!prev.includes(stepIndex)) {
                    return [...prev, stepIndex].sort((a, b) => a - b);
                  }
                  return prev;
                });
              }, stepIndex * 400); // 400ms delay between each card - slower reveal
            }
          });
        },
        {
          threshold: 0.1, // Lower threshold - trigger when 10% is visible
          rootMargin: '0px 0px -50px 0px' // Less margin for earlier trigger
        }
      );

      stepCards = document.querySelectorAll('[data-step-index]');
      if (stepCards.length > 0) {
        stepCards.forEach((card) => {
          observer?.observe(card);
          // Check if card is already visible on load
          const rect = card.getBoundingClientRect();
          const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
          if (isVisible) {
            const stepIndex = parseInt(card.getAttribute('data-step-index') || '0');
            setTimeout(() => {
              setVisibleSteps((prev) => {
                if (!prev.includes(stepIndex)) {
                  return [...prev, stepIndex].sort((a, b) => a - b);
                }
                return prev;
              });
            }, stepIndex * 400);
          }
        });
      } else {
        // Fallback: if no cards found, show all after a delay
        console.warn('Step cards not found, showing all steps');
        setTimeout(() => {
          setVisibleSteps([0, 1, 2, 3]);
        }, 500);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (observer && stepCards) {
        stepCards.forEach((card) => {
          if (observer) {
            observer.unobserve(card);
          }
        });
      }
    };
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false); // Pause auto-play when user manually navigates
    // Resume auto-play after 10 seconds
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  return (
    <Layout className={styles.homepage}>
      <section className={styles.hero}>
        {/* Slider Container */}
        <div className={styles.sliderContainer}>
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`${styles.slide} ${index === currentSlide ? styles.active : ''} ${slide.backgroundImage ? styles.hasImage : ''}`}
              style={{
                background: slide.backgroundImage 
                  ? `url(${slide.backgroundImage})`
                  : slide.gradient,
                backgroundSize: slide.backgroundImage ? 'cover' : undefined,
                backgroundPosition: slide.backgroundImage ? 'center' : undefined,
                backgroundRepeat: slide.backgroundImage ? 'no-repeat' : undefined
              }}
            >
              {/* Floating decorative elements */}
              <div className={styles.floatingElements}>
                <div className={`${styles.floatingShape} ${styles.shape1}`}></div>
                <div className={`${styles.floatingShape} ${styles.shape2}`}></div>
                <div className={`${styles.floatingShape} ${styles.shape3}`}></div>
                <div className={`${styles.floatingShape} ${styles.shape4}`}></div>
                <div className={`${styles.floatingShape} ${styles.shape5}`}></div>
              </div>

              {/* Drifting particles */}
              <div className={styles.driftingParticles}>
                <div className={`${styles.particle} ${styles.particle1}`}></div>
                <div className={`${styles.particle} ${styles.particle2}`}></div>
                <div className={`${styles.particle} ${styles.particle3}`}></div>
              </div>

              <div className="container">
                <div className={styles.heroContent}>
                  {slide.icon && (
                    <div className={styles.slideIcon}>
                      {slide.icon}
                    </div>
                  )}
                  <h1 className={styles.heroTitle}>
                    {slide.title}
                  </h1>
                  <p className={styles.heroSubtitle}>
                    {slide.subtitle}
                  </p>
                  <div className={styles.heroActions}>
                    <Link to={slide.primaryLink} className={styles.primaryButton}>
                      {slide.primaryAction}
                    </Link>
                    {slide.secondaryAction && slide.secondaryLink && (
                      <Link to={slide.secondaryLink} className={styles.secondaryButton}>
                        {slide.secondaryAction}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Navigation Arrows */}
          <button 
            className={styles.sliderArrow} 
            onClick={prevSlide}
            aria-label="Previous slide"
          >
            <span>‹</span>
          </button>
          <button 
            className={`${styles.sliderArrow} ${styles.arrowRight}`} 
            onClick={nextSlide}
            aria-label="Next slide"
          >
            <span>›</span>
          </button>

          {/* Slide Indicators */}
          <div className={styles.sliderIndicators}>
            {slides.map((_, index) => (
              <button
                key={index}
                className={`${styles.indicator} ${index === currentSlide ? styles.active : ''}`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className={styles.features}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Why Choose MindWell Clinic?</h2>
          <div className={styles.featureGrid}>
            <div className={styles.featureCard}>
              <h3>AHPRA Registered</h3>
              <p>All our psychologists are fully registered with the Australian Health Practitioner Regulation Agency.</p>
            </div>
            <div className={styles.featureCard}>
              <h3>Medicare Rebates</h3>
              <p>We're approved Medicare providers, making psychology services more affordable for you.</p>
            </div>
            <div className={styles.featureCard}>
              <h3>Telehealth Available</h3>
              <p>Access professional psychology services from the comfort of your home via secure video sessions.</p>
            </div>
            <div className={styles.featureCard}>
              <h3>Evidence-Based Care</h3>
              <p>We use proven therapeutic approaches tailored to your individual needs and goals.</p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.howItWorks}>
        <div className="container">
          <h2 className={styles.sectionTitle}>How It Works</h2>
          <p className={styles.sectionSubtitle}>
            Getting started with professional psychology care is simple. Follow these easy steps to begin your journey to better mental health.
          </p>
          <div className={styles.stepsContainer}>
            <div 
              className={`${styles.stepCard} ${visibleSteps.includes(0) ? styles.visible : ''}`}
              data-step-index="0"
            >
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepIcon}>
                <CalendarIcon size="xl" />
              </div>
              <h3 className={styles.stepTitle}>Book Your Appointment</h3>
              <p className={styles.stepDescription}>
                Choose a convenient time and select your preferred psychologist. Book online in minutes, 24/7.
              </p>
            </div>

            <div className={`${styles.stepConnector} ${visibleSteps.includes(0) ? styles.visible : ''}`}>
              <div className={styles.connectorLine}></div>
              <div className={styles.connectorArrow}>→</div>
            </div>

            <div 
              className={`${styles.stepCard} ${visibleSteps.includes(1) ? styles.visible : ''}`}
              data-step-index="1"
            >
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepIcon}>
                <ClipboardIcon size="xl" />
              </div>
              <h3 className={styles.stepTitle}>Complete Intake Form</h3>
              <p className={styles.stepDescription}>
                Fill out a brief intake form to help us understand your needs and prepare for your first session.
              </p>
            </div>

            <div className={`${styles.stepConnector} ${visibleSteps.includes(1) ? styles.visible : ''}`}>
              <div className={styles.connectorLine}></div>
              <div className={styles.connectorArrow}>→</div>
            </div>

            <div 
              className={`${styles.stepCard} ${visibleSteps.includes(2) ? styles.visible : ''}`}
              data-step-index="2"
            >
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepIcon}>
                <VideoIcon size="xl" />
              </div>
              <h3 className={styles.stepTitle}>Attend Your Session</h3>
              <p className={styles.stepDescription}>
                Join your session via secure video call or visit our clinic. Your psychologist will guide you through evidence-based therapy.
              </p>
            </div>

            <div className={`${styles.stepConnector} ${visibleSteps.includes(2) ? styles.visible : ''}`}>
              <div className={styles.connectorLine}></div>
              <div className={styles.connectorArrow}>→</div>
            </div>

            <div 
              className={`${styles.stepCard} ${visibleSteps.includes(3) ? styles.visible : ''}`}
              data-step-index="3"
            >
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepIcon}>
                <ChartIcon size="xl" />
              </div>
              <h3 className={styles.stepTitle}>Track Your Progress</h3>
              <p className={styles.stepDescription}>
                Monitor your journey with progress notes, session summaries, and personalized resources in your dashboard.
              </p>
            </div>
          </div>

          <div className={styles.ctaContainer}>
            <Link to="/register" className={styles.ctaButton}>
              Get Started Today
            </Link>
            <p className={styles.ctaSubtext}>No credit card required • Free consultation available</p>
          </div>
        </div>
      </section>
    </Layout>
  );
};
