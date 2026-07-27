import {
  LuCircleAlert,
  LuCircleCheck,
  LuInfo,
  LuTriangleAlert,
} from 'react-icons/lu';

const variants = {
  success: {
    className: 'border-success/20 bg-success-soft text-success',
    Icon: LuCircleCheck,
  },
  error: {
    className: 'border-error/20 bg-error-soft text-error',
    Icon: LuCircleAlert,
  },
  warning: {
    className: 'border-warning/20 bg-warning-soft text-warning',
    Icon: LuTriangleAlert,
  },
  information: {
    className: 'border-information/20 bg-information-soft text-information',
    Icon: LuInfo,
  },
};

export function Alert({ children, variant = 'information' }) {
  const { className, Icon } = variants[variant] || variants.information;

  return (
    <div
      className={`flex items-start gap-3 rounded-card border px-4 py-3 text-sm ${className}`}
      role={variant === 'error' ? 'alert' : 'status'}
    >
      <Icon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}
