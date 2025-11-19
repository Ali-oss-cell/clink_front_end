import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import type { LoginRequest } from '../../../types/simple-auth';
import { authService } from '../../../services/api/auth';
import { getPrivacyPolicyStatus } from '../../../services/api/privacy';
import { WarningIcon, CheckCircleIcon } from '../../../utils/icons';
import styles from './Login.module.scss';

// Helper function to get redirect path based on user role
const getRedirectPath = (role: string): string => {
  switch (role) {
    case 'patient':
      return '/patient/dashboard';
    case 'psychologist':
      return '/psychologist/dashboard';
    case 'practice_manager':
      return '/manager/dashboard';
    case 'admin':
      return '/admin/dashboard';
    default:
      return '/';
  }
};

interface LoginProps {
  onLogin?: (credentials: LoginRequest) => Promise<void>;
  onLoginSuccess?: () => boolean;
}

export const Login: React.FC<LoginProps> = ({ onLogin, onLoginSuccess }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginRequest>({
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data: LoginRequest) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (onLogin) {
        await onLogin(data);
      } else {
        // Use authentication service
        await authService.login(data);
      }
      
      // Show success message
      setSuccess('Login successful! Redirecting...');
      
      // Update authentication state in App component
      if (onLoginSuccess) {
        onLoginSuccess();
      }
      
      // Get user data and check Privacy Policy status
      const user = authService.getStoredUser();
      
      if (user) {
        // Check Privacy Policy status
        try {
          const privacyStatus = await getPrivacyPolicyStatus();
          
          // If Privacy Policy not accepted or needs update, store status for ProtectedRoute
          if (!privacyStatus.accepted || privacyStatus.needs_update) {
            // Store privacy status in sessionStorage to show modal on next page
            sessionStorage.setItem('privacy_policy_required', 'true');
            sessionStorage.setItem('privacy_policy_status', JSON.stringify(privacyStatus));
            console.log('[Login] Privacy Policy acceptance required');
          } else {
            console.log('[Login] Privacy Policy already accepted');
          }
        } catch (privacyError: any) {
          // If Privacy Policy check fails, continue with normal flow
          // User will be prompted on protected routes if needed
          console.warn('[Login] Privacy Policy check failed:', privacyError.message);
          console.warn('[Login] User will be prompted on protected routes if needed');
        }
        
        // Small delay to show success message
        setTimeout(() => {
          const redirectPath = getRedirectPath(user.role);
          navigate(redirectPath);
        }, 1000);
      }
    } catch (err: any) {
      // Handle Django backend error messages
      if (err.message.includes('Invalid credentials')) {
        setError('Invalid email or password. Please check your credentials.');
      } else if (err.message.includes('Email and password are required')) {
        setError('Please enter both email and password.');
      } else if (err.message.includes('Backend server is not running')) {
        setError('Unable to connect to server. Please try again later.');
      } else if (err.message.includes('Network error')) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginForm}>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <div className={styles.formHeader}>
          <h2 className={styles.title}>Welcome Back</h2>
          <p className={styles.subtitle}>Sign in to access your patient portal</p>
        </div>

        {error && (
          <div className={styles.errorAlert}>
            <span className={styles.errorIcon}><WarningIcon size="md" /></span>
            {error}
          </div>
        )}

        {success && (
          <div className={styles.successAlert}>
            <span className={styles.successIcon}><CheckCircleIcon size="md" /></span>
            {success}
          </div>
        )}

        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.label}>
            Email Address
          </label>
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
            className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
            placeholder="your.email@example.com"
            disabled={isLoading}
          />
          {errors.email && (
            <span className={styles.fieldError}>{errors.email.message}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="password" className={styles.label}>
            Password
          </label>
          <input
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters'
              }
            })}
            type="password"
            id="password"
            className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
            placeholder="Enter your password"
            disabled={isLoading}
          />
          {errors.password && (
            <span className={styles.fieldError}>{errors.password.message}</span>
          )}
        </div>

        <div className={styles.formOptions}>
          <label className={styles.checkboxLabel}>
            <input 
              type="checkbox" 
              className={styles.checkbox}
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <span className={styles.checkboxText}>Remember me</span>
          </label>
          <Link to="/forgot-password" className={styles.forgotLink}>
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={styles.submitButton}
        >
          {isLoading ? (
            <>
              <span className={styles.spinner}></span>
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </button>


        <div className={styles.formFooter}>
          <p className={styles.footerText}>
            Don't have an account?{' '}
            <Link to="/register" className={styles.footerLink}>
              Create one here
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};
