# Auth0 Rules App

## API Specs

`GET /api/rules`: Uses Auth0 Mangement APIv2 to get a `RulesContext`, where the context is defined as:

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

## Frontend Deployment

I suggest you use Github pages or similar. You would need to bundle the app like so:

1. Copy `public/sample-config.json` to `public/config.json`, and make appropriate modifications there.
2. `npm run frontend`
3. `git add public`
4. `git commit -m "Deploy frontend"`
5. `git push && git subtree push --prefix public origin gh-pages`

## Backend Deployment

### Webtask

Note that any mention of webpack and its build configuration is only supplied for running on webtask.

1. Copy `sample-config.json` to a file called `config.json`, and modify `clientId`, `clientSecret`, `domainUrl` and `audience`. Also, supply your `webtaskToken` if applicable, by putting in the result of `wt profile ls --show-token`.
2. Next, run `npm run deploy-webtask` to deploy the node backend.

### Other Cloud Environments

Clone this repo, run npm install, and run the node process as you would do. (Docker build coming soon.)

```
git clone git@github.com:charandas/webtask-auth0-rules.git
npm install
node ./
```
