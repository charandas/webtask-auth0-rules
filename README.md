# Auth0 Rules App

## API (Protected by Auth0 Authentication)

1. `GET /api/rules`: Uses Auth0 Mangement APIv2 to get a `RulesContext`, where the context is defined as:
  ```js
  Array({
    clientName: String,
    clientId  : String,
    rules     : Array({
      ruleId     : String,
      ruleScript : String
    })
  })
  ```

2. `GET /api/invalid-rules`: Uses Auth0 Management APIv2 to get a `RulesContext` (similar to above), with the difference that
only those rules are reported that had a `context.clientId ===` or `context.clientName` proceeded by a invalid id or name, one
that does not exist under your Auth0 account

## Frontend Deployment

I suggest you use Github pages or similar. You would need to bundle the app like so:

1. Copy `public/sample-config.json` to `public/config.json`, and make appropriate modifications there.
2. `npm run frontend`
3. `git add public`
4. `git commit -m "Deploy frontend"`
5. `git push && git subtree push --prefix public origin gh-pages`

## Backend

### Prerequisites

1. You would need 1 non interactive client in Auth0 that this API would use to access the Management APIv2.
2. You would need a custom API defined in the dashboard. This API would be used to refer to this custom app api itself. For this API, I highly recommend using RS256 cryptography.
3. You would need a test client of the custom API. This should be auto-created for you when the API is created.

### Architecture (short story)

1. Angular frontend app authenticates against this API, and gets `access_token` and such.
2. The frontend app used these tokens with bearer authorization to get the `RulesContext` (as defined above).
3. In the background, the custom api written in `node.js` calls the Management APIv2, assembles and sends all the results.
4. The angular app displays these results in a useable manner.


### Deployment begins

Copy `sample-config.json` to a file called `config.json`, and supply all pertinent values. The `audienceClaim`
refers to the `audience` value for this customer api itself, as defined in Auth0 dashboard.

1. **Webtask**: Note that any mention of webpack and its build configuration is only supplied for running on webtask:
  1. Supply your `webtaskToken` by putting in the result of `wt profile ls --show-token`.
  2. Next, run `npm run deploy-webtask` to deploy the node backend.

2: **Other Cloud Environments** (Docker build coming soon.):
  1. Clone this rep.
  2. Run `npm install --production` in the directory.
  3. Run the node process as you would do: `node ./`.
