import { forwardRef } from 'react';

export const TextAreaField = forwardRef(function TextAreaField(
  { className = '', error, label, name, required = false, rows = 4, ...props },
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
      <textarea
        aria-describedby={errorId}
        aria-invalid={Boolean(error)}
        className="w-full resize-y rounded-card border border-border bg-card px-3.5 py-2.5 text-sm text-text outline-none placeholder:text-muted/70 hover:border-periwinkle focus:border-primary focus:ring-3 focus:ring-primary-soft disabled:bg-page disabled:text-muted"
        id={name}
        name={name}
        ref={ref}
        rows={rows}
        {...props}
      />
      {error ? (
        <p className="mt-1.5 text-sm text-error" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  );
});
