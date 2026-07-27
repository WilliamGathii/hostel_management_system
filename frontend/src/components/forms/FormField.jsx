import { forwardRef } from 'react';

export const FormField = forwardRef(function FormField(
  { label, name, error, hint, className = '', required = false, ...inputProps },
  ref
) {
  const errorId = error ? `${name}-error` : undefined;
  const hintId = hint && !error ? `${name}-hint` : undefined;

  return (
    <div className={className}>
      <label
        className="mb-1.5 block text-sm font-semibold text-text"
        htmlFor={name}
      >
        {label}
        {required ? <span className="ml-1 text-error">*</span> : null}
      </label>
      <input
        aria-describedby={errorId || hintId}
        aria-invalid={Boolean(error)}
        className="min-h-11 w-full rounded-card border border-border bg-card px-3.5 py-2.5 text-sm text-text outline-none placeholder:text-muted/70 hover:border-periwinkle focus:border-primary focus:ring-3 focus:ring-primary-soft disabled:bg-page disabled:text-muted"
        id={name}
        name={name}
        ref={ref}
        {...inputProps}
      />
      {error ? (
        <p className="mt-1.5 text-sm text-error" id={errorId}>
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-sm text-muted" id={hintId}>
          {hint}
        </p>
      ) : null}
    </div>
  );
});
