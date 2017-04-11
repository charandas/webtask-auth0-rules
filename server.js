const App = require('./lib');

const port = process.env.PORT || 8080;

App.listen(port, function () {
  console.log(`Server started on port: ${port}`);
});
