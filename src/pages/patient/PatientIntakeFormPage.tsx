import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import PhoneInput from 'react-phone-number-input';
import { isValidPhoneNumber } from 'libphonenumber-js';
import 'react-phone-number-input/style.css';
import { Layout } from '../../components/common/Layout/Layout';
import { authService } from '../../services/api/auth';
import { intakeService } from '../../services/api/intake';
import { validateIntakeForm } from '../../utils/validation';
import { normalizeToE164 } from '../../utils/phoneE164';
import { CheckCircleIcon, ClipboardIcon } from '../../utils/icons';
import { Button } from '../../components/ui/button';
import { Checkbox } from '../../components/ui/checkbox';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import styles from './PatientPages.module.scss';
import shell from './PatientShellChrome.module.scss';

// Import the interface from the service
import type { IntakeFormData } from '../../services/api/intake';

export const PatientIntakeFormPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingIntake, setIsLoadingIntake] = useState(true);
  const [hasCompletedIntake, setHasCompletedIntake] = useState(false);
  const user = authService.getStoredUser() || {
    id: 1,
    email: 'patient@example.com',
    username: 'patient',
    first_name: 'Patient',
    last_name: '',
    full_name: 'Patient',
    role: 'patient' as const,
    phone_number: '',
    date_of_birth: '',
    age: 0,
    is_verified: true,
    created_at: new Date().toISOString(),
  };
  
  // Get pre-filled data from login
  const preFilledData = intakeService.getPreFilledData();
  
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    getValues,
    reset
  } = useForm<IntakeFormData>({
    defaultValues: {
      // Pre-fill with user data from login (API field names)
      first_name: preFilledData.first_name || '',
      last_name: preFilledData.last_name || '',
      email: preFilledData.email || '',
      phone_number: preFilledData.phone_number || '',
      date_of_birth: preFilledData.date_of_birth || '',
      address_line_1: preFilledData.address_line_1 || '',
      suburb: preFilledData.suburb || '',
      // State is required but may be empty initially - validation will catch it
      state: (preFilledData.state as "NSW" | "VIC" | "QLD" | "WA" | "SA" | "TAS" | "ACT" | "NT") || ('NSW' as const),
      postcode: preFilledData.postcode || '',
      medicare_number: preFilledData.medicare_number || '',
      preferred_name: preFilledData.preferred_name || '',
      gender_identity: preFilledData.gender_identity || '',
      pronouns: preFilledData.pronouns || '',
      home_phone: preFilledData.home_phone || '',
      emergency_contact_name: preFilledData.emergency_contact_name || '',
      emergency_contact_relationship: preFilledData.emergency_contact_relationship || '',
      emergency_contact_phone: preFilledData.emergency_contact_phone || '',
      referral_source: preFilledData.referral_source || '',
      has_gp_referral: preFilledData.has_gp_referral || false,
      gp_name: preFilledData.gp_name || '',
      gp_practice_name: preFilledData.gp_practice_name || '',
      gp_provider_number: preFilledData.gp_provider_number || '',
      gp_referral_date: preFilledData.gp_referral_date || '',
      gp_referral_expiry_date: preFilledData.gp_referral_expiry_date || '',
      gp_mhcp_reference: preFilledData.gp_mhcp_reference || '',
      gp_mhtp_related_mbs_items: preFilledData.gp_mhtp_related_mbs_items || '',
      gp_address: preFilledData.gp_address || '',
      previous_therapy: preFilledData.previous_therapy || false,
      previous_therapy_details: preFilledData.previous_therapy_details || '',
      current_medications: preFilledData.current_medications || false,
      medication_list: preFilledData.medication_list || '',
      other_health_professionals: preFilledData.other_health_professionals || false,
      other_health_details: preFilledData.other_health_details || '',
      medical_conditions: preFilledData.medical_conditions || false,
      medical_conditions_details: preFilledData.medical_conditions_details || '',
      presenting_concerns: preFilledData.presenting_concerns || '',
      therapy_goals: preFilledData.therapy_goals || '',
      consent_to_treatment: preFilledData.consent_to_treatment || false,
      consent_to_telehealth: preFilledData.consent_to_telehealth || false,
      telehealth_emergency_protocol_acknowledged: preFilledData.telehealth_emergency_protocol_acknowledged || false,
      telehealth_tech_requirements_acknowledged: preFilledData.telehealth_tech_requirements_acknowledged || false,
      telehealth_recording_consent: preFilledData.telehealth_recording_consent || false,
      privacy_policy_accepted: preFilledData.privacy_policy_accepted || false,
      consent_to_data_sharing: preFilledData.consent_to_data_sharing || false,
      consent_to_marketing: preFilledData.consent_to_marketing || false,
      email_notifications_enabled: preFilledData.email_notifications_enabled ?? true,
      sms_notifications_enabled: preFilledData.sms_notifications_enabled || false,
      appointment_reminders_enabled: preFilledData.appointment_reminders_enabled ?? true,
      share_progress_with_emergency_contact: preFilledData.share_progress_with_emergency_contact || false,
      parental_consent: preFilledData.parental_consent || false,
      parental_consent_name: preFilledData.parental_consent_name || '',
      parental_consent_signature: preFilledData.parental_consent_signature || '',
      intake_completed: preFilledData.intake_completed || false,
      client_signature: preFilledData.client_signature || '',
      consent_date: preFilledData.consent_date || ''
    }
  });

  const watchedHasGpReferral = watch('has_gp_referral');
  const watchedPreviousTherapy = watch('previous_therapy');
  const watchedCurrentMedications = watch('current_medications');
  const watchedOtherHealthProfessionals = watch('other_health_professionals');
  const watchedMedicalConditions = watch('medical_conditions');
  const watchedConsentToTelehealth = watch('consent_to_telehealth');

  const normalizePhoneField = (
    field: 'phone_number' | 'home_phone' | 'emergency_contact_phone',
    value: string | undefined
  ) => {
    const raw = String(value ?? '').trim();
    if (!raw) return;
    const normalized = normalizeToE164(raw);
    if (normalized) {
      setValue(field, normalized, { shouldValidate: true, shouldDirty: true });
    }
  };
  
  // Calculate age for parental consent (if date_of_birth is available)
  const dateOfBirth = watch('date_of_birth');
  const age = dateOfBirth ? 
    Math.floor((new Date().getTime() - new Date(dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 
    null;
  const isMinor = age !== null && age < 18;

  useEffect(() => {
    let isMounted = true;

    const loadExistingIntake = async () => {
      try {
        const existing = await intakeService.getIntakeForm();
        if (!isMounted || !existing) return;

        const mergedValues = {
          ...getValues(),
          ...existing,
        };

        mergedValues.phone_number =
          normalizeToE164(mergedValues.phone_number) || mergedValues.phone_number;
        mergedValues.home_phone =
          normalizeToE164(mergedValues.home_phone) || mergedValues.home_phone;
        mergedValues.emergency_contact_phone =
          normalizeToE164(mergedValues.emergency_contact_phone) || mergedValues.emergency_contact_phone;

        reset(mergedValues);
        setHasCompletedIntake(Boolean(existing.intake_completed));
      } catch (error) {
        // If no existing intake yet, keep initial pre-filled defaults.
        console.debug('No existing intake form found or failed to load.', error);
      } finally {
        if (isMounted) setIsLoadingIntake(false);
      }
    };

    loadExistingIntake();
    return () => {
      isMounted = false;
    };
  }, [getValues, reset]);

  useEffect(() => {
    const stepRaw = searchParams.get('step');
    const parsed = stepRaw ? parseInt(stepRaw, 10) : NaN;
    if (!Number.isNaN(parsed) && parsed >= 1 && parsed <= 6) {
      setCurrentStep(parsed);
    }
  }, [searchParams]);

  useEffect(() => {
    if (isLoadingIntake) return;
    if (searchParams.get('focus') !== 'gp_referral' || currentStep !== 3) return;
    const t = window.setTimeout(() => {
      document.getElementById('intake-gp-referral-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
    return () => window.clearTimeout(t);
  }, [isLoadingIntake, searchParams, currentStep]);

  // Helper function to check if a value is truthy (handles both boolean and string)
  const isTruthy = (value: boolean | string | undefined): boolean => {
    return value === true || value === 'true';
  };

  // Handle radio button changes to clear fields when "No" is selected
  const handleRadioChange = (field: keyof IntakeFormData, value: string) => {
    const boolValue = value === 'true';
    setValue(field, boolValue);
    
    // Clear related fields when "No" is selected
    if (!boolValue) {
      switch (field) {
        case 'has_gp_referral':
          setValue('gp_name', '');
          setValue('gp_practice_name', '');
          setValue('gp_provider_number', '');
          setValue('gp_referral_date', '');
          setValue('gp_referral_expiry_date', '');
          setValue('gp_mhcp_reference', '');
          setValue('gp_mhtp_related_mbs_items', '');
          setValue('gp_address', '');
          break;
        case 'previous_therapy':
          setValue('previous_therapy_details', '');
          break;
        case 'current_medications':
          setValue('medication_list', '');
          break;
        case 'other_health_professionals':
          setValue('other_health_details', '');
          break;
        case 'medical_conditions':
          setValue('medical_conditions_details', '');
          break;
      }
    }
  };

  // Helper function to get radio button checked state
  const isRadioChecked = (field: keyof IntakeFormData, value: string): boolean => {
    const currentValue = watch(field);
    return (currentValue === true && value === 'true') || (currentValue === false && value === 'false');
  };

  // Use comprehensive validation from utils
  const validateForm = (data: IntakeFormData): string[] => {
    return validateIntakeForm(data);
  };

  const onSubmit: SubmitHandler<IntakeFormData> = async (data) => {
    setIsSubmitting(true);
    try {
      const mobileNorm =
        normalizeToE164(data.phone_number) || (data.phone_number?.trim() ?? '');
      const homeNorm = data.home_phone?.trim()
        ? normalizeToE164(data.home_phone) || data.home_phone.trim()
        : '';
      const emergencyNorm =
        normalizeToE164(data.emergency_contact_phone) ||
        (data.emergency_contact_phone?.trim() ?? '');
      const payload: IntakeFormData = {
        ...data,
        phone_number: mobileNorm,
        home_phone: homeNorm,
        emergency_contact_phone: emergencyNorm,
      };

      const validationErrors = validateForm(payload);
      if (validationErrors.length > 0) {
        alert('Please fix the following issues:\n\n' + validationErrors.join('\n'));
        return;
      }

      await intakeService.submitIntakeForm(payload);
      setHasCompletedIntake(true);

      alert(hasCompletedIntake ? 'Intake form updated successfully!' : 'Intake form submitted successfully!');
      navigate('/patient/dashboard');
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error submitting form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>1. Personal Details</h3>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>First Name *</label>
                <Input
                  {...register('first_name', { required: 'First name is required' })}
                  className={`${styles.input} ${errors.first_name ? styles.inputError : ''} ${preFilledData.first_name ? styles.preFilled : ''}`}
                  placeholder="Enter your first name"
                />
                {preFilledData.first_name && (
                  <span className={styles.preFilledLabel}><CheckCircleIcon size="xs" style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Pre-filled from your account</span>
                )}
                {errors.first_name && <span className={styles.fieldError}>{errors.first_name.message}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Last Name *</label>
                <Input
                  {...register('last_name', { required: 'Last name is required' })}
                  className={`${styles.input} ${errors.last_name ? styles.inputError : ''} ${preFilledData.last_name ? styles.preFilled : ''}`}
                  placeholder="Enter your last name"
                />
                {preFilledData.last_name && (
                  <span className={styles.preFilledLabel}><CheckCircleIcon size="xs" style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Pre-filled from your account</span>
                )}
                {errors.last_name && <span className={styles.fieldError}>{errors.last_name.message}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Preferred Name <span className={styles.optionalLabel}>(Optional)</span></label>
                <Input
                  {...register('preferred_name')}
                  className={styles.input}
                  placeholder="What would you like to be called?"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Date of Birth *</label>
                <Input
                  {...register('date_of_birth', { required: 'Date of birth is required' })}
                  type="date"
                  className={`${styles.input} ${errors.date_of_birth ? styles.inputError : ''} ${preFilledData.date_of_birth ? styles.preFilled : ''}`}
                />
                {preFilledData.date_of_birth && (
                  <span className={styles.preFilledLabel}><CheckCircleIcon size="xs" style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Pre-filled from your account</span>
                )}
                {errors.date_of_birth && <span className={styles.fieldError}>{errors.date_of_birth.message}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Gender Identity <span className={styles.optionalLabel}>(Optional)</span></label>
                <Input
                  {...register('gender_identity')}
                  className={styles.input}
                  placeholder="How do you identify?"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Pronouns <span className={styles.optionalLabel}>(Optional)</span></label>
                <Input
                  {...register('pronouns')}
                  className={styles.input}
                  placeholder="e.g., they/them, she/her, he/him"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Street Address *</label>
                <Input
                  {...register('address_line_1', { required: 'Street address is required' })}
                  className={`${styles.input} ${errors.address_line_1 ? styles.inputError : ''} ${preFilledData.address_line_1 ? styles.preFilled : ''}`}
                  placeholder="Enter your street address"
                />
                {preFilledData.address_line_1 && (
                  <span className={styles.preFilledLabel}><CheckCircleIcon size="xs" style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Pre-filled from your account</span>
                )}
                {errors.address_line_1 && <span className={styles.fieldError}>{errors.address_line_1.message}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Suburb *</label>
                <Input
                  {...register('suburb', { required: 'Suburb is required' })}
                  className={`${styles.input} ${errors.suburb ? styles.inputError : ''} ${preFilledData.suburb ? styles.preFilled : ''}`}
                  placeholder="Enter your suburb"
                />
                {preFilledData.suburb && (
                  <span className={styles.preFilledLabel}><CheckCircleIcon size="xs" style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Pre-filled from your account</span>
                )}
                {errors.suburb && <span className={styles.fieldError}>{errors.suburb.message}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>State *</label>
                <Select
                  {...register('state', { required: 'State is required' })}
                  className={`${styles.select} ${errors.state ? styles.inputError : ''} ${preFilledData.state ? styles.preFilled : ''}`}
                >
                  <option value="">Select your state</option>
                  <option value="NSW">New South Wales (NSW)</option>
                  <option value="VIC">Victoria (VIC)</option>
                  <option value="QLD">Queensland (QLD)</option>
                  <option value="WA">Western Australia (WA)</option>
                  <option value="SA">South Australia (SA)</option>
                  <option value="TAS">Tasmania (TAS)</option>
                  <option value="ACT">Australian Capital Territory (ACT)</option>
                  <option value="NT">Northern Territory (NT)</option>
                </Select>
                {preFilledData.state && (
                  <span className={styles.preFilledLabel}><CheckCircleIcon size="xs" style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Pre-filled from your account</span>
                )}
                {errors.state && <span className={styles.fieldError}>{errors.state.message}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Postcode *</label>
                <Input
                  {...register('postcode', { required: 'Postcode is required' })}
                  className={`${styles.input} ${errors.postcode ? styles.inputError : ''} ${preFilledData.postcode ? styles.preFilled : ''}`}
                  placeholder="Enter your postcode"
                />
                {preFilledData.postcode && (
                  <span className={styles.preFilledLabel}><CheckCircleIcon size="xs" style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Pre-filled from your account</span>
                )}
                {errors.postcode && <span className={styles.fieldError}>{errors.postcode.message}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Home Phone <span className={styles.optionalLabel}>(Optional)</span></label>
                <p className={styles.intakePhoneHint}>International format (E.164). Leave blank if none.</p>
                <Controller
                  name="home_phone"
                  control={control}
                  rules={{
                    validate: (value) => {
                      if (!value || !String(value).trim()) return true;
                      return Boolean(normalizeToE164(String(value)) || isValidPhoneNumber(String(value).replace(/\s/g, '')))
                        || 'Use a valid phone number (you can type local format; we auto-convert)';
                    }
                  }}
                  render={({ field }) => (
                    <div
                      className={`${styles.intakePhoneField} ${
                        errors.home_phone ? styles.intakePhoneFieldError : ''
                      }`}
                    >
                      <PhoneInput
                        international
                        defaultCountry="AU"
                        countryCallingCodeEditable={false}
                        placeholder="Home phone (optional)"
                        value={field.value || undefined}
                        onChange={(v) => field.onChange(v ?? '')}
                        onBlur={() => {
                          field.onBlur();
                          normalizePhoneField('home_phone', field.value);
                        }}
                        name={field.name}
                        disabled={false}
                      />
                    </div>
                  )}
                />
                {errors.home_phone && (
                  <span className={styles.fieldError}>{errors.home_phone.message}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Mobile Phone *</label>
                <p className={styles.intakePhoneHint}>
                  Choose your country, then enter your number. Local format is accepted and auto-converted to E.164.
                </p>
                <Controller
                  name="phone_number"
                  control={control}
                  rules={{
                    validate: (value) => {
                      if (!value || String(value).trim() === '') {
                        return 'Mobile phone is required';
                      }
                      return Boolean(normalizeToE164(String(value)) || isValidPhoneNumber(String(value).replace(/\s/g, '')))
                        || 'Enter a valid mobile number';
                    }
                  }}
                  render={({ field }) => (
                    <div
                      className={`${styles.intakePhoneField} ${
                        errors.phone_number ? styles.intakePhoneFieldError : ''
                      }`}
                    >
                      <PhoneInput
                        international
                        defaultCountry="AU"
                        countryCallingCodeEditable={false}
                        placeholder="Mobile number"
                        value={field.value || undefined}
                        onChange={(v) => field.onChange(v ?? '')}
                        onBlur={() => {
                          field.onBlur();
                          normalizePhoneField('phone_number', field.value);
                        }}
                        id="phone_number"
                        name={field.name}
                        disabled={false}
                      />
                    </div>
                  )}
                />
                {preFilledData.phone_number && (
                  <span className={styles.preFilledLabel}>
                    <CheckCircleIcon size="xs" style={{ marginRight: '4px', verticalAlign: 'middle' }} />{' '}
                    Pre-filled from your account
                  </span>
                )}
                {errors.phone_number && (
                  <span className={styles.fieldError}>{errors.phone_number.message}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Email Address *</label>
                <Input
                  {...register('email', { 
                    required: 'Email address is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Please enter a valid email address'
                    }
                  })}
                  type="email"
                  className={`${styles.input} ${errors.email ? styles.inputError : ''} ${preFilledData.email ? styles.preFilled : ''}`}
                  placeholder="Enter your email address"
                />
                {preFilledData.email && (
                  <span className={styles.preFilledLabel}><CheckCircleIcon size="xs" style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Pre-filled from your account</span>
                )}
                {errors.email && <span className={styles.fieldError}>{errors.email.message}</span>}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>2. Emergency Contact</h3>
            <p className={styles.sectionDescription}>
              In case of an emergency, please provide details for someone we can contact.
            </p>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Emergency Contact Name *</label>
                <Input
                  {...register('emergency_contact_name', { required: 'Emergency contact name is required' })}
                  className={`${styles.input} ${errors.emergency_contact_name ? styles.inputError : ''}`}
                  placeholder="Enter emergency contact name"
                />
                {errors.emergency_contact_name && <span className={styles.fieldError}>{errors.emergency_contact_name.message}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Relationship *</label>
                <Input
                  {...register('emergency_contact_relationship', { required: 'Relationship is required' })}
                  className={`${styles.input} ${errors.emergency_contact_relationship ? styles.inputError : ''}`}
                  placeholder="e.g., Spouse, Parent, Friend"
                />
                {errors.emergency_contact_relationship && <span className={styles.fieldError}>{errors.emergency_contact_relationship.message}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Emergency Contact Phone *</label>
                <p className={styles.intakePhoneHint}>International format (E.164) with country selector.</p>
                <Controller
                  name="emergency_contact_phone"
                  control={control}
                  rules={{
                    validate: (value) => {
                      if (!value || String(value).trim() === '') {
                        return 'Emergency contact phone is required';
                      }
                      return Boolean(normalizeToE164(String(value)) || isValidPhoneNumber(String(value).replace(/\s/g, '')))
                        || 'Enter a valid emergency contact number';
                    }
                  }}
                  render={({ field }) => (
                    <div
                      className={`${styles.intakePhoneField} ${
                        errors.emergency_contact_phone ? styles.intakePhoneFieldError : ''
                      }`}
                    >
                      <PhoneInput
                        international
                        defaultCountry="AU"
                        countryCallingCodeEditable={false}
                        placeholder="Emergency contact number"
                        value={field.value || undefined}
                        onChange={(v) => field.onChange(v ?? '')}
                        onBlur={() => {
                          field.onBlur();
                          normalizePhoneField('emergency_contact_phone', field.value);
                        }}
                        name={field.name}
                        disabled={false}
                      />
                    </div>
                  )}
                />
                {errors.emergency_contact_phone && (
                  <span className={styles.fieldError}>{errors.emergency_contact_phone.message}</span>
                )}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div id="intake-gp-referral-section" className={styles.formSection}>
            <h3 className={styles.sectionTitle}>3. Referral Information</h3>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>How did you hear about us? *</label>
                <Select
                  {...register('referral_source', { required: 'Referral source is required' })}
                  className={`${styles.select} ${errors.referral_source ? styles.inputError : ''}`}
                >
                  <option value="">Select an option</option>
                  <option value="gp">GP Referral</option>
                  <option value="friend">Friend/Family</option>
                  <option value="online">Online Search</option>
                  <option value="psychology-today">Psychology Today</option>
                  <option value="other">Other</option>
                </Select>
                {errors.referral_source && <span className={styles.fieldError}>{errors.referral_source.message}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Were you referred by a GP? *</label>
                <div className={styles.radioGroup}>
                  <label className={styles.radioWrapper}>
                    <Input
                      {...register('has_gp_referral')}
                      type="radio"
                      value="true"
                      className={styles.radioInput}
                      onChange={(e) => handleRadioChange('has_gp_referral', e.target.value)}
                    />
                    <div className={`${styles.radioCustom} ${isRadioChecked('has_gp_referral', 'true') ? styles.radioChecked : ''}`}>
                      <div className={styles.radioDot}></div>
                    </div>
                    Yes
                  </label>
                  <label className={styles.radioWrapper}>
                    <Input
                      {...register('has_gp_referral')}
                      type="radio"
                      value="false"
                      className={styles.radioInput}
                      onChange={(e) => handleRadioChange('has_gp_referral', e.target.value)}
                    />
                    <div className={`${styles.radioCustom} ${isRadioChecked('has_gp_referral', 'false') ? styles.radioChecked : ''}`}>
                      <div className={styles.radioDot}></div>
                    </div>
                    No
                  </label>
                </div>
              </div>

              {isTruthy(watchedHasGpReferral) && (
                <>
                  <p className={styles.intakePhoneHint} style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
                    Medicare mental health care plan (MHCP): use the same details as on your referral. Referrals are
                    usually valid for 12 months from the referral date unless your GP recorded a different expiry.
                  </p>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>GP&apos;s name *</label>
                    <Input
                      {...register('gp_name')}
                      className={styles.input}
                      placeholder="Enter GP's name"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Practice name *</label>
                    <Input
                      {...register('gp_practice_name')}
                      className={styles.input}
                      placeholder="Enter practice name"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>GP referral date *</label>
                    <Input
                      {...register('gp_referral_date')}
                      type="date"
                      className={styles.input}
                    />
                    <span className={styles.optionalLabel}>On the plan or referral letter</span>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Referral expiry <span className={styles.optionalLabel}>(Optional)</span>
                    </label>
                    <Input
                      {...register('gp_referral_expiry_date')}
                      type="date"
                      className={styles.input}
                    />
                    <span className={styles.optionalLabel}>
                      If left blank, validity defaults from the referral date (typically 12 months).
                    </span>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>GP provider number *</label>
                    <Input
                      {...register('gp_provider_number')}
                      className={styles.input}
                      placeholder="Medicare provider number"
                    />
                    <span className={styles.optionalLabel}>Required for Medicare-rebated appointments.</span>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      MHCP / plan reference <span className={styles.optionalLabel}>(Optional)</span>
                    </label>
                    <Input
                      {...register('gp_mhcp_reference')}
                      className={styles.input}
                      placeholder="As shown on your document"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Related MBS items <span className={styles.optionalLabel}>(Optional)</span>
                    </label>
                    <Input
                      {...register('gp_mhtp_related_mbs_items')}
                      className={styles.input}
                      placeholder="e.g. 2710, 2712"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Practice address <span className={styles.optionalLabel}>(Optional)</span></label>
                    <Textarea
                      {...register('gp_address')}
                      className={styles.textarea}
                      placeholder="Enter practice address"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>4. Medical & Mental Health History</h3>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Have you had therapy or counselling before? *</label>
                <div className={styles.radioGroup}>
                  <label className={styles.radioWrapper}>
                    <Input
                      {...register('previous_therapy')}
                      type="radio"
                      value="true"
                      className={styles.radioInput}
                      onChange={(e) => handleRadioChange('previous_therapy', e.target.value)}
                    />
                    <div className={`${styles.radioCustom} ${isRadioChecked('previous_therapy', 'true') ? styles.radioChecked : ''}`}>
                      <div className={styles.radioDot}></div>
                    </div>
                    Yes
                  </label>
                  <label className={styles.radioWrapper}>
                    <Input
                      {...register('previous_therapy')}
                      type="radio"
                      value="false"
                      className={styles.radioInput}
                      onChange={(e) => handleRadioChange('previous_therapy', e.target.value)}
                    />
                    <div className={`${styles.radioCustom} ${isRadioChecked('previous_therapy', 'false') ? styles.radioChecked : ''}`}>
                      <div className={styles.radioDot}></div>
                    </div>
                    No
                  </label>
                </div>
              </div>

              {isTruthy(watchedPreviousTherapy) && (
                <div className={styles.formGroup}>
                  <label className={styles.label}>Previous Therapy Details <span className={styles.recommendedLabel}>(Recommended)</span></label>
                  <Textarea
                    {...register('previous_therapy_details')}
                    className={styles.textarea}
                    placeholder="When and with whom did you have therapy?"
                  />
                </div>
              )}

              <div className={styles.formGroup}>
                <label className={styles.label}>Are you currently taking any medications? *</label>
                <div className={styles.radioGroup}>
                  <label className={styles.radioWrapper}>
                    <Input
                      {...register('current_medications')}
                      type="radio"
                      value="true"
                      className={styles.radioInput}
                      onChange={(e) => handleRadioChange('current_medications', e.target.value)}
                    />
                    <div className={`${styles.radioCustom} ${isRadioChecked('current_medications', 'true') ? styles.radioChecked : ''}`}>
                      <div className={styles.radioDot}></div>
                    </div>
                    Yes
                  </label>
                  <label className={styles.radioWrapper}>
                    <Input
                      {...register('current_medications')}
                      type="radio"
                      value="false"
                      className={styles.radioInput}
                      onChange={(e) => handleRadioChange('current_medications', e.target.value)}
                    />
                    <div className={`${styles.radioCustom} ${isRadioChecked('current_medications', 'false') ? styles.radioChecked : ''}`}>
                      <div className={styles.radioDot}></div>
                    </div>
                    No
                  </label>
                </div>
              </div>

              {isTruthy(watchedCurrentMedications) && (
                <div className={styles.formGroup}>
                  <label className={styles.label}>Current Medications <span className={styles.recommendedLabel}>(Recommended)</span></label>
                  <Textarea
                    {...register('medication_list')}
                    className={styles.textarea}
                    placeholder="Please list all current medications, including dosages"
                  />
                </div>
              )}

              <div className={styles.formGroup}>
                <label className={styles.label}>Are you currently being seen by any other medical or health professional? *</label>
                <div className={styles.radioGroup}>
                  <label className={styles.radioWrapper}>
                    <Input
                      {...register('other_health_professionals')}
                      type="radio"
                      value="true"
                      className={styles.radioInput}
                      onChange={(e) => handleRadioChange('other_health_professionals', e.target.value)}
                    />
                    <div className={`${styles.radioCustom} ${isRadioChecked('other_health_professionals', 'true') ? styles.radioChecked : ''}`}>
                      <div className={styles.radioDot}></div>
                    </div>
                    Yes
                  </label>
                  <label className={styles.radioWrapper}>
                    <Input
                      {...register('other_health_professionals')}
                      type="radio"
                      value="false"
                      className={styles.radioInput}
                      onChange={(e) => handleRadioChange('other_health_professionals', e.target.value)}
                    />
                    <div className={`${styles.radioCustom} ${isRadioChecked('other_health_professionals', 'false') ? styles.radioChecked : ''}`}>
                      <div className={styles.radioDot}></div>
                    </div>
                    No
                  </label>
                </div>
              </div>

              {isTruthy(watchedOtherHealthProfessionals) && (
                <div className={styles.formGroup}>
                  <label className={styles.label}>Other Health Professionals <span className={styles.recommendedLabel}>(Recommended)</span></label>
                  <Textarea
                    {...register('other_health_details')}
                    className={styles.textarea}
                    placeholder="Who are you currently seeing?"
                  />
                </div>
              )}

              <div className={styles.formGroup}>
                <label className={styles.label}>Do you have any significant medical conditions? *</label>
                <div className={styles.radioGroup}>
                  <label className={styles.radioWrapper}>
                    <Input
                      {...register('medical_conditions')}
                      type="radio"
                      value="true"
                      className={styles.radioInput}
                      onChange={(e) => handleRadioChange('medical_conditions', e.target.value)}
                    />
                    <div className={`${styles.radioCustom} ${isRadioChecked('medical_conditions', 'true') ? styles.radioChecked : ''}`}>
                      <div className={styles.radioDot}></div>
                    </div>
                    Yes
                  </label>
                  <label className={styles.radioWrapper}>
                    <Input
                      {...register('medical_conditions')}
                      type="radio"
                      value="false"
                      className={styles.radioInput}
                      onChange={(e) => handleRadioChange('medical_conditions', e.target.value)}
                    />
                    <div className={`${styles.radioCustom} ${isRadioChecked('medical_conditions', 'false') ? styles.radioChecked : ''}`}>
                      <div className={styles.radioDot}></div>
                    </div>
                    No
                  </label>
                </div>
              </div>

              {isTruthy(watchedMedicalConditions) && (
                <div className={styles.formGroup}>
                  <label className={styles.label}>Medical Conditions <span className={styles.recommendedLabel}>(Recommended)</span></label>
                  <Textarea
                    {...register('medical_conditions_details')}
                    className={styles.textarea}
                    placeholder="Please describe any significant medical conditions"
                  />
                </div>
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>5. Presenting Concerns</h3>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>What brings you to therapy at this time? *</label>
                <Textarea
                  {...register('presenting_concerns', { required: 'Presenting concerns are required' })}
                  className={`${styles.textarea} ${errors.presenting_concerns ? styles.inputError : ''}`}
                  placeholder="Please describe what's bringing you to therapy..."
                  rows={4}
                />
                {errors.presenting_concerns && <span className={styles.fieldError}>{errors.presenting_concerns.message}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>What are your goals for therapy? *</label>
                <Textarea
                  {...register('therapy_goals', { required: 'Therapy goals are required' })}
                  className={`${styles.textarea} ${errors.therapy_goals ? styles.inputError : ''}`}
                  placeholder="What would you like to achieve through therapy?"
                  rows={4}
                />
                {errors.therapy_goals && <span className={styles.fieldError}>{errors.therapy_goals.message}</span>}
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>6. Consent & Preferences</h3>
            <div className={styles.consentSection}>
              <p className={styles.consentText}>
                By signing below, you acknowledge that you have read and understood the information provided 
                and consent to treatment at Tailored Psychology. All information provided is confidential and 
                will be used solely for the purpose of providing you with appropriate psychological care.
              </p>
              
              {/* Required Consents */}
              <div className={styles.consentSubsection}>
                <h4 className={styles.subsectionTitle}>Required Consents *</h4>
                
                <div className={styles.checkboxGroup}>
                  <label className={styles.checkboxLabel}>
                    <Checkbox
                      {...register('consent_to_treatment', { required: 'Consent to treatment is required' })} className={styles.checkbox} />
                    <span className={styles.checkboxText}>
                      I consent to treatment and have read the above information *
                    </span>
                  </label>
                  {errors.consent_to_treatment && <span className={styles.fieldError}>Consent is required</span>}
                </div>

                <div className={styles.checkboxGroup}>
                  <label className={styles.checkboxLabel}>
                    <Checkbox
                      {...register('privacy_policy_accepted', { required: 'Privacy policy acceptance is required' })} className={styles.checkbox} />
                    <span className={styles.checkboxText}>
                      I have read and accept the Privacy Policy (Privacy Act 1988 compliance) *
                    </span>
                  </label>
                  {errors.privacy_policy_accepted && <span className={styles.fieldError}>Privacy policy acceptance is required</span>}
                </div>
              </div>

              {/* Telehealth Consent */}
              <div className={styles.consentSubsection}>
                <h4 className={styles.subsectionTitle}>Telehealth Consent</h4>
                
                <div className={styles.checkboxGroup}>
                  <label className={styles.checkboxLabel}>
                    <Checkbox
                      {...register('consent_to_telehealth')} className={styles.checkbox} />
                    <span className={styles.checkboxText}>
                      I consent to telehealth sessions <span className={styles.optionalLabel}>(Optional)</span>
                    </span>
                  </label>
                </div>

                {watchedConsentToTelehealth && (
                  <>
                    <div className={styles.checkboxGroup}>
                      <label className={styles.checkboxLabel}>
                        <Checkbox
                          {...register('telehealth_emergency_protocol_acknowledged')} className={styles.checkbox} />
                        <span className={styles.checkboxText}>
                          I acknowledge the telehealth emergency protocol *
                        </span>
                      </label>
                    </div>

                    <div className={styles.checkboxGroup}>
                      <label className={styles.checkboxLabel}>
                        <Checkbox
                          {...register('telehealth_tech_requirements_acknowledged')} className={styles.checkbox} />
                        <span className={styles.checkboxText}>
                          I acknowledge the telehealth technical requirements *
                        </span>
                      </label>
                    </div>

                    <div className={styles.checkboxGroup}>
                      <label className={styles.checkboxLabel}>
                        <Checkbox
                          {...register('telehealth_recording_consent')} className={styles.checkbox} />
                        <span className={styles.checkboxText}>
                          I consent to session recording (if applicable) <span className={styles.optionalLabel}>(Optional)</span>
                        </span>
                      </label>
                    </div>
                  </>
                )}
              </div>

              {/* Data Sharing & Marketing */}
              <div className={styles.consentSubsection}>
                <h4 className={styles.subsectionTitle}>Data Sharing & Communication</h4>
                
                <div className={styles.checkboxGroup}>
                  <label className={styles.checkboxLabel}>
                    <Checkbox
                      {...register('consent_to_data_sharing')} className={styles.checkbox} />
                    <span className={styles.checkboxText}>
                      I consent to data sharing with third-party services (Twilio, Stripe) for appointment and payment processing <span className={styles.optionalLabel}>(Recommended)</span>
                    </span>
                  </label>
                </div>

                <div className={styles.checkboxGroup}>
                  <label className={styles.checkboxLabel}>
                    <Checkbox
                      {...register('consent_to_marketing')} className={styles.checkbox} />
                    <span className={styles.checkboxText}>
                      I consent to receive marketing communications <span className={styles.optionalLabel}>(Optional)</span>
                    </span>
                  </label>
                </div>
              </div>

              {/* Communication Preferences */}
              <div className={styles.consentSubsection}>
                <h4 className={styles.subsectionTitle}>Communication Preferences</h4>
                
                <div className={styles.checkboxGroup}>
                  <label className={styles.checkboxLabel}>
                    <Checkbox
                      {...register('email_notifications_enabled')} className={styles.checkbox} defaultChecked={true}
                    />
                    <span className={styles.checkboxText}>
                      Email notifications enabled
                    </span>
                  </label>
                </div>

                <div className={styles.checkboxGroup}>
                  <label className={styles.checkboxLabel}>
                    <Checkbox
                      {...register('sms_notifications_enabled')} className={styles.checkbox} />
                    <span className={styles.checkboxText}>
                      SMS notifications enabled
                    </span>
                  </label>
                </div>

                <div className={styles.checkboxGroup}>
                  <label className={styles.checkboxLabel}>
                    <Checkbox
                      {...register('appointment_reminders_enabled')} className={styles.checkbox} defaultChecked={true}
                    />
                    <span className={styles.checkboxText}>
                      Appointment reminders enabled
                    </span>
                  </label>
                </div>
              </div>

              {/* Privacy Preferences */}
              <div className={styles.consentSubsection}>
                <h4 className={styles.subsectionTitle}>Privacy Preferences</h4>
                
                <div className={styles.checkboxGroup}>
                  <label className={styles.checkboxLabel}>
                    <Checkbox
                      {...register('share_progress_with_emergency_contact')} className={styles.checkbox} />
                    <span className={styles.checkboxText}>
                      Share progress updates with emergency contact <span className={styles.optionalLabel}>(Optional)</span>
                    </span>
                  </label>
                </div>
              </div>

              {/* Parental Consent (if minor) */}
              {isMinor && (
                <div className={styles.consentSubsection}>
                  <h4 className={styles.subsectionTitle}>Parental Consent (Required for patients under 18)</h4>
                  
                  <div className={styles.checkboxGroup}>
                    <label className={styles.checkboxLabel}>
                      <Checkbox
                        {...register('parental_consent', { required: 'Parental consent is required for patients under 18' })} className={styles.checkbox} />
                      <span className={styles.checkboxText}>
                        Parent/Guardian consent provided *
                      </span>
                    </label>
                    {errors.parental_consent && <span className={styles.fieldError}>{errors.parental_consent.message}</span>}
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Parent/Guardian Name *</label>
                    <Input
                      {...register('parental_consent_name', { required: isMinor ? 'Parent/guardian name is required' : false })}
                      className={`${styles.input} ${errors.parental_consent_name ? styles.inputError : ''}`}
                      placeholder="Full name of parent/guardian"
                    />
                    {errors.parental_consent_name && <span className={styles.fieldError}>{errors.parental_consent_name.message}</span>}
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Parent/Guardian Signature *</label>
                    <Input
                      {...register('parental_consent_signature', { required: isMinor ? 'Parent/guardian signature is required' : false })}
                      className={`${styles.input} ${errors.parental_consent_signature ? styles.inputError : ''}`}
                      placeholder="Type full name to sign"
                    />
                    {errors.parental_consent_signature && <span className={styles.fieldError}>{errors.parental_consent_signature.message}</span>}
                  </div>
                </div>
              )}

              {/* Signature Section */}
              <div className={styles.consentSubsection}>
                <h4 className={styles.subsectionTitle}>Client Signature</h4>
                
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Client Signature *</label>
                    <Input
                      {...register('client_signature', { required: 'Signature is required' })}
                      className={`${styles.input} ${errors.client_signature ? styles.inputError : ''}`}
                      placeholder="Type your full name to sign"
                    />
                    {errors.client_signature && <span className={styles.fieldError}>{errors.client_signature.message}</span>}
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Date *</label>
                    <Input
                      {...register('consent_date', { required: 'Date is required' })}
                      type="date"
                      className={`${styles.input} ${errors.consent_date ? styles.inputError : ''}`}
                      defaultValue={new Date().toISOString().split('T')[0]}
                    />
                    {errors.consent_date && <span className={styles.fieldError}>{errors.consent_date.message}</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Layout 
      user={user}
      isAuthenticated={true}
      patientShell
      className={styles.patientLayout}
    >
      <div className={shell.wrap}>
        <header className={shell.pageHeader}>
          <p className={styles.intakeKicker}>Intake form</p>
          <h1 className={shell.welcomeTitle}>
            {hasCompletedIntake ? 'Update Your Intake Form' : 'New Client Intake Form'}
          </h1>
          <p className={shell.welcomeSubtitle}>
              {hasCompletedIntake
                ? 'Your intake form is already on file. Review your details below and update anything that changed.'
                : 'Welcome to Tailored Psychology! To ensure we provide you with the best possible care, please complete this form prior to your first appointment. All information provided is confidential.'}
          </p>
          {hasCompletedIntake && (
            <div className={styles.intakeStatusBanner}>You have previously completed this form. You are now updating it.</div>
          )}

          <div className={styles.requirementSummary}>
            <h3>
              <ClipboardIcon size="md" style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Form Requirements
            </h3>
            <div className={styles.requirementGrid}>
              <div className={styles.requirementItem}>
                <span className={styles.requiredIcon}>*</span>
                <span>
                  <strong>9 Required Fields:</strong> Emergency contact, referral source, presenting concerns, therapy
                  goals, consent & signature
                </span>
              </div>
              <div className={styles.requirementItem}>
                <span className={styles.optionalIcon}>○</span>
                <span>
                  <strong>21 Optional Fields:</strong> Personal preferences, medical history, additional details
                </span>
              </div>
              <div className={styles.requirementItem}>
                <span className={styles.recommendedIcon}>!</span>
                <span>
                  <strong>Conditional Fields:</strong> Some fields become recommended based on your answers
                </span>
              </div>
            </div>
          </div>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.intakeForm}>
            {isLoadingIntake && <p className={styles.loadingMessage}>Loading your existing intake details...</p>}
            <div className={styles.progressIndicator}>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill}
                  style={{ width: `${(currentStep / 6) * 100}%` }}
                ></div>
              </div>
              <span className={styles.progressText}>
                Step {currentStep} of 6
              </span>
            </div>

            {renderStep()}

            <div className={styles.formNavigation}>
              {currentStep > 1 && (
                <Button
                  type="button"
                  onClick={prevStep}
                  className={styles.navButton}
                >
                  ← Previous
                </Button>
              )}
              
              {currentStep < 6 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className={styles.navButton}
                >
                  Next →
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className={styles.submitButton}
                >
                  {isSubmitting
                    ? (hasCompletedIntake ? 'Updating...' : 'Submitting...')
                    : (hasCompletedIntake ? 'Update Intake Form' : 'Submit Intake Form')}
                </Button>
              )}
            </div>
        </form>
      </div>
    </Layout>
  );
};
