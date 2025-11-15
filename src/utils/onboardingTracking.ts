/**
 * Utility functions for tracking onboarding progress
 */

const ONBOARDING_STORAGE_KEY = 'onboarding_progress';

interface OnboardingProgress {
  resourcesViewed: boolean;
  resourcesViewedAt?: string;
}

/**
 * Get stored onboarding progress
 */
export const getOnboardingProgress = (): OnboardingProgress => {
  try {
    const stored = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading onboarding progress:', error);
  }
  
  return {
    resourcesViewed: false
  };
};

/**
 * Mark resources as viewed
 */
export const markResourcesViewed = (): void => {
  try {
    const progress: OnboardingProgress = {
      resourcesViewed: true,
      resourcesViewedAt: new Date().toISOString()
    };
    localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(progress));
    
    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new Event('onboardingProgressUpdated'));
  } catch (error) {
    console.error('Error saving onboarding progress:', error);
  }
};

/**
 * Check if resources have been viewed
 */
export const hasViewedResources = (): boolean => {
  const progress = getOnboardingProgress();
  return progress.resourcesViewed || false;
};

/**
 * Reset onboarding progress (useful for testing)
 */
export const resetOnboardingProgress = (): void => {
  try {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
  } catch (error) {
    console.error('Error resetting onboarding progress:', error);
  }
};

