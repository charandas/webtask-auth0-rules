'use strict';

const Bluebird = require('bluebird');
const getMgmtClient = require('../get-management-client');

const CLIENT_IN_RULE_REGEXP_STRING = 'context.(clientName|clientId) ={2,3} [\'"]([-_ \\(\\)a-zA-Z0-9]+)';

/*
 * opts: {
    findByEntity: "clientId" or "clientName",
    entityValue: "the-client-id" or "the-client-name",
    clients: reduced form containing all ids and names { clientIds, clientNames },
    rule: rule being processed
  }
 */
function _upsertEntryInvalid (rulesContext, opts) {
  let clientId;
  let clientName;

  const clients = opts.clients;
  const entityValue = opts.entityValue;
  const findByEntity = opts.findByEntity;
  const rule = opts.rule;

  if (opts.findByEntity === 'clientId') {
    const clientIdIndex = clients.clientIds.indexOf(entityValue);
    if (clientIdIndex === -1) {
      clientId = entityValue;
    }
  } else if (opts.findByEntity === 'clientName') {
    const clientNameIndex = clients.clientNames.indexOf(entityValue);
    if (clientNameIndex === -1) {
      clientName = entityValue;
    }
  }

  // That is, if any invalid values of client id and client name were found
  if (clientId || clientName) {
    // Upsert rules
    const found = rulesContext.find(contextItem => {
      return contextItem[findByEntity] === opts.entityValue;
    });

    const rules = found ? found.rules : [];
    rules.push({ ruleId: rule.id, script: rule.script });
    if (!found) { // insert new entry
      rulesContext.push({ clientId, clientName, rules });
    }
  }
}

/*
 * @param: opts: {
    findByEntity: "clientId" or "clientName",
    entityValue: "the-client-id" or "the-client-name",
    clients: reduced form containing all ids and names { clientIds, clientNames },
    rule: rule being processed
  }
 */
function _upsertEntry (rulesContext, opts) {
  let clientId;
  let clientName;

  const clients = opts.clients;
  const entityValue = opts.entityValue;
  const findByEntity = opts.findByEntity;
  const rule = opts.rule;

  if (opts.findByEntity === 'clientId') {
    const clientIdIndex = clients.clientIds.indexOf(entityValue);
    if (clientIdIndex !== -1) {
      clientId = entityValue;
      clientName = clients.clientNames[clientIdIndex];
    }
  } else if (opts.findByEntity === 'clientName') {
    const clientNameIndex = clients.clientNames.indexOf(entityValue);
    if (clientNameIndex !== -1) {
      clientName = entityValue;
      clientId = clients.clientIds[clientNameIndex];
    }
  }

  if (!clientId || !clientName) { // we have an invalid rule, bail out
    return;
  }

  const found = rulesContext.find(contextItem => {
    return contextItem[findByEntity] === opts.entityValue;
  });

  // Upsert rules
  const rules = found ? found.rules : [];
  rules.push({ ruleId: rule.id, script: rule.script });
  if (!found) { // insert new entry
    rulesContext.push({ clientId, clientName, rules });
  }
}

function reduceClientAndRules (rulesContext, reportInvalidsOnly) {
  // clients.clientIds and clients.clientNames are aligned as far as indices.
  const clients = rulesContext.clients.reduce((result, client) => {
    result.clientIds.push(client.client_id);
    result.clientNames.push(client.name);
    return result;
  }, { clientIds: [], clientNames: [] });

  const upsertFn = reportInvalidsOnly ? _upsertEntryInvalid : _upsertEntry;

  return rulesContext.rules.reduce((result, rule) => {
    let regexp = new RegExp(CLIENT_IN_RULE_REGEXP_STRING, 'g');
    // position [1] and [2] in array are important.
    // [1] would be "clientId"/"clientName",
    // and [2] would be corresponding value
    let regexpResult;
    while ((regexpResult = regexp.exec(rule.script)) !== null) {
      upsertFn(result, {
        findByEntity: regexpResult[1],
        entityValue: regexpResult[2],
        clients,
        rule
      });
    }
    return result;
  }, []);
}

exports.getRulesMiddleware = function getRulesMiddleware (req, res, next) {
  const clientId = req.secrets.clientId;
  const clientSecret = req.secrets.clientSecret;
  const domainUrl = req.secrets.domainUrl;
  const audience = req.secrets.audience;
  getMgmtClient({ clientId, clientSecret, domainUrl, audience })
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

exports.getInvalidRulesMiddleware = function getInvalidRulesMiddleware (req, res, next) {
  const clientId = req.secrets.clientId;
  const clientSecret = req.secrets.clientSecret;
  const domainUrl = req.secrets.domainUrl;
  const audience = req.secrets.audience;
  getMgmtClient({ clientId, clientSecret, domainUrl, audience })
    .then(client => {
      return Bluebird
        .props({
          rules: client.rules.getAll(),
          clients: client.clients.getAll()
        });
    })
    .then(result => reduceClientAndRules(result, true)) // ask for invalid only
    .then(result => res.json(result))
    .catch(error => {
      console.log(error);
      res.status(500).send('Could not get rules');
    });
};

// exported for testing only
exports.CLIENT_IN_RULE_REGEXP_STRING = CLIENT_IN_RULE_REGEXP_STRING;
exports._upsertEntry = _upsertEntry;
exports._upsertEntryInvalid = _upsertEntryInvalid;
