const write = (level, message, meta) => {
  if (process.env.NODE_ENV === 'test') {
    return;
  }

  const output = `[${new Date().toISOString()}] ${level.toUpperCase()}: ${message}`;
  const details = meta instanceof Error ? meta.message : meta || '';

  if (level === 'error') {
    console.error(output, details);
    return;
  }

  if (level === 'warn') {
    console.warn(output, details);
    return;
  }

  console.log(output, details);
};

module.exports = {
  info: (message, meta) => write('info', message, meta),
  warn: (message, meta) => write('warn', message, meta),
  error: (message, meta) => write('error', message, meta),
};
