export function PageContainer({ children, className = '' }) {
  return (
    <div
      className={`mx-auto w-full max-w-[90rem] px-4 py-5 sm:px-6 sm:py-7 lg:px-8 ${className}`}
    >
      {children}
    </div>
  );
}
