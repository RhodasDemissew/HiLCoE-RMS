import { useState, useCallback } from 'react';

/**
 * Custom hook for individual field validation
 * @param {string} initialValue - Initial field value
 * @param {function} validator - Validation function
 * @returns {object} Field validation state and handlers
 */
export const useFieldValidation = (initialValue = '', validator) => {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);
  
  const validate = useCallback(() => {
    if (!validator) return true;
    
    const result = validator(value);
    setError(result.message);
    return result.isValid;
  }, [value, validator]);
  
  const handleChange = useCallback((newValue) => {
    setValue(newValue);
    if (touched) {
      validate();
    }
  }, [touched, validate]);
  
  const handleBlur = useCallback(() => {
    setTouched(true);
    validate();
  }, [validate]);
  
  const reset = useCallback(() => {
    setValue(initialValue);
    setError('');
    setTouched(false);
  }, [initialValue]);
  
  return {
    value,
    error,
    touched,
    isValid: !error,
    handleChange,
    handleBlur,
    validate,
    reset
  };
};

/**
 * Custom hook for form-level validation
 * @param {object} validators - Object with field names as keys and validator functions as values
 * @returns {object} Form validation state and handlers
 */
export const useFormValidation = (validators = {}) => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  
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
  
  const validateForm = useCallback((formData) => {
    const newErrors = {};
    let isFormValid = true;
    
    Object.keys(validators).forEach(fieldName => {
      const validator = validators[fieldName];
      const value = formData[fieldName];
      const result = validator(value);
      
      if (!result.isValid) {
        newErrors[fieldName] = result.message;
        isFormValid = false;
      }
    });
    
    setErrors(newErrors);
    return isFormValid;
  }, [validators]);
  
  const setFieldTouched = useCallback((fieldName) => {
    setTouched(prev => ({
      ...prev,
      [fieldName]: true
    }));
  }, []);
  
  const resetForm = useCallback(() => {
    setErrors({});
    setTouched({});
  }, []);
  
  return {
    errors,
    touched,
    validateField,
    validateForm,
    setFieldTouched,
    resetForm
  };
};

export default useFieldValidation;
