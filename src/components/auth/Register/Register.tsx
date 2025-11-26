import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { authService } from '../../../services/api/auth';
import { getPrivacyPolicyStatus, acceptPrivacyPolicy } from '../../../services/api/privacy';
import { WarningIcon } from '../../../utils/icons';
import styles from './Register.module.scss';

interface RegisterProps {
  onRegister?: (userData: PatientRegistrationData) => Promise<void>;
}

interface PatientRegistrationData {
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  date_of_birth: string;
  address_line_1: string;
  suburb: string;
  state: string;
  postcode: string;
  medicare_number: string;
  terms_accepted: boolean;
}

export const Register: React.FC<RegisterProps> = ({ onRegister }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [privacyPolicyUrl, setPrivacyPolicyUrl] = useState<string>('/privacy-policy');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid, touchedFields }
  } = useForm<PatientRegistrationData>({
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      password_confirm: '',
      first_name: '',
      last_name: '',
      phone_number: '',
      date_of_birth: '',
      address_line_1: '',
      suburb: '',
      state: '',
      postcode: '',
      medicare_number: '',
      terms_accepted: false
    }
  });

  const password = watch('password');
  const email = watch('email');
  const first_name = watch('first_name');
  const last_name = watch('last_name');
  const phone_number = watch('phone_number');
  const date_of_birth = watch('date_of_birth');
  const address_line_1 = watch('address_line_1');
  const suburb = watch('suburb');
  const state = watch('state');
  const postcode = watch('postcode');
  const medicare_number = watch('medicare_number');

  // Load Privacy Policy URL on mount
  // Note: This will fail if user is not authenticated (which is expected during registration)
  // We use a default URL as fallback
  useEffect(() => {
    const loadPrivacyPolicy = async () => {
      try {
        // Try to get Privacy Policy URL (will fail if not authenticated, that's okay)
        const status = await getPrivacyPolicyStatus();
        if (status.privacy_policy_url) {
          setPrivacyPolicyUrl(status.privacy_policy_url);
        }
      } catch (error: any) {
        // If not authenticated or endpoint doesn't exist yet, use default URL
        // This is expected during registration since user is not logged in yet
        if (error.message?.includes('not authenticated')) {
          console.log('[Register] User not authenticated yet, using default Privacy Policy URL');
        } else {
          console.warn('[Register] Could not load Privacy Policy URL from API, using default:', error.message);
        }
        setPrivacyPolicyUrl('/privacy-policy');
      }
    };
    loadPrivacyPolicy();
  }, []);

  // Helper function to calculate completed fields
  const getCompletedFields = () => {
    const completedFields = [
      first_name && first_name.length >= 2,
      last_name && last_name.length >= 2,
      email && /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email),
      phone_number && /^(\+61|0)[2-9]\d{8}$/.test(phone_number),
      date_of_birth && date_of_birth.length > 0,
      address_line_1 && address_line_1.length >= 5,
      suburb && suburb.length >= 2,
      state && state.length > 0,
      postcode && /^\d{4}$/.test(postcode),
      medicare_number && medicare_number.length >= 10,
      password && password.length >= 8,
      watch('password_confirm') && watch('password_confirm') === password,
      watch('terms_accepted')
    ].filter(Boolean).length;
    
    return {
      count: completedFields,
      percentage: (completedFields / 13) * 100
    };
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: PatientRegistrationData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (onRegister) {
        await onRegister(data);
      } else {
        // Use authentication service
        const response = await authService.registerPatient(data);
        setSuccess(response.message);
        
        // Store tokens and user data (if provided)
        if (response.tokens) {
          localStorage.setItem('access_token', response.tokens.access);
          localStorage.setItem('refresh_token', response.tokens.refresh);
          
          // After successful registration, accept Privacy Policy
          try {
            await acceptPrivacyPolicy();
            console.log('[Register] Privacy Policy accepted successfully');
          } catch (privacyError: any) {
            // Log error but don't block registration
            // User will be prompted to accept on next login or when accessing protected routes
            console.warn('[Register] Failed to accept Privacy Policy after registration:', privacyError.message);
            console.warn('[Register] User will be prompted to accept Privacy Policy on next login');
          }
        }
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
        }
        
        // Redirect to login after successful registration
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err: any) {
      console.error('[Register] Registration error:', err);
      
      // Format error message for display
      let errorMessage = err.message || 'Registration failed. Please try again.';
      
      // If error contains multiple lines (field-specific errors), format it nicely
      if (errorMessage.includes('\n')) {
        // Split into main error and field errors
        const lines = errorMessage.split('\n');
        const mainError = lines[0];
        const fieldErrors = lines.slice(1).filter((line: string) => line.trim());
        
        if (fieldErrors.length > 0) {
          errorMessage = `${mainError}\n\nPlease fix the following:\n${fieldErrors.map((err: string) => `• ${err}`).join('\n')}`;
        } else {
          errorMessage = mainError;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.registerForm}>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <div className={styles.formHeader}>
          <h2 className={styles.title}>Create Your Account</h2>
          <p className={styles.subtitle}>Join Tailored Psychology as a patient</p>
          <div className={styles.stepIndicator}>
            <div className={styles.stepProgress}>
              <div className={`${styles.stepNumber} ${currentStep >= 1 ? styles.active : ''}`}>1</div>
              <div className={`${styles.stepLine} ${currentStep >= 2 ? styles.completed : ''}`}></div>
              <div className={`${styles.stepNumber} ${currentStep >= 2 ? styles.active : ''}`}>2</div>
              <div className={`${styles.stepLine} ${currentStep >= 3 ? styles.completed : ''}`}></div>
              <div className={`${styles.stepNumber} ${currentStep >= 3 ? styles.active : ''}`}>3</div>
            </div>
            <div className={styles.stepLabels}>
              <span className={`${styles.stepLabel} ${currentStep === 1 ? styles.current : ''}`}>Personal Info</span>
              <span className={`${styles.stepLabel} ${currentStep === 2 ? styles.current : ''}`}>Address</span>
              <span className={`${styles.stepLabel} ${currentStep === 3 ? styles.current : ''}`}>Account & Healthcare</span>
            </div>
          </div>
        </div>

        {error && (
          <div className={styles.errorAlert}>
            <span className={styles.errorIcon}><WarningIcon size="md" /></span>
            {error}
          </div>
        )}

        {success && (
          <div className={styles.successAlert}>
            {success}
          </div>
        )}

        {currentStep === 1 && (
          <div className={styles.stepContainer}>
            <div className={styles.formSection}>
              <h3 className={styles.sectionTitle}>Personal Information</h3>
          
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="first_name" className={styles.label}>
                First Name *
              </label>
              <div className={styles.inputWrapper}>
                <input
                  {...register('first_name', {
                    required: 'First name is required',
                    minLength: {
                      value: 2,
                      message: 'First name must be at least 2 characters'
                    }
                  })}
                  type="text"
                  id="first_name"
                  className={`${styles.input} ${errors.first_name ? styles.inputError : touchedFields.first_name && first_name ? styles.inputSuccess : ''}`}
                  placeholder="Enter your first name"
                  disabled={isLoading}
                />
              </div>
              {errors.first_name && (
                <span className={styles.fieldError}>{errors.first_name.message}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="last_name" className={styles.label}>
                Last Name *
              </label>
              <div className={styles.inputWrapper}>
                <input
                  {...register('last_name', {
                    required: 'Last name is required',
                    minLength: {
                      value: 2,
                      message: 'Last name must be at least 2 characters'
                    }
                  })}
                  type="text"
                  id="last_name"
                  className={`${styles.input} ${errors.last_name ? styles.inputError : touchedFields.last_name && last_name ? styles.inputSuccess : ''}`}
                  placeholder="Enter your last name"
                  disabled={isLoading}
                />
              </div>
              {errors.last_name && (
                <span className={styles.fieldError}>{errors.last_name.message}</span>
              )}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Email Address *
            </label>
            <div className={styles.inputWrapper}>
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Please enter a valid email address'
                  }
                })}
                type="email"
                id="email"
                className={`${styles.input} ${errors.email ? styles.inputError : touchedFields.email && email && !errors.email ? styles.inputSuccess : ''}`}
                placeholder="your.email@example.com"
                disabled={isLoading}
              />
            </div>
            {errors.email && (
              <span className={styles.fieldError}>{errors.email.message}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="phone_number" className={styles.label}>
              Phone Number *
            </label>
            <div className={styles.inputWrapper}>
              <input
                {...register('phone_number', {
                  required: 'Phone number is required',
                  pattern: {
                    value: /^(\+61|0)[2-9]\d{8}$/,
                    message: 'Please enter a valid Australian phone number'
                  }
                })}
                type="tel"
                id="phone_number"
                className={`${styles.input} ${errors.phone_number ? styles.inputError : touchedFields.phone_number && phone_number && !errors.phone_number ? styles.inputSuccess : ''}`}
                placeholder="+61 4XX XXX XXX or 04XX XXX XXX"
                disabled={isLoading}
              />
            </div>
            {errors.phone_number && (
              <span className={styles.fieldError}>{errors.phone_number.message}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="date_of_birth" className={styles.label}>
              Date of Birth *
            </label>
            <div className={styles.inputWrapper}>
              <input
                {...register('date_of_birth', {
                  required: 'Date of birth is required',
                  validate: (value) => {
                    const today = new Date();
                    const birthDate = new Date(value);
                    const age = today.getFullYear() - birthDate.getFullYear();
                    if (age < 18) return 'You must be at least 18 years old';
                    if (age > 120) return 'Please enter a valid date of birth';
                    return true;
                  }
                })}
                type="date"
                id="date_of_birth"
                className={`${styles.input} ${errors.date_of_birth ? styles.inputError : touchedFields.date_of_birth && date_of_birth && !errors.date_of_birth ? styles.inputSuccess : ''}`}
                disabled={isLoading}
              />
            </div>
            {errors.date_of_birth && (
              <span className={styles.fieldError}>{errors.date_of_birth.message}</span>
            )}
          </div>
        </div>

            <div className={styles.stepActions}>
              <button
                type="button"
                className={styles.nextButton}
                onClick={nextStep}
                disabled={!first_name || !last_name || !email || !phone_number || !date_of_birth}
              >
                Continue to Step 2 →
              </button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className={styles.stepContainer}>
            <div className={styles.formSection}>
              <h3 className={styles.sectionTitle}>Address Information</h3>
          
          <div className={styles.formGroup}>
            <label htmlFor="address_line_1" className={styles.label}>
              Street Address *
            </label>
            <div className={styles.inputWrapper}>
              <input
                {...register('address_line_1', {
                  required: 'Street address is required',
                  minLength: {
                    value: 5,
                    message: 'Please enter a complete street address'
                  }
                })}
                type="text"
                id="address_line_1"
                className={`${styles.input} ${errors.address_line_1 ? styles.inputError : touchedFields.address_line_1 && address_line_1 && !errors.address_line_1 ? styles.inputSuccess : ''}`}
                placeholder="123 Main Street"
                disabled={isLoading}
              />
            </div>
            {errors.address_line_1 && (
              <span className={styles.fieldError}>{errors.address_line_1.message}</span>
            )}
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="suburb" className={styles.label}>
                Suburb *
              </label>
              <div className={styles.inputWrapper}>
                <input
                  {...register('suburb', {
                    required: 'Suburb is required',
                    minLength: {
                      value: 2,
                      message: 'Please enter a valid suburb name'
                    }
                  })}
                  type="text"
                  id="suburb"
                  className={`${styles.input} ${errors.suburb ? styles.inputError : touchedFields.suburb && suburb && !errors.suburb ? styles.inputSuccess : ''}`}
                  placeholder="Melbourne"
                  disabled={isLoading}
                />
              </div>
              {errors.suburb && (
                <span className={styles.fieldError}>{errors.suburb.message}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="state" className={styles.label}>
                State *
              </label>
              <div className={styles.inputWrapper}>
                <select
                  {...register('state', {
                    required: 'State is required'
                  })}
                  id="state"
                  className={`${styles.input} ${errors.state ? styles.inputError : touchedFields.state && state && !errors.state ? styles.inputSuccess : ''}`}
                  disabled={isLoading}
                >
                  <option value="">Select State</option>
                  <option value="NSW">New South Wales</option>
                  <option value="VIC">Victoria</option>
                  <option value="QLD">Queensland</option>
                  <option value="WA">Western Australia</option>
                  <option value="SA">South Australia</option>
                  <option value="TAS">Tasmania</option>
                  <option value="ACT">Australian Capital Territory</option>
                  <option value="NT">Northern Territory</option>
                </select>
              </div>
              {errors.state && (
                <span className={styles.fieldError}>{errors.state.message}</span>
              )}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="postcode" className={styles.label}>
              Postcode *
            </label>
            <div className={styles.inputWrapper}>
              <input
                {...register('postcode', {
                  required: 'Postcode is required',
                  pattern: {
                    value: /^\d{4}$/,
                    message: 'Please enter a valid 4-digit postcode'
                  }
                })}
                type="text"
                id="postcode"
                className={`${styles.input} ${errors.postcode ? styles.inputError : touchedFields.postcode && postcode && !errors.postcode ? styles.inputSuccess : ''}`}
                placeholder="3000"
                maxLength={4}
                disabled={isLoading}
              />
            </div>
            {errors.postcode && (
              <span className={styles.fieldError}>{errors.postcode.message}</span>
            )}
          </div>
        </div>

            <div className={styles.stepActions}>
              <button
                type="button"
                className={styles.backButton}
                onClick={prevStep}
              >
                ← Back
              </button>
              <button
                type="button"
                className={styles.nextButton}
                onClick={nextStep}
                disabled={!address_line_1 || !suburb || !state || !postcode}
              >
                Continue to Step 3 →
              </button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className={styles.stepContainer}>
            <div className={styles.formSection}>
              <h3 className={styles.sectionTitle}>Healthcare Information</h3>
          
          <div className={styles.formGroup}>
            <label htmlFor="medicare_number" className={styles.label}>
              Medicare Number *
            </label>
            <div className={styles.inputWrapper}>
              <input
                {...register('medicare_number', {
                  required: 'Medicare number is required',
                  minLength: {
                    value: 10,
                    message: 'Please enter a valid Medicare number'
                  },
                  pattern: {
                    value: /^\d{10,11}$/,
                    message: 'Medicare number must be 10-11 digits'
                  }
                })}
                type="text"
                id="medicare_number"
                className={`${styles.input} ${errors.medicare_number ? styles.inputError : touchedFields.medicare_number && medicare_number && !errors.medicare_number ? styles.inputSuccess : ''}`}
                placeholder="1234567890"
                disabled={isLoading}
              />
            </div>
            {errors.medicare_number && (
              <span className={styles.fieldError}>{errors.medicare_number.message}</span>
            )}
            <p className={styles.fieldHelp}>
              Required for Medicare rebates. Your Medicare number is 10-11 digits long.
            </p>
          </div>
        </div>

        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>Account Details</h3>
          
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.label}>
                Password *
              </label>
              <div className={styles.inputWrapper}>
                <input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters'
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
                    }
                  })}
                  type="password"
                  id="password"
                  className={`${styles.input} ${errors.password ? styles.inputError : touchedFields.password && password && !errors.password ? styles.inputSuccess : ''}`}
                  placeholder="Create a strong password"
                  disabled={isLoading}
                />
              </div>
              {errors.password && (
                <span className={styles.fieldError}>{errors.password.message}</span>
              )}
              {password && (
                <div className={styles.passwordStrength}>
                  <div className={styles.strengthBar}>
                    <div 
                      className={`${styles.strengthFill} ${
                        password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password) 
                          ? styles.strengthStrong 
                          : password.length >= 8 && (/[A-Z]/.test(password) || /[a-z]/.test(password) || /\d/.test(password))
                          ? styles.strengthMedium
                          : password.length >= 4
                          ? styles.strengthWeak
                          : ''
                      }`}
                    ></div>
                  </div>
                  <span className={styles.strengthText}>
                    {password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password) 
                      ? 'Strong password' 
                      : password.length >= 8 && (/[A-Z]/.test(password) || /[a-z]/.test(password) || /\d/.test(password))
                      ? 'Medium strength'
                      : password.length >= 4
                      ? 'Weak password'
                      : 'Enter a password'
                    }
                  </span>
                </div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="confirm_password" className={styles.label}>
                Confirm Password *
              </label>
              <div className={styles.inputWrapper}>
                <input
                  {...register('password_confirm', {
                    required: 'Please confirm your password',
                    validate: (value) => value === password || 'Passwords do not match'
                  })}
                  type="password"
                  id="confirm_password"
                  className={`${styles.input} ${errors.password_confirm ? styles.inputError : touchedFields.password_confirm && watch('password_confirm') && !errors.password_confirm ? styles.inputSuccess : ''}`}
                  placeholder="Confirm your password"
                  disabled={isLoading}
                />
                {touchedFields.password_confirm && watch('password_confirm') && !errors.password_confirm && (
                  <span className={styles.fieldSuccess}>Passwords match!</span>
                )}
              </div>
              {errors.password_confirm && (
                <span className={styles.fieldError}>{errors.password_confirm.message}</span>
              )}
            </div>
          </div>
        </div>

        <div className={styles.formSection}>
          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <input
                {...register('terms_accepted', {
                  required: 'You must accept the terms and conditions'
                })}
                type="checkbox"
                className={styles.checkbox}
                disabled={isLoading}
              />
              <span className={styles.checkboxText}>
                I have read and agree to the{' '}
                <a
                  href={privacyPolicyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.termsLink}
                >
                  Privacy Policy
                </a>
                {' '}*
              </span>
            </label>
            {errors.terms_accepted && (
              <span className={styles.fieldError}>{errors.terms_accepted.message}</span>
            )}
          </div>
        </div>

        <div className={styles.formProgress}>
          <div className={styles.progressHeader}>
            <h4 className={styles.progressTitle}>Registration Progress</h4>
            <span className={styles.progressPercentage}>
              {Math.round(getCompletedFields().percentage)}%
            </span>
          </div>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill}
              style={{ 
                width: `${getCompletedFields().percentage}%` 
              }}
            ></div>
          </div>
          <div className={styles.progressText}>
            {getCompletedFields().count} of 13 fields completed
          </div>
          <div className={styles.progressSteps}>
            <div className={styles.stepIndicator}>
              <div className={`${styles.stepDot} ${getCompletedFields().count >= 1 ? styles.completed : ''}`}></div>
              <span className={styles.stepLabel}>Personal</span>
            </div>
            <div className={styles.stepIndicator}>
              <div className={`${styles.stepDot} ${getCompletedFields().count >= 7 ? styles.completed : getCompletedFields().count >= 4 ? styles.active : ''}`}></div>
              <span className={styles.stepLabel}>Address</span>
            </div>
            <div className={styles.stepIndicator}>
              <div className={`${styles.stepDot} ${getCompletedFields().count >= 10 ? styles.completed : getCompletedFields().count >= 8 ? styles.active : ''}`}></div>
              <span className={styles.stepLabel}>Healthcare</span>
            </div>
            <div className={styles.stepIndicator}>
              <div className={`${styles.stepDot} ${getCompletedFields().count >= 13 ? styles.completed : getCompletedFields().count >= 11 ? styles.active : ''}`}></div>
              <span className={styles.stepLabel}>Account</span>
            </div>
          </div>
        </div>

            <div className={styles.stepActions}>
              <button
                type="button"
                className={styles.backButton}
                onClick={prevStep}
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={isLoading || !isValid}
                className={`${styles.submitButton} ${!isValid ? styles.submitDisabled : ''}`}
              >
                {isLoading ? (
                  <>
                    <span className={styles.spinner}></span>
                    Creating Account...
                  </>
                ) : (
                  <>
                    {isValid ? '✓ ' : ''}Create Account
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        <div className={styles.formFooter}>
          <p className={styles.footerText}>
            Already have an account?{' '}
            <Link to="/login" className={styles.footerLink}>
              Sign in here
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};
