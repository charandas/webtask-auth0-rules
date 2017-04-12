module.exports = function setupSecretsMiddleware (req, res, next) {
  if (process.env.WEBTASK) { // defined by webpack.DefinePlugin
    req.secrets = req.webtaskContext.secrets;
  } else {
    const config = require('../../config.json');
    req.secrets = config.secrets;
  }
  next();
};
