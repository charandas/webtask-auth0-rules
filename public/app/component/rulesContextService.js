import get from 'lodash/get';
import Bluebird from 'bluebird';
import auth0 from 'auth0-js';
import config from 'webtask-auth0-rules/config.json!json';

import axios from './axios';

const webAuth = Bluebird.promisifyAll(new auth0.WebAuth({
  clientID: config.clientId,
  domain: config.domainUrl,
  redirectUri: config.redirectUrl,
  responseType: 'id_token token',
  responseMode: 'fragment',
  scope: 'openid',
  audience: config.customRulesApiAudience
}));

function renewTokens () {
  return webAuth
    .renewAuthAsync({
      // Definitely had to use false, otherwise IFrame handler timesout in auth0-js
      usePostMessage: false
    });
}

export default function rulesContextService () {
  'ngInject';
  // FIX: pass cancelRefresh in for actual
  function getContext (cancelRefresh) {
    const bearerToken = window.localStorage.getItem('access_token');
    return axios
      .get('/api/rules', {
        headers: {
          'Authorization': `Bearer ${bearerToken}`
        }
      })
      .then(response => get(response, 'data'))
      .catch(error => {
        console.log(error);
        if (error.response.status === 401) {
          return renewTokens()
            .then(() => {
              // with the difference that the recurring task lives
              throw error;
            });
        }
        cancelRefresh();
        throw error;
      });
  }

  return {
    get: getContext
  };
}
