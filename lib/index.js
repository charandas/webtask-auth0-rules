'use strict';

const Express = require('express');
const serveStatic = require('serve-static');
const bodyParser = require('body-parser');
const cors = require('cors');
const setupSecretsMiddleware = require('./middleware/secrets');
const getRulesMiddleware = require('./middleware/rules');

const app = Express();

app.use(cors());
app.use(bodyParser.json());
app.use(serveStatic('public'));
app.use(setupSecretsMiddleware);
app.get('/api/rules', getRulesMiddleware);

module.exports = app;
