import { forwardRef } from 'react';

export const SelectField = forwardRef(function SelectField(
  { children, className = '', error, label, name, required = false, ...props },
  ref
) {
  const errorId = error ? `${name}-error` : undefined;

  return (
    <div className={className}>
      <label
        className="mb-1.5 block text-sm font-semibold text-text"
        htmlFor={name}
      >
        {label}
        {required ? <span className="ml-1 text-error">*</span> : null}
      </label>
      <select
        aria-describedby={errorId}
        aria-invalid={Boolean(error)}
        className="min-h-11 w-full rounded-card border border-border bg-card px-3.5 py-2.5 text-sm text-text outline-none hover:border-periwinkle focus:border-primary focus:ring-3 focus:ring-primary-soft disabled:bg-page disabled:text-muted"
        id={name}
        name={name}
        ref={ref}
        {...props}
      >
        {children}
      </select>
      {error ? (
        <p className="mt-1.5 text-sm text-error" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  );
});
