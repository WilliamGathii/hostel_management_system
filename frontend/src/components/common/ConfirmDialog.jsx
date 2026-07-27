import { LuX } from 'react-icons/lu';

import { Button } from './Button';

export function ConfirmDialog({
  cancelLabel = 'Cancel',
  confirmLabel = 'Confirm',
  description,
  isLoading = false,
  onCancel,
  onConfirm,
  title,
  variant = 'danger',
}) {
  return (
    <div
      aria-labelledby="confirm-dialog-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-primary/35 p-4"
      role="dialog"
    >
      <div className="w-full max-w-md rounded-card bg-card p-5 shadow-xl sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              className="text-lg font-bold text-text"
              id="confirm-dialog-title"
            >
              {title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
          </div>
          <button
            aria-label="Close confirmation"
            className="rounded-card p-2 text-muted hover:bg-page hover:text-text focus-visible:outline-2 focus-visible:outline-primary"
            onClick={onCancel}
            type="button"
          >
            <LuX aria-hidden="true" className="size-5" />
          </button>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button onClick={onCancel} variant="secondary">
            {cancelLabel}
          </Button>
          <Button isLoading={isLoading} onClick={onConfirm} variant={variant}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
