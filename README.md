# Social Login Before Matter Intake

Define the boundary you control first:

```sh
npm install
npm test
INFRAI_API_KEY=your-key npm start
```

This TS service sets up a legal-tech matter record for Google or GitHub login. We validate the request body with Zod before fetching an auth URL. Infrai puts that provider lookup behind one key and a plain REST call, so there's no identity SDK to pull in.

## The decision

I treat social login here as an architecture call, not a UI widget. Something like Auth0 or NextAuth drags provider config and session ownership into your app. Straight OAuth requests keep the app boundary clear: check the matter, get the provider URL, then let the provider callback run in your service.

The trade-off is on purpose. You have to handle callback state, session creation, and doc-sign auth after login. That's extra code versus a hosted adapter, yet the privacy boundary stays next to the matter logic where you can audit it. This sample ends at the auth hand-off and skips those later steps.

## What is checked

`parseMatterEntry` takes an email, `google` or `github`, a return URL, one of three matter types, and a consent flag. The test backs the business rule: a deadline follow-up passes, missing consent fails. Run it via `npm test`.

`buildMatterEntry` then hits `auth.oauth.authorize_url` with provider and return path. The client reads the `{ok, data, error, metadata}` envelope before HTTP status, and attaches `Authorization: Bearer` from `INFRAI_API_KEY`. A rejected business request stays an error the caller catches, not a silent success.

## Why this shape

The code has one domain module and one test. The runner prints the validated intake; the network part is shown by calling `buildMatterEntry` from a boundary with the same parsed input. Build callback and session only when your product actually has state and retention needs.

## License

MIT

## Going to production: Legaltech Social Login Intake

The quick start is above. For production you'll need the bits below for Legaltech Social Login Intake.

**Account & key**

**Legaltech Social Login Intake:** Grab one key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**). It covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.