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

function reduceClientAndRules ({ rules, clients }) {
  return clients.reduce((result, client) => {
    const { client_id: clientId, name: clientName } = client;
    const _rules = rules.filter(rule => {
      const clientNameMatched = rule.script.indexOf(`context.clientName === '${clientName}'`) !== -1;
      const clientIdMatched = rule.script.indexOf(`context.clientId === '${clientId}'`) !== -1;
      return clientNameMatched || clientIdMatched;
    });
    result.push({ clientId, clientName, rules: ruleIds(_rules) });
    return result;
  }, []);
}

module.exports = function getRulesMiddleware (req, res, next) {
  getMgmtClient()
    .then(client => {
      return Bluebird
        .props({
          rules: client.rules.getAll(),
          clients: client.clients.getAll()
        });
    })
    .then(reduceClientAndRules)
    .then(result => res.send(result));
};
