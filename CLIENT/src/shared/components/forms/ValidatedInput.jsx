import { forwardRef } from 'react';

const ValidatedInput = forwardRef(({
  label,
  required = false,
  error,
  touched,
  className = '',
  inputClassName = '',
  ...props
}, ref) => {
  const baseInputClasses = "h-12 rounded-[14px] border px-4 text-[color:var(--neutral-800)] shadow-sm outline-none transition focus:shadow-[0_0_0_3px_rgba(5,136,240,0.18)]";
  const errorClasses = "border-red-500 focus:border-red-500";
  const normalClasses = "border-[color:var(--neutral-200)] focus:border-[color:var(--brand-600)]";
  
  const inputClasses = `${baseInputClasses} ${
    touched && error ? errorClasses : normalClasses
  } ${inputClassName}`;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-[color:var(--neutral-700)]">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        ref={ref}
        className={inputClasses}
        {...props}
      />
      {touched && error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
});

ValidatedInput.displayName = 'ValidatedInput';

export default ValidatedInput;
