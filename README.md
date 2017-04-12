# Auth0 Rules App

## Secrets

The running webtask runs against my own auth0 domain using webtask secrets. You can have it run against yours by
going to https://webtask.io/make after launching the webtask. That's where you would want to define 4 secrets.

```
baseUrl      = your-domain.auth0.com
clientId     = CLIENT_ID_OF_A_NON_INTERACTIVE_APP // this app should have scopes for `read:clients` and `read:rules`
clientSecret = CLIENT_SECRET_OF_A_NON_INTERACTIVE_APP
audience     = your-domain.auth0.com/api/v2/
```

## API Specs

`GET /api/rules`: Uses Auth0 Mangement APIv2 to get an array of rules context, where the context is defined as:

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

Fashioned on the boilerplate repo provided [here](https://github.com/auth0/webtask-everywhere). You can deploy after carrying out the following steps:

1. Copy `sample-config.json` to a file called `config.json`, and modify the `clientId` and `clientSecret` as well as `domainUrl` and `audience`. Note that `"useWebtask": true` would only be applicable in a webpack build. It would otherwise not apply. Also, supply your `webtaskToken` if applicable, by putting in the result of `wt profile ls --show-token`.
2. Next, run `npm run deploy-webtask` to deploy the node backend.
