'use strict';

const Bluebird = require('bluebird');
const axios = require('axios');
const url = require('url');

module.exports = function getClientAuth ({ baseUrl, clientId, clientSecret, timeout, audience }) {
  const body = {
    'grant_type': 'client_credentials',
    'client_id': clientId,
    'client_secret': clientSecret,
    audience
  };
  return Bluebird
    .try(() => {
      return axios
      .post(url.resolve(baseUrl, '/oauth/token'), body)
      .catch(error => {
        console.log('Could not perform client_credentials grant');
        throw error;
      });
    })
    .then(response => response.data);
};
