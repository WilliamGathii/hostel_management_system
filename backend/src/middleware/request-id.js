const { randomUUID } = require('crypto');

const REQUEST_ID_HEADER = 'X-Request-Id';
const MAX_REQUEST_ID_LENGTH = 80;

const isUsableRequestId = (value) =>
  typeof value === 'string' &&
  value.length > 0 &&
  value.length <= MAX_REQUEST_ID_LENGTH;

const requestId = (req, res, next) => {
  const incomingRequestId = req.get(REQUEST_ID_HEADER);
  const id = isUsableRequestId(incomingRequestId)
    ? incomingRequestId
    : randomUUID();

  req.requestId = id;
  res.setHeader(REQUEST_ID_HEADER, id);

  next();
};

module.exports = requestId;
