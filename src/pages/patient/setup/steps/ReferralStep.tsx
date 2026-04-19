import { useState, type ChangeEvent, type FC } from 'react';
import type { SetupStepComponentProps } from './setupStepTypes';
import { authService } from '../../../../services/api/auth';
import styles from './SetupStep.module.scss';

export const ReferralStep: FC<SetupStepComponentProps> = ({
  state,
  onAdvance,
  saving,
  error,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const status = state.readiness.referral_status;

  const hasUsableReferral = status === 'uploaded_pending_review' || status === 'verified';

  const pick = (e: ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] ?? null);
    setUploadError(null);
  };

  const upload = async () => {
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      await authService.uploadReferralDocument({ file });
      await onAdvance({ acknowledged: true });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={styles.form}>
      <p className={styles.formFull}>
        Medicare-rebated appointments require a valid Mental Health Treatment
        Plan (MHTP) referral from your GP. Upload a PDF or clear photo — our
        team will verify it (usually within one business day).
      </p>

      {hasUsableReferral ? (
        <div className={`${styles.formFull} ${styles.checkboxRow}`}>
          <span className={styles.checkboxText}>
            Referral on file: <strong>{status.replace(/_/g, ' ')}</strong>.
          </span>
        </div>
      ) : (
        <div className={styles.formFull}>
          <input
            type="file"
            accept=".pdf,image/*"
            onChange={pick}
            className={styles.input}
          />
          {file && (
            <p className={styles.hint} style={{ marginTop: '.5rem' }}>
              Selected: {file.name}
            </p>
          )}
        </div>
      )}

      {(error || uploadError) && (
        <p className={`${styles.formFull} ${styles.error}`}>
          {uploadError || error}
        </p>
      )}

      <div
        className={styles.formFull}
        style={{ display: 'flex', gap: '.75rem', justifyContent: 'flex-end' }}
      >
        {hasUsableReferral ? (
          <button
            type="button"
            className="patient-cta-primary"
            disabled={saving}
            onClick={() => void onAdvance({ acknowledged: true })}
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            className="patient-cta-primary"
            disabled={!file || uploading || saving}
            onClick={() => void upload()}
          >
            {uploading ? 'Uploading…' : 'Upload referral'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ReferralStep;
