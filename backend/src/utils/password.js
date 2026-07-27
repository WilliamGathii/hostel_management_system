const bcrypt = require('bcrypt');

const { env } = require('../config/env');

const hashPassword = (password) => bcrypt.hash(password, env.bcryptSaltRounds);

const comparePassword = (password, passwordHash) =>
  bcrypt.compare(password, passwordHash);

module.exports = {
  hashPassword,
  comparePassword,
};
