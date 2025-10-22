// src/components/ui/Container.jsx
export default function Container({ children, className = '' }) {
    return <div className={`mx-auto max-w-full px-40 ${className}`}>{children}</div>;
  }
  