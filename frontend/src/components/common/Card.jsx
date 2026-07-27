export function Card({ children, className = '' }) {
  return (
    <section
      className={`rounded-card border border-border bg-card p-5 shadow-card sm:p-6 ${className}`}
    >
      {children}
    </section>
  );
}
