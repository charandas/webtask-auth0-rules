'use strict';

const Bluebird = require('bluebird');
const jwt = require('jsonwebtoken');

const jwkToPem = require('jwk-to-pem');
const getAlorithms = require('jwk-allowed-algorithms');

function getKeyInfo (jwk, isPrivate = false) {
  if (jwk.kty === 'oct' && jwk.k) {
    return {
      secret: new Buffer(jwk.k, 'base64'),
      algorithms: [(jwk.alg || 'HS512')]
    };
  }
  return {
    secret: jwkToPem(jwk, { private: isPrivate }),
    algorithms: getAlorithms(jwk)
  };
}

const jwtVerifyAsync = Bluebird.promisify(jwt.verify, jwt);

module.exports = function jwtVerify (token, jwk) {
  let p;
  try {
    const keyInfo = getKeyInfo(jwk);
    const localOptions = {
      algorithms: keyInfo.algorithms
    };
    p = jwtVerifyAsync(token, keyInfo.secret, localOptions);
  } catch (e) {
    /* istanbul ignore next */
    p = Bluebird.reject(e);
  }
  return p;
};
