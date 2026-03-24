import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../../components/common/Layout/Layout';
import {
  OutlineTelehealthIcon,
  OutlineClinicIcon,
  OutlineIndividualCareIcon,
  OutlineCredentialIcon,
  OutlinePrivacyShieldIcon,
  OutlineScheduleIcon,
  OutlineCircleCheckIcon,
  OutlineCalendarDaysIcon,
  OutlineClipboardIcon,
  OutlineChartLineIcon,
} from '../../utils/icons';
import heroImage from '../../assets/imges/optimized/hero-therapy.webp';
import heroImage2 from '../../assets/imges/optimized/hero-telehealth.webp';
import heroImage3 from '../../assets/imges/optimized/hero-consultation.webp';
import heroImage4 from '../../assets/imges/optimized/hero-support.webp';
import homeResourcesReading from '../../assets/imges/optimized/home-resources-reading.webp';
import homeTrustConnection from '../../assets/imges/optimized/home-trust-connection.webp';
import styles from './Homepage.module.scss';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

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
    title: 'Psychology that meets you where you are',
    subtitle:
      'AHPRA-registered clinicians across Australia—telehealth or in person. Evidence-based support when you are ready.',
    primaryAction: 'Book Your Appointment',
    primaryLink: '/register',
    secondaryAction: 'Get matched',
    secondaryLink: '/get-matched',
    backgroundImage: heroImage
  },
  {
    id: 2,
    title: 'Therapy from home, without compromise',
    subtitle: 'Secure video sessions with the same standards of care as in clinic—private, structured, and easy to join.',
    primaryAction: 'Book Telehealth Session',
    primaryLink: '/register',
    secondaryAction: 'View Services',
    secondaryLink: '/services',
    backgroundImage: heroImage2
  },
  {
    id: 3,
    title: 'Your format, your pace',
    subtitle: 'In-person at our clinic or telehealth—choose what fits your week, without sacrificing quality of care.',
    primaryAction: 'Book Appointment',
    primaryLink: '/register',
    secondaryAction: 'Find Our Location',
    secondaryLink: '/contact',
    backgroundImage: heroImage3
  },
  {
    id: 4,
    title: 'Medicare support when you are eligible',
    subtitle:
      'We are registered providers. With a GP mental health care plan, you may receive rebates—ask us if you are unsure.',
    primaryAction: 'Check Eligibility',
    primaryLink: '/register',
    secondaryAction: 'Learn About Medicare',
    secondaryLink: '/about',
    backgroundImage: heroImage4
  }
];

export const Homepage: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideRefs = useRef<Array<HTMLDivElement | null>>([]);
  const heroTimelineRef = useRef<gsap.core.Timeline | null>(null);
  /** Last fully settled hero slide; updated when a transition finishes (or instant switch). Not bumped early, so overlapping transitions still animate from the correct slide. */
  const settledSlideRef = useRef(0);

  // Auto-play slider
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000); // Change slide every 6 seconds

    return () => clearInterval(interval);
  }, []);

  // Hero slider: always kill in-flight tween before starting another; keep settled index in ref only when a transition completes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    heroTimelineRef.current?.kill();
    heroTimelineRef.current = null;

    const fromIdx = settledSlideRef.current;
    const toIdx = currentSlide;

    const hideOtherSlides = () => {
      slideRefs.current.forEach((el, i) => {
        if (!el || i === toIdx) return;
        if (i === fromIdx && fromIdx !== toIdx) return;
        gsap.set(el, {
          autoAlpha: 0,
          x: 40,
          visibility: 'hidden',
          pointerEvents: 'none',
          zIndex: 0,
        });
      });
    };

    if (fromIdx === toIdx) {
      hideOtherSlides();
      const el = slideRefs.current[toIdx];
      if (el) {
        gsap.set(el, {
          autoAlpha: 1,
          x: 0,
          visibility: 'visible',
          pointerEvents: 'auto',
          zIndex: 2,
        });
      }
      return () => {
        heroTimelineRef.current?.kill();
        heroTimelineRef.current = null;
      };
    }

    const fromEl = slideRefs.current[fromIdx];
    const toEl = slideRefs.current[toIdx];
    if (!fromEl || !toEl) {
      settledSlideRef.current = toIdx;
      return () => {
        heroTimelineRef.current?.kill();
        heroTimelineRef.current = null;
      };
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    slideRefs.current.forEach((el, i) => {
      if (!el || i === fromIdx || i === toIdx) return;
      gsap.set(el, {
        autoAlpha: 0,
        visibility: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
        x: 40,
      });
    });

    if (prefersReducedMotion) {
      gsap.set(fromEl, { autoAlpha: 0, x: 0, visibility: 'hidden', pointerEvents: 'none', zIndex: 1 });
      gsap.set(toEl, { autoAlpha: 1, x: 0, visibility: 'visible', pointerEvents: 'auto', zIndex: 2 });
      settledSlideRef.current = toIdx;
      return () => {
        heroTimelineRef.current?.kill();
        heroTimelineRef.current = null;
      };
    }

    gsap.set(toEl, {
      autoAlpha: 0,
      visibility: 'visible',
      x: 40,
      pointerEvents: 'auto',
      zIndex: 2,
    });
    gsap.set(fromEl, { autoAlpha: 1, visibility: 'visible', x: 0, pointerEvents: 'auto', zIndex: 1 });

    const duration = 0.8;
    const tl = gsap.timeline({
      defaults: { ease: 'power3.out', duration },
      onComplete: () => {
        gsap.set(fromEl, {
          autoAlpha: 0,
          visibility: 'hidden',
          pointerEvents: 'none',
          x: -40,
          zIndex: 1,
        });
        settledSlideRef.current = toIdx;
        heroTimelineRef.current = null;
      },
    });

    tl.to(fromEl, { autoAlpha: 0, x: -40 }, 0).to(toEl, { autoAlpha: 1, x: 0 }, 0);

    heroTimelineRef.current = tl;

    return () => {
      tl.kill();
      if (heroTimelineRef.current === tl) {
        heroTimelineRef.current = null;
      }
    };
  }, [currentSlide]);

  // Scroll-triggered section reveals (ScrollTrigger)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      document.querySelectorAll<HTMLElement>('[data-home-reveal]').forEach((section) => {
        const animateChildren = section.querySelectorAll<HTMLElement>('[data-home-stagger-item]');

        if (animateChildren.length > 0) {
          gsap.from(animateChildren, {
            y: 40,
            autoAlpha: 0,
            duration: 0.65,
            ease: 'power3.out',
            stagger: 0.09,
            scrollTrigger: {
              trigger: section,
              start: 'top 86%',
              toggleActions: 'play none none none',
              once: true,
            },
          });
          return;
        }

        gsap.from(section, {
          y: 52,
          autoAlpha: 0,
          duration: 0.85,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 88%',
            toggleActions: 'play none none none',
            once: true,
          },
        });
      });

      const hiw = document.querySelector<HTMLElement>('[data-home-how]');
      if (hiw) {
        const title = hiw.querySelector<HTMLElement>('[data-home-how-title]');
        const sub = hiw.querySelector<HTMLElement>('[data-home-how-sub]');
        const stepEls = hiw.querySelectorAll<HTMLElement>('[data-home-step-card]');
        const cta = hiw.querySelector<HTMLElement>('[data-home-how-cta]');

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: hiw,
            start: 'top 82%',
            toggleActions: 'play none none none',
            once: true,
          },
        });

        if (title) {
          tl.from(title, { y: 28, autoAlpha: 0, duration: 0.55, ease: 'power3.out' }, 0);
        }
        if (sub) {
          tl.from(sub, { y: 22, autoAlpha: 0, duration: 0.5, ease: 'power3.out' }, 0.06);
        }
        if (stepEls.length) {
          tl.from(
            stepEls,
            {
              y: 32,
              autoAlpha: 0,
              duration: 0.58,
              ease: 'power2.out',
              stagger: 0.12,
            },
            0.12
          );
        }
        if (cta) {
          tl.from(cta, { y: 18, autoAlpha: 0, duration: 0.48, ease: 'power2.out' }, '-=0.15');
        }
      }
    });

    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });

    const onResize = () => {
      ScrollTrigger.refresh();
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      ctx.revert();
      ScrollTrigger.getAll().forEach((t) => t.kill());
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
              className={`${styles.slide} ${slide.backgroundImage ? styles.hasImage : ''}`}
              style={{
                backgroundImage: slide.backgroundImage ? `url(${slide.backgroundImage})` : 'none',
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

      <section className={styles.benefitsStrip} aria-label="Key benefits" data-home-reveal>
        <div className="container">
          <ul className={styles.benefitsStripList}>
            <li data-home-stagger-item>
              <OutlineCircleCheckIcon size="md" className={styles.benefitsStripIcon} aria-hidden />
              <span>Flexible appointment times, including before and after standard hours where available</span>
            </li>
            <li data-home-stagger-item>
              <OutlineCircleCheckIcon size="md" className={styles.benefitsStripIcon} aria-hidden />
              <span>Telehealth across Australia and in-person care where offered</span>
            </li>
            <li data-home-stagger-item>
              <OutlineCircleCheckIcon size="md" className={styles.benefitsStripIcon} aria-hidden />
              <span>AHPRA-registered psychologists and evidence-based approaches</span>
            </li>
            <li data-home-stagger-item>
              <OutlineCircleCheckIcon size="md" className={styles.benefitsStripIcon} aria-hidden />
              <span>Medicare rebates for eligible clients with a mental health care plan</span>
            </li>
          </ul>
        </div>
      </section>

      <section className={styles.features} data-home-reveal>
        <div className="container">
          <div className="tp-brand-headingBlock" data-home-stagger-item>
            <p className="tp-brand-kicker">Why choose us</p>
            <h2 className={`${styles.sectionTitle} ${styles.sectionTitleInStack}`}>
              Why Choose Tailored Psychology?
            </h2>
            <p className="tp-brand-lead">
              Evidence-based care from registered psychologists—clear, respectful, and shaped to your goals.
            </p>
          </div>
          <div className={styles.featureGrid}>
            <div className={styles.featureCard} data-home-stagger-item>
              <h3>AHPRA Registered</h3>
              <p>All our psychologists are fully registered with the Australian Health Practitioner Regulation Agency.</p>
            </div>
            <div className={styles.featureCard} data-home-stagger-item>
              <h3>Medicare Rebates</h3>
              <p>We're approved Medicare providers, making psychology services more affordable for you.</p>
            </div>
            <div className={styles.featureCard} data-home-stagger-item>
              <h3>Telehealth Available</h3>
              <p>Access professional psychology services from the comfort of your home via secure video sessions.</p>
            </div>
            <div className={styles.featureCard} data-home-stagger-item>
              <h3>Evidence-Based Care</h3>
              <p>We use proven therapeutic approaches tailored to your individual needs and goals.</p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.resourcesTeaser} data-home-reveal>
        <div className="container">
          <div className={styles.resourcesTeaserInner}>
            <div className={styles.resourcesTeaserCopy}>
              <p className="tp-brand-kicker">Between sessions</p>
              <h2 className={styles.resourcesTeaserTitle}>Support beyond the session</h2>
              <p className={styles.resourcesTeaserText}>
                Articles, worksheets, and tools to complement your care—educational only, and not a substitute for
                crisis support or one-to-one therapy.
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

      <section className={styles.howItWorks} data-home-how>
        <div className="container">
          <div className="tp-brand-headingBlock">
            <p className="tp-brand-kicker">Getting started</p>
            <h2 className={`${styles.sectionTitle} ${styles.sectionTitleInStack}`} data-home-how-title>
              How It Works
            </h2>
            <p className="tp-brand-lead" data-home-how-sub>
              From booking to your first session—telehealth or in person—with a path that stays simple and transparent.
            </p>
          </div>
          <div className={styles.stepsContainer}>
            <div className={styles.stepCard} data-home-step-card>
              <div className={styles.stepIcon}>
                <OutlineCalendarDaysIcon size="xl" />
              </div>
              <h3 className={styles.stepTitle}>Book Your Appointment</h3>
              <p className={styles.stepDescription}>
                Choose a convenient time and select your preferred psychologist. Book online in minutes, 24/7.
              </p>
            </div>

            <div className={styles.stepCard} data-home-step-card>
              <div className={styles.stepIcon}>
                <OutlineClipboardIcon size="xl" />
              </div>
              <h3 className={styles.stepTitle}>Complete Intake Form</h3>
              <p className={styles.stepDescription}>
                Fill out a brief intake form to help us understand your needs and prepare for your first session.
              </p>
            </div>

            <div className={styles.stepCard} data-home-step-card>
              <div className={styles.stepIcon}>
                <OutlineTelehealthIcon size="xl" />
              </div>
              <h3 className={styles.stepTitle}>Attend Your Session</h3>
              <p className={styles.stepDescription}>
                Join your session via secure video call or visit our clinic. Your psychologist will guide you through evidence-based therapy.
              </p>
            </div>

            <div className={styles.stepCard} data-home-step-card>
              <div className={styles.stepIcon}>
                <OutlineChartLineIcon size="xl" />
              </div>
              <h3 className={styles.stepTitle}>Track Your Progress</h3>
              <p className={styles.stepDescription}>
                Monitor your journey with progress notes, session summaries, and personalized resources in your dashboard.
              </p>
            </div>
          </div>

          <div className={styles.ctaContainer} data-home-how-cta>
            <Link to="/register" className={styles.ctaButton}>
              Get Started Today
            </Link>
            <p className={styles.ctaSubtext}>No credit card required • Free consultation available</p>
          </div>
        </div>
      </section>

      <section className={styles.spotlight} data-home-reveal>
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
              <p className="tp-brand-kicker">How you access care</p>
              <h2 className={styles.spotlightTitle}>Therapy that fits how you live</h2>
              <p className={styles.spotlightLead}>
                Video or clinic—you get the same considered, professional care. We help with tech checks and privacy so
                telehealth feels straightforward, not stressful.
              </p>
              <ul className={styles.spotlightList}>
                <li>
                  <OutlineTelehealthIcon size="md" className={styles.spotlightListIcon} aria-hidden />
                  Secure telehealth with clear session guidance
                </li>
                <li>
                  <OutlineClinicIcon size="md" className={styles.spotlightListIcon} aria-hidden />
                  In-person consultations where available
                </li>
                <li>
                  <OutlineIndividualCareIcon size="md" className={styles.spotlightListIcon} aria-hidden />
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

      <section className={styles.trustBand} data-home-reveal>
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
              <div className={styles.trustBandColumn}>
                <p className="tp-brand-kicker">Trust &amp; standards</p>
                <h2 className={styles.trustBandTitle}>Built for safe, accountable care</h2>
                <p className={styles.trustBandLead}>
                  Registration, privacy, and booking—designed around how real healthcare works in Australia.
                </p>
                <div className={styles.trustGrid}>
                  <div className={styles.trustCard}>
                    <div className={styles.trustIconWrap}>
                      <OutlineCredentialIcon size="lg" aria-hidden />
                    </div>
                    <h3>Registered clinicians</h3>
                    <p>Psychology services delivered by professionals who meet Australian registration standards.</p>
                  </div>
                  <div className={styles.trustCard}>
                    <div className={styles.trustIconWrap}>
                      <OutlinePrivacyShieldIcon size="lg" aria-hidden />
                    </div>
                    <h3>Privacy-conscious platform</h3>
                    <p>Designed with healthcare privacy in mind for booking, records, and video sessions.</p>
                  </div>
                  <div className={styles.trustCard}>
                    <div className={styles.trustIconWrap}>
                      <OutlineScheduleIcon size="lg" aria-hidden />
                    </div>
                    <h3>Booking that respects your schedule</h3>
                    <p>See available times online and choose a session that works across telehealth or clinic visits.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.accessFunding} data-home-reveal>
        <div className="container">
          <div className={styles.accessFundingGrid}>
            <div className={styles.accessCard} data-home-stagger-item>
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
            <div className={styles.accessCardMuted} data-home-stagger-item>
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
          <div className={styles.testimonialsIntroBlock} data-home-reveal>
            <h2 className={styles.testimonialsTitle}>What clients often value</h2>
            <p className={styles.testimonialsIntro}>
              Everyone&apos;s experience is different; these are common themes people share about working with us.
            </p>
          </div>
          <div className={styles.testimonialsGrid} data-home-reveal>
            <blockquote className={styles.testimonialCard} data-home-stagger-item>
              <p>
                &ldquo;Straightforward booking and clear communication before the first appointment made it easier to
                take the first step.&rdquo;
              </p>
            </blockquote>
            <blockquote className={styles.testimonialCard} data-home-stagger-item>
              <p>
                &ldquo;I felt listened to and the telehealth format actually suited my work hours really well.&rdquo;
              </p>
            </blockquote>
            <blockquote className={styles.testimonialCard} data-home-stagger-item>
              <p>
                &ldquo;Having Medicare rebates explained upfront helped me plan sessions without surprises.&rdquo;
              </p>
            </blockquote>
          </div>
        </div>
      </section>

      <section className={styles.bottomCta} data-home-reveal>
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
