const variants = {
  panel: 'bg-card p-5 shadow-card sm:p-6',
  summary: 'bg-card p-4 shadow-card',
};

export function Card({
  children,
  className = '',
  variant = 'panel',
  ...props
}) {
  return (
    <section
      className={`rounded-card ${variants[variant] || variants.panel} ${className}`}
      {...props}
    >
      {children}
    </section>
  );
}
