const write = (level, message, meta) => {
  if (process.env.NODE_ENV === 'test') {
    return;
  }

  const output = `[${new Date().toISOString()}] ${level.toUpperCase()}: ${message}`;

  if (level === 'error') {
    console.error(output, meta || '');
    return;
  }

  if (level === 'warn') {
    console.warn(output, meta || '');
    return;
  }

  console.log(output, meta || '');
};

module.exports = {
  info: (message, meta) => write('info', message, meta),
  warn: (message, meta) => write('warn', message, meta),
  error: (message, meta) => write('error', message, meta),
};
