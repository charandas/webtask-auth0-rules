'use strict';

const Express = require('express');
const serveStatic = require('serve-static');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const setupSecretsMiddleware = require('./middleware/secrets');
const rules = require('./middleware/rules');
const isOwnerMiddleware = require('./middleware/isOwner');

const app = Express();

app.use(cors());
app.use(bodyParser.json());
app.use(serveStatic('public'));
app.use(setupSecretsMiddleware);
app.get('/api/rules', isOwnerMiddleware, rules.getRulesMiddleware);
app.get('/api/invalid-rules', isOwnerMiddleware, rules.getInvalidRulesMiddleware);

app.get('*/', (_, res) => res.sendFile(path.resolve(__dirname, '..', 'public', 'index.html')));

module.exports = app;
