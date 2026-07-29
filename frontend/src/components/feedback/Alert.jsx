import {
  LuCircleAlert,
  LuCircleCheck,
  LuInfo,
  LuTriangleAlert,
} from 'react-icons/lu';

const variants = {
  success: {
    className: 'bg-success-soft text-success',
    Icon: LuCircleCheck,
  },
  error: {
    className: 'bg-error-soft text-error',
    Icon: LuCircleAlert,
  },
  warning: {
    className: 'bg-warning-soft text-warning',
    Icon: LuTriangleAlert,
  },
  information: {
    className: 'bg-information-soft text-information',
    Icon: LuInfo,
  },
};

export function Alert({
  children,
  className: additionalClassName = '',
  variant = 'information',
}) {
  const { className, Icon } = variants[variant] || variants.information;

  return (
    <div
      className={`flex items-start gap-3 rounded-card px-4 py-3 text-sm leading-6 ${className} ${additionalClassName}`}
      role={variant === 'error' ? 'alert' : 'status'}
    >
      <Icon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}
