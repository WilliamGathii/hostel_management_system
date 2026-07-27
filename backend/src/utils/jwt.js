const jwt = require('jsonwebtoken');

const { env } = require('../config/env');

const JWT_ALGORITHM = 'HS256';

const signAuthToken = ({ id, role }) =>
  jwt.sign(
    {
      role,
    },
    env.jwtSecret,
    {
      algorithm: JWT_ALGORITHM,
      expiresIn: env.jwtExpiresIn,
      subject: String(id),
    }
  );

const verifyAuthToken = (token) =>
  jwt.verify(token, env.jwtSecret, {
    algorithms: [JWT_ALGORITHM],
  });

module.exports = {
  JWT_ALGORITHM,
  signAuthToken,
  verifyAuthToken,
};
