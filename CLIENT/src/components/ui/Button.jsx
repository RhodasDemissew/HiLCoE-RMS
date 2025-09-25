// src/components/ui/Button.jsx
export function Button({ as: Comp = 'button', className = '', children, ...props }) {
    return (
      <Comp
        className={`inline-flex items-center justify-center rounded-lg px-5 py-3 font-medium ${className}`}
        {...props}
      >
        {children}
      </Comp>
    );
  }
  