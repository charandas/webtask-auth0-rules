'use strict';

const Bluebird = require('bluebird');
const getClientAuth = require('./get-client-auth');

let auth0;
if (process.env.WEBTASK) {
  auth0 = require('auth0@2.4.0');
} else {
  auth0 = require('auth0');
}
const ManagementClient = auth0.ManagementClient;

let expiration = 0;
let token;

function _getClientAuthOpts (opts) {
  if (expiration > Date.now()) {
    return Bluebird.resolve(token);
  }

  return getClientAuth(opts)
    .tap(saveClientAuthOpts)
    .then(result => result.access_token);
}

function saveClientAuthOpts (res) {
  token = res.access_token;
  // Have reissuance scheduled slightly (~15sec) in advance
  expiration = Date.now() - 15000 + (res.expires_in * 1000);
}

/*
 * opts: Object({ clientId, clientSecret, domainUrl, audience })
 */
module.exports = function getClientAuth (opts) {
  return _getClientAuthOpts(opts)
    .then(token => {
      return new ManagementClient({
        token,
        domain: opts.domainUrl.replace(/https:\/\//i, '')
      });
    });
};
