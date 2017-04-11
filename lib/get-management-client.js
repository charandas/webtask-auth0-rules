'use strict';

const Bluebird = require('bluebird');
const getClientAuth = require('./get-client-auth');
const ManagementClient = require('auth0').ManagementClient;

const baseUrl = 'https://mydomain.auth0.com';
const clientId = 'MY_CLIENT_ID';
const clientSecret = 'MY_CLIENT_SECRET';
const audience = 'https://mydomain.auth0.com/api/v2/';
const timeout = 5000;

let expiration = 0;
let token;

function _getClientAuthOpts () {
  if (expiration > Date.now()) {
    return Bluebird.resolve(token);
  }

  return getClientAuth({ baseUrl, clientId, clientSecret, timeout, audience })
    .tap(saveClientAuthOpts)
    .then(result => result.access_token);
}

// Internal Methods
function saveClientAuthOpts (res) {
  token = res.access_token;
  // Have reissuance scheduled slightly (~15sec) in advance
  expiration = Date.now() - 15000 + (res.expires_in * 1000);
}

module.exports = () => {
  return _getClientAuthOpts()
    .then(token => {
      return new ManagementClient({
        token,
        domain: 'humanflow.auth0.com'
      });
    });
};
