import { Link } from 'react-router-dom';
import styles from './OnboardingProgress.module.scss';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  actionText: string;
  actionUrl: string;
  priority: 'high' | 'medium' | 'low';
}

interface OnboardingProgressProps {
  user?: any;
}

export const OnboardingProgress: React.FC<OnboardingProgressProps> = () => {
  // TODO: Get real user data from Redux store
  const steps: OnboardingStep[] = [
    {
      id: 'profile',
      title: 'Complete Your Profile',
      description: 'Add your personal information and preferences',
      completed: false, // TODO: Check from user data
      actionText: 'Go to My Account',
      actionUrl: '/patient/account',
      priority: 'high'
    },
    {
      id: 'intake',
      title: 'Fill Out Intake Form',
      description: 'Help us understand your needs and goals',
      completed: false, // TODO: Check from user data
      actionText: 'Start Assessment',
      actionUrl: '/patient/intake-form',
      priority: 'high'
    },
    {
      id: 'appointment',
      title: 'Book Your First Appointment',
      description: 'Schedule a session with your psychologist',
      completed: false, // TODO: Check from user data
      actionText: 'Schedule Session',
      actionUrl: '/patient/appointments',
      priority: 'medium'
    },
    {
      id: 'resources',
      title: 'Explore Resources',
      description: 'Access mental health tools and materials',
      completed: false, // TODO: Check from user data
      actionText: 'View Resources',
      actionUrl: '/patient/resources',
      priority: 'low'
    }
  ];

  const completedSteps = steps.filter(step => step.completed).length;
  const totalSteps = steps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  const getNextStep = () => {
    return steps.find(step => !step.completed && step.priority === 'high') || 
           steps.find(step => !step.completed);
  };

  const nextStep = getNextStep();

  return (
    <div className={styles.onboardingProgress}>
      <div className={styles.progressHeader}>
        <h3 className={styles.title}>Getting Started</h3>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill}
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <span className={styles.progressText}>
          {completedSteps} of {totalSteps} steps completed
        </span>
      </div>

      {nextStep && (
        <div className={styles.nextStepCard}>
          <div className={styles.nextStepIcon}>🎯</div>
          <div className={styles.nextStepContent}>
            <h4 className={styles.nextStepTitle}>Next: {nextStep.title}</h4>
            <p className={styles.nextStepDescription}>{nextStep.description}</p>
            <Link 
              to={nextStep.actionUrl} 
              className={styles.nextStepButton}
            >
              {nextStep.actionText} →
            </Link>
          </div>
        </div>
      )}

      <div className={styles.stepsList}>
        {steps.map((step, index) => (
          <div 
            key={step.id} 
            className={`${styles.stepItem} ${step.completed ? styles.completed : ''}`}
          >
            <div className={styles.stepNumber}>
              {step.completed ? '✅' : index + 1}
            </div>
            <div className={styles.stepContent}>
              <h4 className={styles.stepTitle}>{step.title}</h4>
              <p className={styles.stepDescription}>{step.description}</p>
            </div>
            {!step.completed && (
              <Link to={step.actionUrl} className={styles.stepAction}>
                {step.actionText}
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
