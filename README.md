# Webtask TOTP Blueprint using express

Fashioned on the boilerplate repo provided [here](https://github.com/auth0/webtask-everywhere). Some specific details follow:

1. `webpack` for bundling server code
2. `jspm` for bundling frontend code, since that's what I am used to
3. `npm run deploy-webtask` would deploy it.

## API Specs

1. `GET /api/secret`: Get a base32 encoded secret per recommendations in Google Authenticator [wiki](https://github.com/google/google-authenticator/wiki/Key-Uri-Format#examples)
2. `POST /api/verify`: Accepts `otp` in JSON body. Returns `{ didVerify: Bool }`

## Wish List

1. Persisting different secrets per user session, as opposed to just 1 secret.
2. Better UX for the demo.
3. Also support HOTP, and change repo name to webtask-otp
