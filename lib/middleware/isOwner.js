'use strict';

const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');

module.exports = jwt({
  // Dynamically provide a signing key
  // based on the kid in the header and
  // the singing keys provided by the JWKS endpoint.
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://humanflow.auth0.com/.well-known/jwks.json`
  }),
  audience: 'http://humanflow.io/auth0-rules',
  issuer: `https://humanflow.auth0.com/`,
  algorithms: ['RS256']
});
