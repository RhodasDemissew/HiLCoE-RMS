import { createContext, useContext, useCallback, useState } from 'react';

const FormValidationContext = createContext();

export const useFormValidation = () => {
  const context = useContext(FormValidationContext);
  if (!context) {
    throw new Error('useFormValidation must be used within a ValidatedForm');
  }
  return context;
};

export const ValidatedForm = ({ 
  children, 
  validators = {}, 
  initialValues = {},
  onSubmit,
  className = ''
}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback((fieldName, value) => {
    const validator = validators[fieldName];
    if (!validator) return true;
    
    const result = validator(value);
    setErrors(prev => ({
      ...prev,
      [fieldName]: result.message
    }));
    return result.isValid;
  }, [validators]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    let isFormValid = true;
    
    Object.keys(validators).forEach(fieldName => {
      const validator = validators[fieldName];
      const value = values[fieldName];
      const result = validator(value);
      
      if (!result.isValid) {
        newErrors[fieldName] = result.message;
        isFormValid = false;
      }
    });
    
    setErrors(newErrors);
    return isFormValid;
  }, [validators, values]);

  const setFieldValue = useCallback((fieldName, value) => {
    setValues(prev => ({ ...prev, [fieldName]: value }));
    
    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: '' }));
    }
  }, [errors]);

  const setFieldTouched = useCallback((fieldName) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
  }, []);

  const handleFieldBlur = useCallback((fieldName) => {
    setFieldTouched(fieldName);
    validateField(fieldName, values[fieldName]);
  }, [setFieldTouched, validateField, values]);

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();
    
    // Mark all fields as touched
    const allTouched = {};
    Object.keys(validators).forEach(fieldName => {
      allTouched[fieldName] = true;
    });
    setTouched(allTouched);
    
    const isFormValid = validateForm();
    if (!isFormValid) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onSubmit(values, { setErrors, setFieldError: (field, error) => setErrors(prev => ({ ...prev, [field]: error })) });
    } finally {
      setIsSubmitting(false);
    }
  }, [validateForm, onSubmit, values, validators]);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const contextValue = {
    values,
    errors,
    touched,
    isSubmitting,
    setFieldValue,
    setFieldTouched,
    handleFieldBlur,
    validateField,
    validateForm,
    resetForm
  };

  return (
    <FormValidationContext.Provider value={contextValue}>
      <form onSubmit={handleSubmit} className={className}>
        {children}
      </form>
    </FormValidationContext.Provider>
  );
};

export default ValidatedForm;
