export const formatLabel = (value, fallback = 'Not specified') =>
  value
    ? String(value)
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ')
    : fallback;

export const formatDate = (value, fallback = 'Not specified') => {
  if (!value) {
    return fallback;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? fallback
    : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date);
};

export const formatDateTime = (value, fallback = 'Not recorded') => {
  if (!value) {
    return fallback;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? fallback
    : new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(date);
};
