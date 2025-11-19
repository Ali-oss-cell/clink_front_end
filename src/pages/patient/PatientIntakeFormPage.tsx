import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Layout } from '../../components/common/Layout/Layout';
import { intakeService } from '../../services/api/intake';
import { validateIntakeForm } from '../../utils/validation';
import styles from './PatientPages.module.scss';

// Import the interface from the service
import type { IntakeFormData } from '../../services/api/intake';

export const PatientIntakeFormPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get pre-filled data from login
  const preFilledData = intakeService.getPreFilledData();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
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
      state: preFilledData.state || '',
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
      client_signature: preFilledData.client_signature || '',
      consent_date: preFilledData.consent_date || ''
    }
  });

  const watchedHasGpReferral = watch('has_gp_referral');
  const watchedPreviousTherapy = watch('previous_therapy');
  const watchedCurrentMedications = watch('current_medications');
  const watchedOtherHealthProfessionals = watch('other_health_professionals');
  const watchedMedicalConditions = watch('medical_conditions');

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

  const onSubmit = async (data: IntakeFormData) => {
    setIsSubmitting(true);
    try {
      // Validate form before submission
      const validationErrors = validateForm(data);
      if (validationErrors.length > 0) {
        alert('Please fix the following issues:\n\n' + validationErrors.join('\n'));
        return;
      }
      
      // Submit to Django backend API
      await intakeService.submitIntakeForm(data);
      
      alert('Intake form submitted successfully!');
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
                <input
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
                <input
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
                <input
                  {...register('preferred_name')}
                  className={styles.input}
                  placeholder="What would you like to be called?"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Date of Birth *</label>
                <input
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
                <input
                  {...register('gender_identity')}
                  className={styles.input}
                  placeholder="How do you identify?"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Pronouns <span className={styles.optionalLabel}>(Optional)</span></label>
                <input
                  {...register('pronouns')}
                  className={styles.input}
                  placeholder="e.g., they/them, she/her, he/him"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Street Address *</label>
                <input
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
                <input
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
                <select
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
                </select>
                {preFilledData.state && (
                  <span className={styles.preFilledLabel}><CheckCircleIcon size="xs" style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Pre-filled from your account</span>
                )}
                {errors.state && <span className={styles.fieldError}>{errors.state.message}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Postcode *</label>
                <input
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
                <input
                  {...register('home_phone')}
                  className={styles.input}
                  placeholder="Enter home phone number"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Mobile Phone *</label>
                <input
                  {...register('phone_number', { required: 'Mobile phone is required' })}
                  className={`${styles.input} ${errors.phone_number ? styles.inputError : ''} ${preFilledData.phone_number ? styles.preFilled : ''}`}
                  placeholder="Enter mobile phone number"
                />
                {preFilledData.phone_number && (
                  <span className={styles.preFilledLabel}><CheckCircleIcon size="xs" style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Pre-filled from your account</span>
                )}
                {errors.phone_number && <span className={styles.fieldError}>{errors.phone_number.message}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Email Address *</label>
                <input
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
                <input
                  {...register('emergency_contact_name', { required: 'Emergency contact name is required' })}
                  className={`${styles.input} ${errors.emergency_contact_name ? styles.inputError : ''}`}
                  placeholder="Enter emergency contact name"
                />
                {errors.emergency_contact_name && <span className={styles.fieldError}>{errors.emergency_contact_name.message}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Relationship *</label>
                <input
                  {...register('emergency_contact_relationship', { required: 'Relationship is required' })}
                  className={`${styles.input} ${errors.emergency_contact_relationship ? styles.inputError : ''}`}
                  placeholder="e.g., Spouse, Parent, Friend"
                />
                {errors.emergency_contact_relationship && <span className={styles.fieldError}>{errors.emergency_contact_relationship.message}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Emergency Contact Phone *</label>
                <input
                  {...register('emergency_contact_phone', { required: 'Emergency contact phone is required' })}
                  className={`${styles.input} ${errors.emergency_contact_phone ? styles.inputError : ''}`}
                  placeholder="Enter emergency contact phone number"
                />
                {errors.emergency_contact_phone && <span className={styles.fieldError}>{errors.emergency_contact_phone.message}</span>}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>3. Referral Information</h3>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>How did you hear about us? *</label>
                <select
                  {...register('referral_source', { required: 'Referral source is required' })}
                  className={`${styles.select} ${errors.referral_source ? styles.inputError : ''}`}
                >
                  <option value="">Select an option</option>
                  <option value="gp">GP Referral</option>
                  <option value="friend">Friend/Family</option>
                  <option value="online">Online Search</option>
                  <option value="psychology-today">Psychology Today</option>
                  <option value="other">Other</option>
                </select>
                {errors.referral_source && <span className={styles.fieldError}>{errors.referral_source.message}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Were you referred by a GP? *</label>
                <div className={styles.radioGroup}>
                  <label className={styles.radioWrapper}>
                    <input
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
                    <input
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
                  <div className={styles.formGroup}>
                    <label className={styles.label}>GP's Name <span className={styles.recommendedLabel}>(Recommended)</span></label>
                    <input
                      {...register('gp_name')}
                      className={styles.input}
                      placeholder="Enter GP's name"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Practice Name <span className={styles.recommendedLabel}>(Recommended)</span></label>
                    <input
                      {...register('gp_practice_name')}
                      className={styles.input}
                      placeholder="Enter practice name"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Provider Number <span className={styles.optionalLabel}>(Optional)</span></label>
                    <input
                      {...register('gp_provider_number')}
                      className={styles.input}
                      placeholder="Enter provider number"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Practice Address <span className={styles.optionalLabel}>(Optional)</span></label>
                    <textarea
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
                    <input
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
                    <input
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
                  <textarea
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
                    <input
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
                    <input
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
                  <textarea
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
                    <input
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
                    <input
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
                  <textarea
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
                    <input
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
                    <input
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
                  <textarea
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
                <textarea
                  {...register('presenting_concerns', { required: 'Presenting concerns are required' })}
                  className={`${styles.textarea} ${errors.presenting_concerns ? styles.inputError : ''}`}
                  placeholder="Please describe what's bringing you to therapy..."
                  rows={4}
                />
                {errors.presenting_concerns && <span className={styles.fieldError}>{errors.presenting_concerns.message}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>What are your goals for therapy? *</label>
                <textarea
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
            <h3 className={styles.sectionTitle}>6. Consent to Treatment</h3>
            <div className={styles.consentSection}>
              <p className={styles.consentText}>
                By signing below, you acknowledge that you have read and understood the information provided 
                and consent to treatment at Tailored Psychology. All information provided is confidential and 
                will be used solely for the purpose of providing you with appropriate psychological care.
              </p>
              
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Client Signature *</label>
                  <input
                    {...register('client_signature', { required: 'Signature is required' })}
                    className={`${styles.input} ${errors.client_signature ? styles.inputError : ''}`}
                    placeholder="Type your full name to sign"
                  />
                  {errors.client_signature && <span className={styles.fieldError}>{errors.client_signature.message}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Date *</label>
                  <input
                    {...register('consent_date', { required: 'Date is required' })}
                    type="date"
                    className={`${styles.input} ${errors.consent_date ? styles.inputError : ''}`}
                  />
                  {errors.consent_date && <span className={styles.fieldError}>{errors.consent_date.message}</span>}
                </div>
              </div>

              <div className={styles.checkboxGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    {...register('consent_to_treatment', { required: 'Consent is required' })}
                    type="checkbox"
                    className={styles.checkbox}
                  />
                  <span className={styles.checkboxText}>
                    I consent to treatment and have read the above information *
                  </span>
                </label>
                {errors.consent_to_treatment && <span className={styles.fieldError}>Consent is required</span>}
              </div>

              <div className={styles.checkboxGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    {...register('consent_to_telehealth')}
                    type="checkbox"
                    className={styles.checkbox}
                  />
                  <span className={styles.checkboxText}>
                    I consent to telehealth sessions <span className={styles.optionalLabel}>(Optional)</span>
                  </span>
                </label>
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
      user={{
        id: 1,
        first_name: 'John',
        last_name: 'Smith',
        full_name: 'John Smith',
        username: 'john.smith',
        role: 'patient' as const,
        email: 'john@example.com',
        phone_number: '+61 4XX XXX XXX',
        date_of_birth: '1990-01-01',
        age: 34,
        is_verified: true,
        created_at: '2024-01-01'
      }} 
      isAuthenticated={true}
      className={styles.patientLayout}
    >
      <div className={styles.dashboardContainer}>
        <div className="container">
          <div className={styles.dashboardHeader}>
            <h1 className={styles.welcomeTitle}>New Client Intake Form</h1>
            <p className={styles.welcomeSubtitle}>
              Welcome to Tailored Psychology! To ensure we provide you with the best possible care, 
              please complete this form prior to your first appointment. All information provided is confidential.
            </p>
            
            <div className={styles.requirementSummary}>
              <h3><ClipboardIcon size="md" style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Form Requirements</h3>
              <div className={styles.requirementGrid}>
                <div className={styles.requirementItem}>
                  <span className={styles.requiredIcon}>*</span>
                  <span><strong>9 Required Fields:</strong> Emergency contact, referral source, presenting concerns, therapy goals, consent & signature</span>
                </div>
                <div className={styles.requirementItem}>
                  <span className={styles.optionalIcon}>○</span>
                  <span><strong>21 Optional Fields:</strong> Personal preferences, medical history, additional details</span>
                </div>
                <div className={styles.requirementItem}>
                  <span className={styles.recommendedIcon}>!</span>
                  <span><strong>Conditional Fields:</strong> Some fields become recommended based on your answers</span>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className={styles.intakeForm}>
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
                <button
                  type="button"
                  onClick={prevStep}
                  className={styles.navButton}
                >
                  ← Previous
                </button>
              )}
              
              {currentStep < 6 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className={styles.navButton}
                >
                  Next →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={styles.submitButton}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Intake Form'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};
