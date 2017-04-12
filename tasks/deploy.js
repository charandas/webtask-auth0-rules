const Sandbox = require('sandboxjs');
const fs = require('fs');
const config = require('../config.json');
const pjson = require('../package.json');

var profile = Sandbox.fromToken(config.webtaskToken);

fs.readFile(`./build/${pjson.name}.js`, function (err, code) {
  if (err) {
    throw err;
  }

  profile.create(code.toString(), {
    name: pjson.name,
    secrets: config
  }, function (error, webtask) {
    if (error) {
      throw error;
    }

    /* eslint no-console: 0 */
    console.log(webtask.url);
  });
});
