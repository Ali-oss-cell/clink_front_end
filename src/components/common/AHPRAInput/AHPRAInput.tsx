import React, { useState, useEffect } from 'react';
import { validateAHPRA, type AHPRAValidationResult } from '../../../utils/validation';
import styles from './AHPRAInput.module.scss';

interface AHPRAInputProps {
  value: string;
  onChange: (value: string, validation: AHPRAValidationResult) => void;
  onBlur?: () => void;
  role?: 'psychologist' | 'practice_manager' | 'admin';
  required?: boolean;
  placeholder?: string;
  className?: string;
  error?: string;
  showHelpText?: boolean;
  disabled?: boolean;
}

export const AHPRAInput: React.FC<AHPRAInputProps> = ({
  value,
  onChange,
  onBlur,
  role = 'psychologist',
  required = false,
  placeholder = 'PSY0001234567',
  className = '',
  error: externalError,
  showHelpText = true,
  disabled = false
}) => {
  const [displayValue, setDisplayValue] = useState(value || '');
  const [internalError, setInternalError] = useState<string | undefined>();
  const [touched, setTouched] = useState(false);

  // Update display value when external value changes
  useEffect(() => {
    setDisplayValue(value || '');
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value;

    // Remove all non-alphanumeric characters
    input = input.replace(/[^A-Za-z0-9]/g, '');

    // Convert to uppercase
    input = input.toUpperCase();

    // Limit to 13 characters (3 letters + 10 digits)
    if (input.length > 13) {
      input = input.substring(0, 13);
    }

    // Auto-format: Add space after 3 letters if user is typing
    let formatted = input;
    if (input.length > 3) {
      formatted = input.substring(0, 3) + ' ' + input.substring(3);
    }

    setDisplayValue(formatted);

    // Validate the cleaned value
    const cleaned = input;
    const validation = validateAHPRA(cleaned, role);

    // Only show error if field is touched or has value
    if (touched || cleaned.length > 0) {
      setInternalError(validation.isValid ? undefined : validation.error);
    } else {
      setInternalError(undefined);
    }

    // Call parent onChange with cleaned value and validation
    onChange(cleaned, validation);
  };

  const handleBlur = () => {
    setTouched(true);
    const cleaned = displayValue.replace(/\s/g, '');
    const validation = validateAHPRA(cleaned, role);
    
    if (!validation.isValid) {
      setInternalError(validation.error);
    } else {
      setInternalError(undefined);
    }

    if (onBlur) {
      onBlur();
    }
  };

  const handleFocus = () => {
    setTouched(true);
  };

  const error = externalError || internalError;
  const hasError = !!error && (touched || displayValue.length > 0);

  return (
    <div className={`${styles.ahpraInputWrapper} ${className}`}>
      <input
        type="text"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        maxLength={14} // 3 letters + space + 10 digits
        required={required}
        disabled={disabled}
        className={`${styles.ahpraInput} ${hasError ? styles.error : ''} ${disabled ? styles.disabled : ''}`}
        style={{
          textTransform: 'uppercase',
          letterSpacing: '0.1em'
        }}
      />
      {hasError && (
        <div className={styles.errorMessage}>{error}</div>
      )}
      {showHelpText && !hasError && (
        <small className={styles.helpText}>
          Format: {role === 'psychologist' ? 'PSY' : '3 letters'} followed by 10 digits (e.g., {role === 'psychologist' ? 'PSY0001234567' : 'ABC0001234567'})
        </small>
      )}
    </div>
  );
};

