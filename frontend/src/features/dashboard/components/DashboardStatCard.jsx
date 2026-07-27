import { Card } from '../../../components/common/Card';
import { StatusChip } from '../../../components/common/StatusChip';
import { LoadingSpinner } from '../../../components/feedback/LoadingSpinner';

const toneClasses = {
  primary: 'text-primary',
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-error',
  information: 'text-information',
  neutral: 'text-muted',
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
  unavailableText = 'No data',
}) {
  const hasValue = value !== null && value !== undefined;

  return (
    <Card
      className="flex min-h-32 flex-col justify-between"
      variant="summary"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted">{title}</p>
          <div className="mt-2 min-h-8">
            {isLoading ? (
              <LoadingSpinner label={`Loading ${title}`} />
            ) : (
              <p
                className={`font-semibold text-text ${
                  hasValue ? 'text-2xl' : 'text-sm'
                }`}
              >
                {hasValue ? value : unavailableText}
              </p>
            )}
          </div>
        </div>
        {Icon ? (
          <Icon
            aria-hidden="true"
            className={`size-5 shrink-0 ${
              toneClasses[tone] || toneClasses.primary
            }`}
          />
        ) : null}
      </div>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-2">
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
