import { LuLoaderCircle } from 'react-icons/lu';

const variants = {
  primary:
    'bg-primary text-white hover:bg-primary-hover focus-visible:outline-primary',
  secondary:
    'border border-border bg-card text-text hover:bg-page focus-visible:outline-primary',
  danger: 'bg-error text-white hover:bg-red-800 focus-visible:outline-error',
  ghost:
    'bg-transparent text-muted hover:bg-primary-soft hover:text-primary focus-visible:outline-primary',
};

export function Button({
  children,
  className = '',
  isLoading = false,
  variant = 'primary',
  disabled,
  type = 'button',
  ...props
}) {
  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-card px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      type={type}
      {...props}
    >
      {isLoading ? (
        <LuLoaderCircle className="size-4 animate-spin" aria-hidden="true" />
      ) : null}
      {children}
    </button>
  );
}
