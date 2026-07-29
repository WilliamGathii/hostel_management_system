const getBearerToken = (authorizationHeader) => {
  if (typeof authorizationHeader !== 'string') {
    return null;
  }

  const [scheme, token, extraValue] = authorizationHeader.trim().split(/\s+/);

  if (scheme !== 'Bearer' || !token || extraValue) {
    return null;
  }

  return token;
};

module.exports = {
  getBearerToken,
};
