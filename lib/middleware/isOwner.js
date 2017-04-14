'use strict';

const BEARER_PREFIX = /^bearer /i;
const Bluebird = require('bluebird');
const jwtVerify = require('../utils/jwtVerify');
const axios = require('axios');
const url = require('url');

let jwks;

// Get the well known JWKs and cache them
function getJwks (domainUrl) {
  if (jwks) {
    return jwks;
  }

  return Bluebird
    .resolve(axios.get(url.resolve(domainUrl, '.well-known/jwks.json')))
    .then(response => response.data)
    .tap(response => {
      jwks = response;
    });
}

module.exports = function isOwnerMiddleware (req, res, next) {
  const authHeader = req.get('authorization');
  return Bluebird
    .resolve(getJwks(req.secrets.domainUrl))
    .then(() => {
      if (!BEARER_PREFIX.test(authHeader)) {
        throw new Error('Authorization header does not start with "bearer "');
      }
      return authHeader.substring('bearer '.length);
    })
    .then(token => jwtVerify(token, jwks.keys[0]))
    .tap(verified => {
      if (verified.aud !== 'http://humanflow.io/auth0-rules' ||
        verified.exp > Date.now()) {
        throw new Error('Auth expired');
      }
    })
    .catch(err => {
      console.log(err);
      res.status(401).send('User authentication invalid');
    })
    .asCallback(next);
};
