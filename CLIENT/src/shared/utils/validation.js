// Validation utility functions for form validation
import { useState, useCallback } from 'react';

// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return {
    isValid: emailRegex.test(email),
    message: emailRegex.test(email) ? '' : 'Please enter a valid email address'
  };
};

// Phone number validation for Ethiopian numbers with +251 country code
export const validatePhone = (phone) => {
  // Remove all spaces and convert to uppercase for validation
  const cleanPhone = phone.replace(/\s/g, '').toUpperCase();
  
  // Check if it starts with +251
  if (!cleanPhone.startsWith('+251')) {
    return {
      isValid: false,
      message: 'Phone number must start with +251 (Ethiopian country code)'
    };
  }
  
  // Extract the number part after +251
  const numberPart = cleanPhone.substring(4);
  
  // Check if the number part contains only digits
  if (!/^\d+$/.test(numberPart)) {
    return {
      isValid: false,
      message: 'Phone number must contain only digits after +251'
    };
  }
  
  // Check if the number part has exactly 9 digits (Ethiopian mobile format)
  if (numberPart.length !== 9) {
    return {
      isValid: false,
      message: 'Phone number must have exactly 9 digits after +251 (e.g., +251993802012)'
    };
  }
  
  // Check if it starts with 9 (Ethiopian mobile numbers start with 9)
  if (!numberPart.startsWith('9')) {
    return {
      isValid: false,
      message: 'Ethiopian mobile numbers must start with 9 after +251'
    };
  }
  
  return {
    isValid: true,
    message: '',
    cleanedValue: cleanPhone
  };
};

// Password validation
export const validatePassword = (password) => {
  const errors = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    message: errors.length > 0 ? errors[0] : '',
    allErrors: errors
  };
};

// Name validation
export const validateName = (name, fieldName = 'Name') => {
  if (!name || name.trim().length === 0) {
    return {
      isValid: false,
      message: `${fieldName} is required`
    };
  }
  
  if (name.trim().length < 2) {
    return {
      isValid: false,
      message: `${fieldName} must be at least 2 characters long`
    };
  }
  
  if (!/^[a-zA-Z\s'-]+$/.test(name.trim())) {
    return {
      isValid: false,
      message: `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`
    };
  }
  
  return {
    isValid: true,
    message: ''
  };
};

// Student ID validation
export const validateStudentId = (studentId) => {
  if (!studentId || studentId.trim().length === 0) {
    return {
      isValid: false,
      message: 'Student ID is required'
    };
  }
  
  // Remove spaces and convert to uppercase
  const cleanId = studentId.trim().toUpperCase();
  
  // Check if it's alphanumeric and reasonable length
  if (!/^[A-Z0-9]+$/.test(cleanId)) {
    return {
      isValid: false,
      message: 'Student ID must contain only letters and numbers'
    };
  }
  
  if (cleanId.length < 3 || cleanId.length > 20) {
    return {
      isValid: false,
      message: 'Student ID must be between 3-20 characters'
    };
  }
  
  return {
    isValid: true,
    message: '',
    cleanedValue: cleanId
  };
};

// Confirm password validation
export const validateConfirmPassword = (password, confirmPassword) => {
  if (password !== confirmPassword) {
    return {
      isValid: false,
      message: 'Passwords do not match'
    };
  }
  
  return {
    isValid: true,
    message: ''
  };
};

// Real-time validation hook
export const useFieldValidation = (initialValue = '', validator) => {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);
  
  const validate = useCallback(() => {
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

// Form validation hook
export const useFormValidation = (validators) => {
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
