'use strict';

const Bluebird = require('bluebird');
const axios = require('axios');
const url = require('url');

/*
 * opts: Object({ clientId, clientSecret, domainUrl, audience })
 */
module.exports = function getClientAuth (opts) {
  const body = {
    'grant_type': 'client_credentials',
    'client_id': opts.clientId,
    'client_secret': opts.clientSecret,
    'audience': opts.audience
  };
  return Bluebird
    .try(() => axios.post(url.resolve(opts.domainUrl, '/oauth/token'), body))
    .catch(error => {
      console.log('Could not perform client_credentials grant');
      throw error;
    })
    .then(response => response.data);
};
