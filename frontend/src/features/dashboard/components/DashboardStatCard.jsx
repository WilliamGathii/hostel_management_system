import { Card } from '../../../components/common/Card';
import { StatusChip } from '../../../components/common/StatusChip';
import { LoadingSpinner } from '../../../components/feedback/LoadingSpinner';

const toneClasses = {
  primary: 'bg-primary-soft text-primary',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  error: 'bg-error-soft text-error',
  information: 'bg-information-soft text-information',
  neutral: 'bg-page text-muted',
};

export function DashboardStatCard({
  title,
  value,
  Icon,
  description,
  status,
  statusVariant = 'neutral',
  tone = 'primary',
  isLoading = false,
  unavailableText = 'Not available yet',
}) {
  const hasValue = value !== null && value !== undefined;

  return (
    <Card className="flex min-h-40 flex-col justify-between">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted">{title}</p>
          <div className="mt-3 min-h-9">
            {isLoading ? (
              <LoadingSpinner label={`Loading ${title}`} />
            ) : (
              <p
                className={`font-semibold text-text ${
                  hasValue ? 'text-2xl' : 'text-base'
                }`}
              >
                {hasValue ? value : unavailableText}
              </p>
            )}
          </div>
        </div>
        {Icon ? (
          <span
            className={`grid size-10 shrink-0 place-items-center rounded-card ${
              toneClasses[tone] || toneClasses.primary
            }`}
          >
            <Icon aria-hidden="true" className="size-5" />
          </span>
        ) : null}
      </div>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-2">
        {description ? (
          <p className="max-w-xs text-xs leading-5 text-muted">{description}</p>
        ) : (
          <span />
        )}
        {status ? (
          <StatusChip variant={statusVariant}>{status}</StatusChip>
        ) : null}
      </div>
    </Card>
  );
}
