import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { authService } from '../../../services/api/auth';
import { WarningIcon, CheckCircleIcon } from '../../../utils/icons';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import styles from '../Login/Login.module.scss';

interface ForgotForm {
  email: string;
}

export const ForgotPassword: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotForm>({ defaultValues: { email: '' } });

  const onSubmit = async (data: ForgotForm) => {
    setIsLoading(true);
    setError(null);
    setInfoMessage(null);
    try {
      const res = await authService.forgotPassword(data.email.trim());
      setInfoMessage(
        res?.message ||
          'If an account exists for that email, you will receive password reset instructions shortly.'
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginForm}>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <div className={styles.formHeader}>
          <h2 className={styles.title}>Reset your password</h2>
          <p className={styles.subtitle}>
            Enter the email you use for your account. We will send a link if an account exists.
          </p>
        </div>

        {error && (
          <div className={styles.errorAlert}>
            <span className={styles.errorIcon}>
              <WarningIcon size="md" />
            </span>
            {error}
          </div>
        )}

        {infoMessage && (
          <div className={styles.successAlert}>
            <span className={styles.successIcon}>
              <CheckCircleIcon size="md" />
            </span>
            {infoMessage}
          </div>
        )}

        <div className={styles.formGroup}>
          <label htmlFor="forgot-email" className={styles.label}>
            Email address
          </label>
          <Input
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Please enter a valid email address',
              },
            })}
            type="email"
            id="forgot-email"
            autoComplete="email"
            className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
            placeholder="your.email@example.com"
            disabled={isLoading}
          />
          {errors.email && (
            <span className={styles.fieldError}>{errors.email.message}</span>
          )}
        </div>

        <Button type="submit" disabled={isLoading} className={styles.submitButton}>
          {isLoading ? (
            <>
              <span className={styles.spinner}></span>
              Sending…
            </>
          ) : (
            'Send reset link'
          )}
        </Button>

        <div className={styles.formFooter}>
          <p className={styles.footerText}>
            <Link to="/login" className={styles.footerLink}>
              Back to sign in
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};
