const jwt = require('jsonwebtoken');

const { env } = require('../config/env');

const JWT_ALGORITHM = 'HS256';
const ACCESS_TOKEN_PURPOSE = 'access';
const REQUIRED_PASSWORD_CHANGE_PURPOSE = 'required_password_change';
const REQUIRED_PASSWORD_CHANGE_EXPIRES_IN = '10m';

const signAuthToken = ({ id, role, token_version: tokenVersion = 0 }) =>
  jwt.sign(
    {
      purpose: ACCESS_TOKEN_PURPOSE,
      role,
      credentialVersion: Number(tokenVersion),
    },
    env.jwtSecret,
    {
      algorithm: JWT_ALGORITHM,
      expiresIn: env.jwtExpiresIn,
      subject: String(id),
    }
  );

const verifySignedToken = (token) =>
  jwt.verify(token, env.jwtSecret, {
    algorithms: [JWT_ALGORITHM],
  });

const requirePurpose = (payload, purpose) => {
  if (payload.purpose !== purpose) {
    throw new jwt.JsonWebTokenError('invalid token purpose');
  }

  return payload;
};

const verifyAuthToken = (token) =>
  requirePurpose(verifySignedToken(token), ACCESS_TOKEN_PURPOSE);

const signRequiredPasswordChangeToken = ({
  id,
  token_version: tokenVersion = 0,
}) =>
  jwt.sign(
    {
      purpose: REQUIRED_PASSWORD_CHANGE_PURPOSE,
      credentialVersion: Number(tokenVersion),
    },
    env.jwtSecret,
    {
      algorithm: JWT_ALGORITHM,
      expiresIn: REQUIRED_PASSWORD_CHANGE_EXPIRES_IN,
      subject: String(id),
    }
  );

const verifyRequiredPasswordChangeToken = (token) =>
  requirePurpose(verifySignedToken(token), REQUIRED_PASSWORD_CHANGE_PURPOSE);

module.exports = {
  ACCESS_TOKEN_PURPOSE,
  JWT_ALGORITHM,
  REQUIRED_PASSWORD_CHANGE_EXPIRES_IN,
  REQUIRED_PASSWORD_CHANGE_PURPOSE,
  signAuthToken,
  signRequiredPasswordChangeToken,
  verifyAuthToken,
  verifyRequiredPasswordChangeToken,
};
