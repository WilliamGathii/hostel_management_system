const variants = {
  neutral: 'bg-page text-muted ring-1 ring-inset ring-border',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  error: 'bg-error-soft text-error',
  information: 'bg-information-soft text-information',
};

export function StatusChip({ children, variant = 'neutral' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold leading-5 ${variants[variant] || variants.neutral}`}
    >
      {children}
    </span>
  );
}
