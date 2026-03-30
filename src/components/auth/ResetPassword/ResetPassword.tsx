import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { authService } from '../../../services/api/auth';
import { WarningIcon, CheckCircleIcon } from '../../../utils/icons';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import styles from '../Login/Login.module.scss';

interface ResetForm {
  new_password: string;
  new_password_confirm: string;
}

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetForm>({
    defaultValues: { new_password: '', new_password_confirm: '' },
  });

  const pwd = watch('new_password');

  useEffect(() => {
    if (!token.trim()) {
      setError('This reset link is missing a token. Open the link from your email or request a new reset.');
    }
  }, [token]);

  const onSubmit = async (data: ResetForm) => {
    if (!token.trim()) return;
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await authService.resetPassword(token.trim(), data.new_password);
      setSuccess('Your password has been updated. You can sign in with your new password.');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not reset password.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginForm}>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <div className={styles.formHeader}>
          <h2 className={styles.title}>Choose a new password</h2>
          <p className={styles.subtitle}>
            Use a strong password that meets your account requirements.
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

        {success && (
          <div className={styles.successAlert}>
            <span className={styles.successIcon}>
              <CheckCircleIcon size="md" />
            </span>
            {success}
          </div>
        )}

        <div className={styles.formGroup}>
          <label htmlFor="new_password" className={styles.label}>
            New password
          </label>
          <Input
            {...register('new_password', {
              required: 'Password is required',
              minLength: {
                value: 8,
                message: 'Use at least 8 characters (backend may require more)',
              },
            })}
            type="password"
            id="new_password"
            autoComplete="new-password"
            className={`${styles.input} ${errors.new_password ? styles.inputError : ''}`}
            disabled={isLoading || !token}
          />
          {errors.new_password && (
            <span className={styles.fieldError}>{errors.new_password.message}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="new_password_confirm" className={styles.label}>
            Confirm new password
          </label>
          <Input
            {...register('new_password_confirm', {
              required: 'Please confirm your password',
              validate: (v) => v === pwd || 'Passwords do not match',
            })}
            type="password"
            id="new_password_confirm"
            autoComplete="new-password"
            className={`${styles.input} ${errors.new_password_confirm ? styles.inputError : ''}`}
            disabled={isLoading || !token}
          />
          {errors.new_password_confirm && (
            <span className={styles.fieldError}>{errors.new_password_confirm.message}</span>
          )}
        </div>

        <Button type="submit" disabled={isLoading || !token} className={styles.submitButton}>
          {isLoading ? (
            <>
              <span className={styles.spinner}></span>
              Updating…
            </>
          ) : (
            'Update password'
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
