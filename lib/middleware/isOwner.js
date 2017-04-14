'use strict';

const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const url = require('url');

module.exports = function wrapJwtMiddleware (req, res, next) {
  const urlEndChar = req.secrets.domainUrl.substr(-1);
  const issuer = urlEndChar !== '/' ? `${req.secrets.domainUrl}/` : req.secrets.domainUrl;
  const audience = req.secrets.audienceClaim;
  const jwtMiddleware = jwt({
    // Dynamically provide a signing key
    // based on the kid in the header and
    // the singing keys provided by the JWKS endpoint.
    secret: jwksRsa.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: url.resolve(issuer, '.well-known/jwks.json')
    }),
    audience,
    issuer,
    algorithms: ['RS256']
  });
  return jwtMiddleware.call(jwtMiddleware, req, res, next);
};
