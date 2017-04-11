# Webtask Auth0 Rules using express

Fashioned on the boilerplate repo provided [here](https://github.com/auth0/webtask-everywhere). Some specific details follow:

1. `webpack` for bundling server code
2. `jspm` for bundling frontend code, since that's what I am used to
3. `npm run deploy-webtask` would deploy it.

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
    {
      clientName: String,
      clientId  : String,
      rules     : Array({
        ruleId     : String,
        ruleScript : String
      })
    }
})
```
