// src/components/ui/Section.jsx
export function Section({ id, children, className = '' }) {
    return <section id={id} className={`py-16 ${className}`}>{children}</section>;
  }
  