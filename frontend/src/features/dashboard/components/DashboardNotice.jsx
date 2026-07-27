import { Alert } from '../../../components/feedback/Alert';

export function DashboardNotice({ title, children, variant = 'information' }) {
  return (
    <Alert variant={variant}>
      <p className="font-semibold">{title}</p>
      <div className="mt-1 leading-6">{children}</div>
    </Alert>
  );
}
