// src/components/ui/Container.jsx
export default function Container({ children, className = '', variant = 'default' }) {
  const baseClasses = "mx-auto max-w-7xl";
  const paddingClasses = variant === 'fluid' ? 'px-4 md:px-6 lg:px-8' : 'px-4 md:px-6 lg:px-8';
  
  return (
    <div className={`${baseClasses} ${paddingClasses} ${className}`}>
      {children}
    </div>
  );
}
  