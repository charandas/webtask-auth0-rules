'use strict';

const Bluebird = require('bluebird');
const getMgmtClient = require('./get-management-client');

function ruleIds (rules) {
  return rules.reduce((result, rule) => {
    result.push({
      ruleId: rule.id,
      script: rule.script
    });
    return result;
  }, []);
}

function reduceClientAndRules (rulesContext) {
  return rulesContext.clients.reduce((result, client) => {
    const clientId = client.client_id;
    const clientName = client.name;
    const _rules = rulesContext.rules.filter(rule => {
      const clientNameMatched = rule.script.indexOf(`context.clientName === '${clientName}'`) !== -1;
      const clientIdMatched = rule.script.indexOf(`context.clientId === '${clientId}'`) !== -1;
      return clientNameMatched || clientIdMatched;
    });
    result.push({ clientId, clientName, rules: ruleIds(_rules) });
    return result;
  }, []);
}

module.exports = function getRulesMiddleware (req, res, next) {
  const clientId = req.webtaskContext.secrets.clientId;
  const clientSecret = req.webtaskContext.secrets.clientSecret;
  const baseUrl = req.webtaskContext.secrets.baseUrl;
  const audience = req.webtaskContext.secrets.audience;
  getMgmtClient({ clientId, clientSecret, baseUrl, audience })
    .then(client => {
      return Bluebird
        .props({
          rules: client.rules.getAll(),
          clients: client.clients.getAll()
        });
    })
    .then(reduceClientAndRules)
    .then(result => res.json(result))
    .catch(error => {
      console.log(error);
      res.status(500).send('Could not get rules');
    });
};
