const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { env } = require('./config/env');
const requestId = require('./middleware/request-id');
const notFound = require('./middleware/not-found');
const errorHandler = require('./middleware/error-handler');
const apiRouter = require('./routes');
const logger = require('./utils/logger');

const app = express();

app.disable('x-powered-by');

const getAllowedOrigins = () => {
  const origins = [];

  if (env.frontendUrl) {
    origins.push(env.frontendUrl);
  }

  if (!env.isProduction) {
    origins.push('http://localhost:5173', 'http://127.0.0.1:5173');
  }

  return [...new Set(origins)];
};

const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      callback(null, true);
      return;
    }

    callback(null, getAllowedOrigins().includes(origin));
  },
  credentials: true,
};

morgan.token('request-id', (req) => req.requestId || '-');

app.use(requestId);
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(
  morgan(':method :url :status :response-time ms - :request-id', {
    skip: () => env.isTest,
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

app.use('/api/v1', apiRouter);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
