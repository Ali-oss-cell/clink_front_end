import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../../../services/api/dashboard';
import type { PatientDashboard } from '../../../services/api/dashboard';
import { CheckCircleIcon, LightbulbIcon } from '../../../utils/icons';
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
  const [dashboardData, setDashboardData] = useState<PatientDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await dashboardService.getPatientDashboard();
        setDashboardData(data);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Main steps (counted in progress)
  const mainSteps: OnboardingStep[] = [
    {
      id: 'profile',
      title: 'Complete Your Profile',
      description: 'Add your personal information and preferences',
      completed: true, // Mark as complete
      actionText: 'Go to My Account',
      actionUrl: '/patient/account',
      priority: 'high'
    },
    {
      id: 'intake',
      title: 'Fill Out Intake Form',
      description: 'Help us understand your needs and goals',
      completed: true, // Mark as complete
      actionText: dashboardData?.intake_completed ? 'View Form' : 'Start Assessment',
      actionUrl: '/patient/intake-form',
      priority: 'high'
    },
    {
      id: 'appointment',
      title: 'Book Your First Appointment',
      description: 'Schedule a session with your psychologist',
      completed: true, // Mark as complete
      actionText: 'Schedule Session',
      actionUrl: '/appointments/book-appointment',
      priority: 'medium'
    }
  ];

  // Extra step (not counted in progress) - just a reminder
  const extraStep: OnboardingStep = {
    id: 'resources',
    title: 'Explore Resources',
    description: 'Access mental health tools and materials',
    completed: false, // Always show as available reminder
    actionText: 'View Resources',
    actionUrl: '/patient/resources',
    priority: 'low'
  };

  // Calculate progress based only on main steps
  const completedSteps = mainSteps.filter(step => step.completed).length;
  const totalSteps = mainSteps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;
  
  // Combine main steps and extra step for display
  const allSteps = [...mainSteps, extraStep];

  if (loading) {
    return (
      <div className={styles.onboardingProgress}>
        <div className={styles.progressHeader}>
          <h3 className={styles.title}>Getting Started</h3>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: '0%' }}></div>
          </div>
          <span className={styles.progressText}>Loading...</span>
        </div>
      </div>
    );
  }

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

      <div className={styles.stepsList}>
        {allSteps.map((step, index) => {
          const isMainStep = index < mainSteps.length;
          const isExtraStep = step.id === 'resources';
          
          return (
            <div 
              key={step.id} 
              className={`${styles.stepItem} ${step.completed ? styles.completed : ''} ${isExtraStep ? styles.extraStep : ''}`}
            >
              <div className={styles.stepNumber}>
                {step.completed ? (
                  <CheckCircleIcon size="sm" />
                ) : isExtraStep ? (
                  <LightbulbIcon size="sm" />
                ) : (
                  index + 1
                )}
              </div>
              <div className={styles.stepContent}>
                <h4 className={styles.stepTitle}>
                  {step.title}
                  {isExtraStep && <span className={styles.extraLabel}> (Optional)</span>}
                </h4>
                <p className={styles.stepDescription}>{step.description}</p>
              </div>
              <Link 
                to={step.actionUrl} 
                className={`${styles.stepAction} ${step.completed ? styles.completedAction : ''}`}
              >
                {step.actionText}
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};
