const express = require('express');

const notFound = require('./middleware/not-found');
const errorHandler = require('./middleware/error-handler');
const apiRouter = require('./routes');

const app = express();

app.disable('x-powered-by');

app.use('/api/v1', apiRouter);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
