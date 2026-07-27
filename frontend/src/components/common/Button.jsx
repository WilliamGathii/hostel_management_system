import { LuLoaderCircle } from 'react-icons/lu';

const variants = {
  primary:
    'bg-primary text-white shadow-sm hover:bg-primary-hover focus-visible:outline-primary',
  secondary:
    'bg-periwinkle-light text-primary hover:bg-periwinkle focus-visible:outline-primary',
  danger:
    'bg-error text-white hover:opacity-90 focus-visible:outline-error',
  ghost:
    'bg-transparent text-muted hover:bg-page hover:text-primary focus-visible:outline-primary',
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
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-card px-4 py-2.5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
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
