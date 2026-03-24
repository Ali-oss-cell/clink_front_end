import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../../components/common/Layout/Layout';
import {
  VideoIcon,
  CalendarIcon,
  ClipboardIcon,
  ChartIcon,
  CheckCircleIcon,
  ClockIcon,
  LockIcon,
  UsersIcon,
  BuildingIcon,
} from '../../utils/icons';
import heroImage from '../../assets/imges/optimized/hero-therapy.webp';
import heroImage2 from '../../assets/imges/optimized/hero-telehealth.webp';
import heroImage3 from '../../assets/imges/optimized/hero-consultation.webp';
import heroImage4 from '../../assets/imges/optimized/hero-support.webp';
import homeResourcesReading from '../../assets/imges/optimized/home-resources-reading.webp';
import homeTrustConnection from '../../assets/imges/optimized/home-trust-connection.webp';
import styles from './Homepage.module.scss';
import gsap from 'gsap';

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  primaryAction: string;
  primaryLink: string;
  secondaryAction?: string;
  secondaryLink?: string;
  gradient?: string;
  backgroundImage?: string;
}

const slides: Slide[] = [
  {
    id: 1,
    title: 'Professional Psychology Services in Australia',
    subtitle: 'Compassionate care and evidence-based treatments for mental health and wellbeing. Our AHPRA-registered psychologists are here to support your journey.',
    primaryAction: 'Book Your Appointment',
    primaryLink: '/register',
    secondaryAction: 'Get matched',
    secondaryLink: '/get-matched',
    backgroundImage: heroImage
  },
  {
    id: 2,
    title: 'Telehealth Sessions Available',
    subtitle: 'Access professional psychology services from the comfort of your home via secure video sessions. Same quality care, more convenience.',
    primaryAction: 'Book Telehealth Session',
    primaryLink: '/register',
    secondaryAction: 'View Services',
    secondaryLink: '/services',
    backgroundImage: heroImage2
  },
  {
    id: 3,
    title: 'In-Person & Telehealth Options',
    subtitle: 'Choose the format that works best for you. We offer both in-person consultations at our clinic and secure telehealth video sessions.',
    primaryAction: 'Book Appointment',
    primaryLink: '/register',
    secondaryAction: 'Find Our Location',
    secondaryLink: '/contact',
    backgroundImage: heroImage3
  },
  {
    id: 4,
    title: 'Medicare Rebates Available',
    subtitle: 'We\'re approved Medicare providers, making psychology services more affordable. Get the support you need with Medicare rebates.',
    primaryAction: 'Check Eligibility',
    primaryLink: '/register',
    secondaryAction: 'Learn About Medicare',
    secondaryLink: '/about',
    backgroundImage: heroImage4
  }
];

export const Homepage: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const prevSlideRef = useRef(0);
  const slideRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [visibleSteps, setVisibleSteps] = useState<number[]>([]);

  // Auto-play slider
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000); // Change slide every 6 seconds

    return () => clearInterval(interval);
  }, []);

  // Initial GSAP state for the first slide
  useEffect(() => {
    const first = slideRefs.current[0];
    if (first) {
      gsap.set(first, {
        opacity: 1,
        visibility: 'visible',
        x: 0,
        zIndex: 2,
        pointerEvents: 'auto',
      });
    }
  }, []);

  // Animate slide transitions with GSAP
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const prev = prevSlideRef.current;
    if (prev === currentSlide) return;

    const fromEl = slideRefs.current[prev];
    const toEl = slideRefs.current[currentSlide];
    if (!fromEl || !toEl) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const fromSlide = slides[prev];
    const toSlide = slides[currentSlide];

    // Ensure outgoing slide keeps its background during the animation.
    if (fromSlide.backgroundImage) {
      fromEl.style.backgroundImage = `url(${fromSlide.backgroundImage})`;
      fromEl.style.backgroundSize = 'cover';
      fromEl.style.backgroundPosition = 'center';
      fromEl.style.backgroundRepeat = 'no-repeat';
      fromEl.classList.add(styles.hasImage);
    }

    // Ensure incoming slide has its background (usually already true from render).
    if (toSlide.backgroundImage) {
      toEl.style.backgroundImage = `url(${toSlide.backgroundImage})`;
      toEl.style.backgroundSize = 'cover';
      toEl.style.backgroundPosition = 'center';
      toEl.style.backgroundRepeat = 'no-repeat';
      toEl.classList.add(styles.hasImage);
    }

    if (prefersReducedMotion) {
      gsap.set(fromEl, { opacity: 0, visibility: 'hidden', x: 0, pointerEvents: 'none', zIndex: 1 });
      gsap.set(toEl, { opacity: 1, visibility: 'visible', x: 0, pointerEvents: 'auto', zIndex: 2 });
      prevSlideRef.current = currentSlide;
      if (fromSlide.backgroundImage) {
        fromEl.style.backgroundImage = 'none';
        fromEl.classList.remove(styles.hasImage);
      }
      return;
    }

    gsap.set(toEl, { opacity: 0, visibility: 'visible', x: 40, pointerEvents: 'auto', zIndex: 2 });
    gsap.set(fromEl, { opacity: 1, visibility: 'visible', x: 0, pointerEvents: 'auto', zIndex: 1 });

    const duration = 0.8;
    gsap
      .timeline({
        defaults: { ease: 'power3.out', duration },
        onComplete: () => {
          // Hide outgoing slide after animation.
          gsap.set(fromEl, { visibility: 'hidden', pointerEvents: 'none' });

          if (fromSlide.backgroundImage) {
            fromEl.style.backgroundImage = 'none';
            fromEl.classList.remove(styles.hasImage);
          }

          prevSlideRef.current = currentSlide;
        },
      })
      .to(fromEl, { opacity: 0, x: -40 }, 0)
      .to(toEl, { opacity: 1, x: 0 }, 0);
  }, [currentSlide]);

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

  return (
    <Layout className={styles.homepage}>
      <section className={styles.hero}>
        {/* Slider Container */}
        <div className={styles.sliderContainer}>
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              ref={(el) => {
                slideRefs.current[index] = el;
              }}
              className={`${styles.slide} ${index === currentSlide && slide.backgroundImage ? styles.hasImage : ''}`}
              style={{
                backgroundImage:
                  index === currentSlide && slide.backgroundImage
                    ? `url(${slide.backgroundImage})`
                    : 'none',
                backgroundSize: slide.backgroundImage ? 'cover' : undefined,
                backgroundPosition: slide.backgroundImage ? 'center' : undefined,
                backgroundRepeat: slide.backgroundImage ? 'no-repeat' : undefined,
              }}
            >
              <div className="container">
                <div className={styles.heroContent}>
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
        </div>
      </section>

      <section className={styles.benefitsStrip} aria-label="Key benefits">
        <div className="container">
          <ul className={styles.benefitsStripList}>
            <li>
              <CheckCircleIcon size="md" className={styles.benefitsStripIcon} aria-hidden />
              <span>Flexible appointment times, including before and after standard hours where available</span>
            </li>
            <li>
              <CheckCircleIcon size="md" className={styles.benefitsStripIcon} aria-hidden />
              <span>Telehealth across Australia and in-person care where offered</span>
            </li>
            <li>
              <CheckCircleIcon size="md" className={styles.benefitsStripIcon} aria-hidden />
              <span>AHPRA-registered psychologists and evidence-based approaches</span>
            </li>
            <li>
              <CheckCircleIcon size="md" className={styles.benefitsStripIcon} aria-hidden />
              <span>Medicare rebates for eligible clients with a mental health care plan</span>
            </li>
          </ul>
        </div>
      </section>

      <section className={styles.features}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Why Choose Tailored Psychology?</h2>
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

      <section className={styles.resourcesTeaser}>
        <div className="container">
          <div className={styles.resourcesTeaserInner}>
            <div className={styles.resourcesTeaserCopy}>
              <h2 className={styles.resourcesTeaserTitle}>Support beyond the session</h2>
              <p className={styles.resourcesTeaserText}>
                Browse articles, worksheets, and mental health resources to complement your care. They are educational
                only and not a substitute for professional support in a crisis.
              </p>
              <Link to="/resources" className={styles.resourcesTeaserLink}>
                Explore resources
              </Link>
            </div>
            <div className={styles.resourcesTeaserMedia}>
              <img
                src={homeResourcesReading}
                alt=""
                className={styles.resourcesTeaserImage}
                width={600}
                height={400}
                loading="lazy"
              />
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

      <section className={styles.spotlight}>
        <div className="container">
          <div className={styles.spotlightGrid}>
            <div className={styles.spotlightMedia}>
              <img
                src={heroImage2}
                alt=""
                className={styles.spotlightImage}
                width={640}
                height={420}
                loading="lazy"
              />
            </div>
            <div className={styles.spotlightContent}>
              <h2 className={styles.spotlightTitle}>Therapy that fits how you live</h2>
              <p className={styles.spotlightLead}>
                Whether you prefer video sessions or visiting the clinic, you get the same thoughtful, professional
                care. We help you prepare for technical checks and privacy so telehealth feels straightforward.
              </p>
              <ul className={styles.spotlightList}>
                <li>
                  <VideoIcon size="md" className={styles.spotlightListIcon} aria-hidden />
                  Secure telehealth with clear session guidance
                </li>
                <li>
                  <BuildingIcon size="md" className={styles.spotlightListIcon} aria-hidden />
                  In-person consultations where available
                </li>
                <li>
                  <UsersIcon size="md" className={styles.spotlightListIcon} aria-hidden />
                  Individual support tailored to your goals
                </li>
              </ul>
              <div className={styles.spotlightActions}>
                <Link to="/telehealth-requirements" className={styles.spotlightSecondary}>
                  Telehealth setup &amp; requirements
                </Link>
                <Link to="/services" className={styles.spotlightPrimary}>
                  View services
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.trustBand}>
        <div className="container">
          <div className={styles.trustBandLayout}>
            <div className={styles.trustBandMedia}>
              <img
                src={homeTrustConnection}
                alt=""
                className={styles.trustBandImage}
                width={600}
                height={400}
                loading="lazy"
              />
            </div>
            <div className={styles.trustBandContent}>
              <h2 className={styles.trustBandTitle}>Built for safe, accountable care</h2>
              <div className={styles.trustGrid}>
                <div className={styles.trustCard}>
                  <div className={styles.trustIconWrap}>
                    <UsersIcon size="lg" aria-hidden />
                  </div>
                  <h3>Registered clinicians</h3>
                  <p>Psychology services delivered by professionals who meet Australian registration standards.</p>
                </div>
                <div className={styles.trustCard}>
                  <div className={styles.trustIconWrap}>
                    <LockIcon size="lg" aria-hidden />
                  </div>
                  <h3>Privacy-conscious platform</h3>
                  <p>Designed with healthcare privacy in mind for booking, records, and video sessions.</p>
                </div>
                <div className={styles.trustCard}>
                  <div className={styles.trustIconWrap}>
                    <ClockIcon size="lg" aria-hidden />
                  </div>
                  <h3>Booking that respects your schedule</h3>
                  <p>See available times online and choose a session that works across telehealth or clinic visits.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.accessFunding}>
        <div className="container">
          <div className={styles.accessFundingGrid}>
            <div className={styles.accessCard}>
              <h2 className={styles.accessHeading}>Medicare &amp; care plans</h2>
              <p>
                With a valid Mental Health Treatment Plan from your GP, you may be entitled to Medicare rebates for a
                limited number of sessions per calendar year. We can outline how claiming works once you are booked
                in.
              </p>
              <ul className={styles.accessList}>
                <li>Rebates claimed through Medicare after eligible sessions</li>
                <li>Your GP helps determine eligibility and referral documentation</li>
                <li>We are happy to answer practical questions when you contact us</li>
              </ul>
              <Link to="/about" className={styles.accessLink}>
                Learn more about our practice
              </Link>
            </div>
            <div className={styles.accessCardMuted}>
              <h2 className={styles.accessHeading}>Making care accessible</h2>
              <p>
                Session costs vary by clinician and appointment type. Private health extras may cover part of
                psychology in some cases—check with your fund. If cost is a barrier, talk to us about options when you
                reach out.
              </p>
              <Link to="/contact" className={styles.accessLink}>
                Contact us with questions
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.testimonials}>
        <div className="container">
          <h2 className={styles.testimonialsTitle}>What clients often value</h2>
          <p className={styles.testimonialsIntro}>
            Everyone&apos;s experience is different; these are common themes people share about working with us.
          </p>
          <div className={styles.testimonialsGrid}>
            <blockquote className={styles.testimonialCard}>
              <p>
                &ldquo;Straightforward booking and clear communication before the first appointment made it easier to
                take the first step.&rdquo;
              </p>
            </blockquote>
            <blockquote className={styles.testimonialCard}>
              <p>
                &ldquo;I felt listened to and the telehealth format actually suited my work hours really well.&rdquo;
              </p>
            </blockquote>
            <blockquote className={styles.testimonialCard}>
              <p>
                &ldquo;Having Medicare rebates explained upfront helped me plan sessions without surprises.&rdquo;
              </p>
            </blockquote>
          </div>
        </div>
      </section>

      <section className={styles.bottomCta}>
        <div className="container">
          <h2 className={styles.bottomCtaTitle}>Ready to connect with a psychologist?</h2>
          <p className={styles.bottomCtaText}>
            Create an account to book, or use our matching flow to narrow your preferences before you choose a
            clinician.
          </p>
          <div className={styles.bottomCtaActions}>
            <Link to="/register" className={styles.bottomCtaPrimary}>
              Get started
            </Link>
            <Link to="/get-matched" className={styles.bottomCtaSecondary}>
              Get matched
            </Link>
            <Link to="/services" className={styles.bottomCtaGhost}>
              Browse services
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};
