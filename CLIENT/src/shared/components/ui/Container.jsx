// src/components/ui/Container.jsx
export default function Container({ children, className = '' }) {
    return <div className={`mx-auto max-w-full px-4 ${className}`}>{children}</div>;
  }
  