import { forwardRef, useState } from 'react';
import { LuEye, LuEyeOff } from 'react-icons/lu';

export const PasswordField = forwardRef(function PasswordField(
  { label = 'Password', name, error, required = false, ...inputProps },
  ref
) {
  const [isVisible, setIsVisible] = useState(false);
  const errorId = error ? `${name}-error` : undefined;

  return (
    <div>
      <label
        className="mb-1.5 block text-sm font-semibold text-text"
        htmlFor={name}
      >
        {label}
        {required ? <span className="ml-1 text-error">*</span> : null}
      </label>
      <div className="relative">
        <input
          aria-describedby={errorId}
          aria-invalid={Boolean(error)}
          className="min-h-11 w-full rounded-card border border-border bg-card py-2.5 pr-12 pl-3.5 text-sm text-text outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary-soft"
          id={name}
          name={name}
          ref={ref}
          type={isVisible ? 'text' : 'password'}
          {...inputProps}
        />
        <button
          aria-label={isVisible ? 'Hide password' : 'Show password'}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-card text-muted hover:text-primary focus-visible:outline-2 focus-visible:outline-primary"
          onClick={() => setIsVisible((value) => !value)}
          title={isVisible ? 'Hide password' : 'Show password'}
          type="button"
        >
          {isVisible ? (
            <LuEyeOff className="size-5" aria-hidden="true" />
          ) : (
            <LuEye className="size-5" aria-hidden="true" />
          )}
        </button>
      </div>
      {error ? (
        <p className="mt-1.5 text-sm text-error" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  );
});
