'use strict';

const test = require('tape');

const rulesMiddleware = require('./rules');

test('Regex test', function (t) {
  let regexp = new RegExp(rulesMiddleware.CLIENT_IN_RULE_REGEXP_STRING, 'g');
  const str = 'context.clientName === \'Laundry App\'\\ncontext.clientName === "My App (Favorite one)"\\ncontext.clientId == \'myclient-id0_id1\'';
  const regexpResultsByMatchIndex = {
    0: {
      indexOne: 'clientName',
      indexTwo: 'Laundry App'
    },
    38: {
      indexOne: 'clientName',
      indexTwo: 'My App (Favorite one)'
    },
    86: {

      indexOne: 'clientId',
      indexTwo: 'myclient-id0_id1'
    }
  };

  t.plan(6);

  let regexpResult;
  while ((regexpResult = regexp.exec(str)) !== null) {
    const expectedResult = regexpResultsByMatchIndex[regexpResult.index];
    t.equal(regexpResult[1], expectedResult.indexOne);
    t.equal(regexpResult[2], expectedResult.indexTwo);
  }
});

test('Upsert into rules context using clientName', function (t) {
  const clients = {
    clientIds: ['id-1', 'id-2', 'id-3'],
    clientNames: ['App 1', 'App 2', 'App 3']
  };

  const rules = [
    { id: 'Rule 1', script: 'Script for rule 1' },
    { id: 'Rule 2', script: 'Script for rule 2' },
    { id: 'Rule 3', script: 'Script for rule 3' },
    { id: 'Rule 4', script: 'Script for rule 4' }
  ];

  t.plan(19);

  const rulesContext = [];
  clients.clientNames.forEach((clientName, index) => {
    rulesMiddleware._upsertEntry(rulesContext, {
      clients,
      rule: rules[index],
      findByEntity: 'clientName',
      entityValue: clientName
    });
    t.equal(rulesContext.length, index + 1);
    const pushed = rulesContext[rulesContext.length - 1];
    t.equal(pushed.clientName, clientName);
    t.equal(pushed.clientId, clients.clientIds[index]);
    t.equal(pushed.rules.length, 1);

    const pushedRule = pushed.rules[pushed.rules.length - 1];
    t.equal(pushedRule.ruleId, rules[index].id);
    t.equal(pushedRule.script, rules[index].script);
  });

  // Should not add
  rulesMiddleware._upsertEntry(rulesContext, {
    clients,
    rule: rules[3],
    findByEntity: 'clientName',
    entityValue: 'App 4' // non existing app
  });
  t.equal(rulesContext.length, 3); // unchanged
});

test('Upsert into rules context using clientId', function (t) {
  const clients = {
    clientIds: ['id-1', 'id-2', 'id-3'],
    clientNames: ['App 1', 'App 2', 'App 3']
  };

  const rules = [
    { id: 'Rule 1', script: 'Script for rule 1' },
    { id: 'Rule 2', script: 'Script for rule 2' },
    { id: 'Rule 3', script: 'Script for rule 3' },
    { id: 'Rule 4', script: 'Script for rule 4' }
  ];

  t.plan(19);

  const rulesContext = [];
  clients.clientIds.forEach((clientId, index) => {
    rulesMiddleware._upsertEntry(rulesContext, {
      clients,
      rule: rules[index],
      findByEntity: 'clientId',
      entityValue: clientId
    });
    t.equal(rulesContext.length, index + 1);
    const pushed = rulesContext[rulesContext.length - 1];
    t.equal(pushed.clientName, clients.clientNames[index]);
    t.equal(pushed.clientId, clientId);
    t.equal(pushed.rules.length, 1);

    const pushedRule = pushed.rules[pushed.rules.length - 1];
    t.equal(pushedRule.ruleId, rules[index].id);
    t.equal(pushedRule.script, rules[index].script);
  });

  // Should not add
  rulesMiddleware._upsertEntry(rulesContext, {
    clients,
    rule: rules[3],
    findByEntity: 'clientId',
    entityValue: 'id-4'
  });
  t.equal(rulesContext.length, 3); // unchanged
});

test('Upsert into rules context for same clientId', function (t) {
  // This is not how its usually. There are no repetions when run in actual code.
  // Here, we do this for convenience.
  const clients = {
    clientIds: ['id-1', 'id-1'],
    clientNames: ['App 1', 'App 1']
  };

  const rules = [
    { id: 'Rule 1', script: 'Script for rule 1' },
    { id: 'Rule 2', script: 'Script for rule 2' }
  ];

  t.plan(12);

  const rulesContext = [];
  clients.clientIds.forEach((clientId, index) => {
    rulesMiddleware._upsertEntry(rulesContext, {
      clients,
      rule: rules[index],
      findByEntity: 'clientId',
      entityValue: clientId
    });
    t.equal(rulesContext.length, 1);
    const pushed = rulesContext[rulesContext.length - 1];
    t.equal(pushed.clientName, clients.clientNames[index]);
    t.equal(pushed.clientId, clientId);
    t.equal(pushed.rules.length, index + 1);

    const pushedRule = pushed.rules[pushed.rules.length - 1];
    t.equal(pushedRule.ruleId, rules[index].id);
    t.equal(pushedRule.script, rules[index].script);
  });
});

test('Upsert invalid into rules context for same clientId', function (t) {
  // This is not how its usually. There are no repetions when run in actual code.
  // Here, we do this for convenience.
  const clients = {
    clientIds: ['id-1'],
    clientNames: ['App 1']
  };

  const rules = [
    { id: 'Rule 1', script: 'Script for rule 1' }
  ];

  t.plan(5);

  const rulesContext = [];
  rulesMiddleware._upsertEntryInvalid(rulesContext, {
    clients,
    rule: rules[0],
    findByEntity: 'clientId',
    entityValue: 'id-2' // invalid clientId
  });
  t.equal(rulesContext.length, 1);
  const pushed = rulesContext[rulesContext.length - 1];
  t.equal(pushed.clientId, 'id-2');
  t.equal(pushed.rules.length, 1);

  const pushedRule = pushed.rules[pushed.rules.length - 1];
  t.equal(pushedRule.ruleId, rules[0].id);
  t.equal(pushedRule.script, rules[0].script);
});

test('Upsert invalid into rules context for same clientName', function (t) {
  // This is not how its usually. There are no repetions when run in actual code.
  // Here, we do this for convenience.
  const clients = {
    clientIds: ['id-1'],
    clientNames: ['App 1']
  };

  const rules = [
    { id: 'Rule 1', script: 'Script for rule 1' }
  ];

  t.plan(5);

  const rulesContext = [];
  rulesMiddleware._upsertEntryInvalid(rulesContext, {
    clients,
    rule: rules[0],
    findByEntity: 'clientName',
    entityValue: 'App 2' // invalid clientId
  });
  t.equal(rulesContext.length, 1);
  const pushed = rulesContext[rulesContext.length - 1];
  t.equal(pushed.clientName, 'App 2');
  t.equal(pushed.rules.length, 1);

  const pushedRule = pushed.rules[pushed.rules.length - 1];
  t.equal(pushedRule.ruleId, rules[0].id);
  t.equal(pushedRule.script, rules[0].script);
});
